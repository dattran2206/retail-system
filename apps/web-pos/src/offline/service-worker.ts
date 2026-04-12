// ================================================
// PWA Offline Handler (Placeholder)
// ================================================
// Phase 0: Base structure for offline support
// Phase 1+: Implement offline-first patterns

/**
 * Kiểm tra trình duyệt có online không
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Queue offline actions để sync khi online lại
 */
export interface OfflineAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
}

const OFFLINE_QUEUE_KEY = 'retail_saas_offline_queue';

export function queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): void {
  const queue = getOfflineQueue();
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function getOfflineQueue(): OfflineAction[] {
  if (typeof localStorage === 'undefined') return [];
  const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
  return stored ? (JSON.parse(stored) as OfflineAction[]) : [];
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

/**
 * Register online/offline event listeners
 */
export function registerConnectivityListeners(
  onOnline: () => void,
  onOffline: () => void,
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}
