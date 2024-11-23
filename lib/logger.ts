type LogLevel = 'info' | 'warn' | 'error';

interface LogData {
  [key: string]: any;
}

class Logger {
  private static formatMessage(level: LogLevel, message: string, data?: LogData): string {
    const timestamp = new Date().toISOString();
    const dataString = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${dataString}`;
  }

  static info(message: string, data?: LogData) {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('info', message, data));
    }
    // In production, you might want to use a proper logging service
    // Example: winston, pino, or a cloud logging service
  }

  static warn(message: string, data?: LogData) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  static error(message: string, data?: LogData) {
    if (process.env.NODE_ENV === 'development') {
      console.error(this.formatMessage('error', message, data));
    }
  }
}

export const logger = Logger; 