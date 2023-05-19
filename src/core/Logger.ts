// Logger.ts
import LogProcessor from "./LogProcessor";

enum LogLevel {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

export type LogFormat = "json" | "syslog" | "keyvalue" | "log";

type TParams = {
  input: string;
  output: string;
};

interface SyncLogTarget {
  writeLog(level: LogLevel, message: string): void;
}

interface AsyncLogTarget {
  writeLog(level: LogLevel, message: string, params?: TParams): Promise<void>;
}

type LogTarget = SyncLogTarget | AsyncLogTarget;

class FileLogTarget implements AsyncLogTarget {
  async writeLog(
    level: LogLevel,
    message: string,
    params?: TParams
  ): Promise<void> {
    const { input, output } = params;
    const logProcessor = new LogProcessor(input, output, level, message);
    logProcessor.processLogs();
  }
}

class Logger {
  private syncTargets: SyncLogTarget[];
  private asyncTargets: AsyncLogTarget[];

  constructor() {
    this.syncTargets = [];
    this.asyncTargets = [];
  }

  addSyncTarget(target: SyncLogTarget): void {
    this.syncTargets.push(target);
  }

  addAsyncTarget(target: AsyncLogTarget): void {
    this.asyncTargets.push(target);
  }

  removeSyncTarget(target: SyncLogTarget): void {
    const index = this.syncTargets.indexOf(target);
    if (index !== -1) {
      this.syncTargets.splice(index, 1);
    }
  }

  removeAsyncTarget(target: AsyncLogTarget): void {
    const index = this.asyncTargets.indexOf(target);
    if (index !== -1) {
      this.asyncTargets.splice(index, 1);
    }
  }

  async log(level: LogLevel, message: string, params?: TParams): Promise<void> {
    for (const target of this.syncTargets) {
      target.writeLog(level, message);
    }

    for (const target of this.asyncTargets) {
      await target.writeLog(level, message, params);
    }
  }

  readLogFile(
    level: LogLevel,
    message: string,
    params?: TParams
  ): Promise<string> {
    const { input, output } = params;
    const logProcessor = new LogProcessor(input, output, level, message);
    return logProcessor.readFile(output);
  }

  info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  warn(message: string): void {
    this.log(LogLevel.WARNING, message);
  }

  error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }
}

export { LogLevel, LogTarget, Logger, FileLogTarget };
