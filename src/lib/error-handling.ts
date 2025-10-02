// Error Handling Middleware for PlacementGuru APIs
// Centralized error handling, logging, and response formatting

import { NextResponse } from 'next/server';
import { collections } from './db';

export interface APIError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class ValidationError extends Error {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  statusCode = 401;
  code = 'AUTHENTICATION_ERROR';
  
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  statusCode = 403;
  code = 'AUTHORIZATION_ERROR';
  
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  code = 'NOT_FOUND_ERROR';
  
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends Error {
  statusCode = 500;
  code = 'DATABASE_ERROR';
  
  constructor(message: string = 'Database operation failed', public details?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// ========================================
// ERROR HANDLER WRAPPER
// ========================================

export const withErrorHandler = (handler: Function) => {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleAPIError(error, args[0]); // args[0] is typically the NextRequest
    }
  };
};

// ========================================
// CENTRALIZED ERROR HANDLING
// ========================================

export const handleAPIError = async (error: any, request?: any): Promise<NextResponse> => {
  // Log error for monitoring
  await logError(error, request);

  // Handle different error types
  if (error instanceof ValidationError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date()
    }, { status: error.statusCode });
  }

  if (error instanceof AuthenticationError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date()
    }, { status: error.statusCode });
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date()
    }, { status: error.statusCode });
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date()
    }, { status: error.statusCode });
  }

  if (error instanceof DatabaseError) {
    return NextResponse.json({
      success: false,
      error: 'Database operation failed',
      code: error.code,
      timestamp: new Date()
    }, { status: error.statusCode });
  }

  // Handle Firebase/Firestore errors
  if (error.code?.startsWith('firestore/') || error.code?.startsWith('firebase/')) {
    return NextResponse.json({
      success: false,
      error: 'Database service unavailable',
      code: 'SERVICE_UNAVAILABLE',
      timestamp: new Date()
    }, { status: 503 });
  }

  // Handle generic errors
  const statusCode = error.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message || 'An unexpected error occurred';

  return NextResponse.json({
    success: false,
    error: message,
    code: 'INTERNAL_ERROR',
    timestamp: new Date()
  }, { status: statusCode });
};

// ========================================
// ERROR LOGGING
// ========================================

const logError = async (error: any, request?: any) => {
  const errorLog = {
    timestamp: new Date(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode
    },
    request: request ? {
      url: request.url,
      method: request.method,
      headers: request.headers ? Object.fromEntries(request.headers.entries()) : {},
      userAgent: request.headers?.get('user-agent')
    } : null,
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  };

  // Log to console for development
  if (process.env.NODE_ENV !== 'production') {
    console.error('🚨 API Error:', errorLog);
  }

  // Store error log in database for monitoring
  try {
    const errorRef = collections.auditLogs().doc();
    await errorRef.set({
      id: errorRef.id,
      action: 'error',
      entityType: 'system',
      description: `API Error: ${error.name} - ${error.message}`,
      metadata: errorLog,
      createdAt: new Date()
    });
  } catch (logError) {
    // If we can't log to database, at least log to console
    console.error('Failed to log error to database:', logError);
  }
};

// ========================================
// SUCCESS RESPONSE HELPERS
// ========================================

export const createSuccessResponse = (data: any, message?: string, statusCode: number = 200) => {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date()
  }, { status: statusCode });
};

export const createPaginatedResponse = (
  data: any[], 
  pagination: { total: number; page: number; limit: number },
  message?: string
) => {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1
    },
    message,
    timestamp: new Date()
  });
};

// ========================================
// INPUT VALIDATION MIDDLEWARE
// ========================================

export const validateRequest = (schema: any) => {
  return (handler: Function) => {
    return async (...args: any[]) => {
      try {
        const request = args[0];
        let body;
        
        if (request.method !== 'GET') {
          body = await request.json();
          
          // Validate against schema
          const validation = schema(body);
          if (!validation.isValid) {
            throw new ValidationError('Request validation failed', {
              errors: validation.errors,
              warnings: validation.warnings
            });
          }
        }
        
        return await handler(...args);
      } catch (error) {
        return handleAPIError(error, args[0]);
      }
    };
  };
};

// ========================================
// RATE LIMITING HELPERS
// ========================================

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};

export class RateLimitError extends Error {
  statusCode = 429;
  code = 'RATE_LIMIT_EXCEEDED';
  
  constructor(message: string = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// ========================================
// ASYNC HANDLER WRAPPER
// ========================================

export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ========================================
// REQUEST LOGGING
// ========================================

export const logRequest = async (request: any, response?: any, duration?: number) => {
  if (process.env.NODE_ENV === 'development') {
    const log = {
      timestamp: new Date(),
      method: request.method,
      url: request.url,
      userAgent: request.headers?.get('user-agent'),
      status: response?.status,
      duration: duration ? `${duration}ms` : 'unknown'
    };
    
    console.log('📝 API Request:', log);
  }
  
  // Store request log for analytics (optional)
  try {
    const logRef = collections.auditLogs().doc();
    await logRef.set({
      id: logRef.id,
      action: 'api_request',
      entityType: 'system',
      description: `${request.method} ${request.url}`,
      metadata: {
        method: request.method,
        url: request.url,
        userAgent: request.headers?.get('user-agent'),
        status: response?.status,
        duration
      },
      createdAt: new Date()
    });
  } catch (error) {
    // Silently fail request logging
  }
};

// ========================================
// HEALTH CHECK UTILITIES
// ========================================

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    // Try a simple database operation
    await collections.systemSettings().limit(1).get();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

export const checkSystemHealth = async () => {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      database: await checkDatabaseHealth(),
      responseTime: `${Date.now() - startTime}ms`
    }
  };
  
  if (!health.checks.database) {
    health.status = 'unhealthy';
  }
  
  return health;
};