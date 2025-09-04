// API Logger utility for debugging and monitoring API calls

interface APILogEntry {
  timestamp: string;
  service: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  response?: any;
  status?: number;
  duration?: number;
  error?: any;
}

class APILogger {
  private static instance: APILogger;
  private logs: APILogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  private constructor() {}

  static getInstance(): APILogger {
    if (!APILogger.instance) {
      APILogger.instance = new APILogger();
    }
    return APILogger.instance;
  }

  logRequest(
    service: string,
    method: string,
    url: string,
    headers?: Record<string, string>,
    body?: any
  ): string {
    const logId = Date.now().toString();
    const entry: APILogEntry = {
      timestamp: new Date().toISOString(),
      service,
      method,
      url,
      headers: this.sanitizeHeaders(headers),
      body: this.sanitizeBody(body),
    };

    console.log(`\n[${service}] API Request`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`${method} ${url}`);
    if (headers && Object.keys(headers).length > 0) {
      console.log('Headers:', JSON.stringify(this.sanitizeHeaders(headers), null, 2));
    }
    if (body) {
      console.log('Body:', JSON.stringify(this.sanitizeBody(body), null, 2));
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    this.addLog(entry);
    return logId;
  }

  logResponse(
    logId: string,
    service: string,
    status: number,
    response: any,
    duration: number
  ): void {
    console.log(`\n[${service}] API Response`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Status: ${status}`);
    console.log(`Duration: ${duration}ms`);
    console.log('Response:', JSON.stringify(this.sanitizeResponse(response), null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Update the log entry if we can find it
    const lastLog = this.logs[this.logs.length - 1];
    if (lastLog) {
      lastLog.response = this.sanitizeResponse(response);
      lastLog.status = status;
      lastLog.duration = duration;
    }
  }

  logError(
    service: string,
    method: string,
    url: string,
    error: any,
    duration?: number
  ): void {
    console.log(`\n[${service}] API Error`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`${method} ${url}`);
    if (duration) {
      console.log(`Duration: ${duration}ms`);
    }
    console.log('Error:', error.message || error);
    if (error.stack) {
      console.log('Stack:', error.stack.split('\n').slice(0, 3).join('\n'));
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const entry: APILogEntry = {
      timestamp: new Date().toISOString(),
      service,
      method,
      url,
      error: error.message || error,
      duration,
    };
    this.addLog(entry);
  }

  private addLog(entry: APILogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
  }

  private sanitizeHeaders(headers?: Record<string, string>): Record<string, string> | undefined {
    if (!headers) return undefined;
    const sanitized = { ...headers };
    // Hide sensitive headers
    if (sanitized['Authorization']) {
      sanitized['Authorization'] = '***HIDDEN***';
    }
    if (sanitized['x-api-key']) {
      sanitized['x-api-key'] = '***HIDDEN***';
    }
    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    if (typeof body === 'string') return body;
    
    const sanitized = { ...body };
    // Hide sensitive fields
    if (sanitized.privateKey) {
      sanitized.privateKey = '***HIDDEN***';
    }
    if (sanitized.password) {
      sanitized.password = '***HIDDEN***';
    }
    return sanitized;
  }

  private sanitizeResponse(response: any): any {
    if (!response) return response;
    if (typeof response === 'string') return response;
    
    // Truncate large responses
    const stringified = JSON.stringify(response);
    if (stringified.length > 5000) {
      return {
        ...response,
        _truncated: true,
        _message: 'Response truncated due to size'
      };
    }
    return response;
  }

  getLogs(): APILogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    console.log('🧹 API logs cleared');
  }
}

export const apiLogger = APILogger.getInstance();