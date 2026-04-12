import type { DomainEvent } from '@retail-saas/types';
import { generateId } from '@retail-saas/utils';

// ================================================
// @retail-saas/event-bus - In-Memory Event System
// ================================================
// Phase 0: Simple in-memory implementation
// Phase 1+: Replace với Redis Pub/Sub hoặc RabbitMQ

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void> | void;

export interface IEventBus {
  publish<T>(event: Omit<DomainEvent<T>, 'id' | 'occurredAt' | 'version'>): Promise<void>;
  subscribe<T>(eventType: string, handler: EventHandler<T>): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}

// ---- In-Memory Event Bus ----

export class InMemoryEventBus implements IEventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();
  private readonly eventLog: DomainEvent[] = [];
  private readonly maxLogSize: number;

  constructor(options: { maxLogSize?: number } = {}) {
    this.maxLogSize = options.maxLogSize || 1000;
  }

  /**
   * Publish một event tới tất cả subscribers
   */
  async publish<T>(
    eventData: Omit<DomainEvent<T>, 'id' | 'occurredAt' | 'version'>,
  ): Promise<void> {
    const event: DomainEvent<T> = {
      ...eventData,
      id: generateId(),
      occurredAt: new Date(),
      version: 1,
    };

    // Lưu vào event log (giới hạn kích thước)
    this.eventLog.push(event as DomainEvent);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }

    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.size === 0) {
      return;
    }

    // Execute handlers song song
    const promises = Array.from(handlers).map((handler) =>
      Promise.resolve(handler(event as DomainEvent)).catch((err: unknown) => {
        console.error(`[EventBus] Handler error for event "${event.type}":`, err);
      }),
    );

    await Promise.all(promises);
  }

  /**
   * Subscribe một handler cho event type
   */
  subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);
  }

  /**
   * Unsubscribe handler khỏi event type
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    this.handlers.get(eventType)?.delete(handler);
  }

  /**
   * Lấy event log (debug)
   */
  getEventLog(): DomainEvent[] {
    return [...this.eventLog];
  }

  /**
   * Xóa tất cả handlers (dùng trong test)
   */
  clearHandlers(): void {
    this.handlers.clear();
  }
}

// ---- Event Types Constants ----

export const EventTypes = {
  // Tenant events
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_SUSPENDED: 'tenant.suspended',

  // Auth events
  USER_REGISTERED: 'auth.user_registered',
  USER_LOGGED_IN: 'auth.user_logged_in',
  USER_LOGGED_OUT: 'auth.user_logged_out',
  PASSWORD_CHANGED: 'auth.password_changed',

  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];

// Singleton instance
export const eventBus = new InMemoryEventBus();

export default InMemoryEventBus;
