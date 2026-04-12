import type { PaginationMeta, PaginationParams, DeepPartial } from '@retail-saas/types';

// ================================================
// @retail-saas/core - Base Classes & Abstractions
// ================================================

// ---- Base Entity ----

export abstract class BaseEntity {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial?: DeepPartial<BaseEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}

// ---- Base Repository Interface ----

export interface IRepository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findAll(params?: PaginationParams): Promise<{ data: T[]; meta: PaginationMeta }>;
  create(data: DeepPartial<T>): Promise<T>;
  update(id: string, data: DeepPartial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// ---- Base Service ----

export abstract class BaseService<T extends BaseEntity> {
  protected abstract repository: IRepository<T>;

  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async findAll(params?: PaginationParams): Promise<{ data: T[]; meta: PaginationMeta }> {
    return this.repository.findAll(params);
  }
}

// ---- Base Use Case ----

export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}

// ---- Value Objects ----

export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.validate(email)) {
      throw new Error(`Invalid email address: ${email}`);
    }
    this.value = email.toLowerCase().trim();
  }

  private validate(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// ---- Domain Errors ----

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
