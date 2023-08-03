type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, metadata?: LogMetadata) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...metadata,
    };

    if (process.env.NODE_ENV === 'production') {
      // In production, you might want to use a proper logging service
      console[level](JSON.stringify(logData));
    } else {
      // In development, pretty print for readability
      console[level](message, metadata || '');
    }
  }

  info(message: string, metadata?: LogMetadata) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: LogMetadata) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: LogMetadata) {
    this.log('error', message, metadata);
  }

  debug(message: string, metadata?: LogMetadata) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, metadata);
    }
  }
}

export const logger = Logger.getInstance(); 