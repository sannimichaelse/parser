import fs from "fs";
import path from "path";

import { LogLevel, LogFormat } from "./Logger";
interface LogData {
  timestamp: number;
  logLevel: string;
  transactionId: string;
  err: string;
}
class LogProcessor {
  constructor(
    private logFilePath: string,
    private errorLogFilePath: string,
    private logLevel: LogLevel,
    private message: string
  ) {}

  private parseSyslogData(data: string) {
    const logs = data.split("\n").map((line) => {
      const [logLevel, timestamp, transactionId, err] = line.split(" ");
      return {
        logLevel,
        timestamp: Number(timestamp),
        transactionId,
        err,
      };
    });

    return logs;
  }

  private parseKeyValueData(data: string) {
    const logs = data.split("\n").map((line) => {
      const logObj: any = {};
      line.split(",").forEach((pair) => {
        const [key, value] = pair.split("=");
        logObj[key.trim()] = value.trim();
      });
      return logObj;
    });

    return logs;
  }

  private parseJsonData(data: string) {
    const logs = JSON.parse(data);
    return logs;
  }

  private parseLogDataByFormat(data: string, format?: LogFormat) {
    if (!format) {
      return data;
    }
    if (format == "syslog") {
      return this.parseSyslogData(data);
    } else if (format == "keyvalue") {
      return this.parseKeyValueData(data);
    } else if (format == "json") {
      return this.parseJsonData(data);
    } else {
      throw new Error(`Unsupported log file format: ${format}`);
    }
  }

  public readFile(filePath: string, format?: LogFormat): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const parsedData = this.parseLogDataByFormat(data, format);
          resolve(parsedData);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  }

  private buildFormattedData(logEntries: LogData[], format: LogFormat) {
    let formattedData;
    switch (format) {
      case "json":
        formattedData = JSON.stringify(logEntries, null, 2);
        break;
      case "syslog":
        formattedData = logEntries
          .map((entry) => {
            return `<${entry.logLevel}> ${entry.timestamp} ${entry.transactionId} ${entry.err}`;
          })
          .join("\n");
        break;
      case "keyvalue":
        formattedData = logEntries
          .map((entry) => {
            return `timestamp=${entry.timestamp}, logLevel=${entry.logLevel}, transactionId=${entry.transactionId}, err=${entry.err}`;
          })
          .join("\n");
        break;
      default:
        throw new Error("Unsupported format");
    }

    return { data: formattedData, format };
  }

  private writeFile(
    filePath: string,
    logEntries: LogData[],
    format: LogFormat
  ): Promise<void> {
    const { data } = this.buildFormattedData(logEntries, format);
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  public validateLogFilePath(filePath: string): void {
    const fileExtension = path.extname(filePath);
    if (fileExtension !== ".log") {
      throw new Error("Invalid log file. Expected a .log extension.");
    }
    if (!fs.existsSync(filePath)) {
      throw new Error("Log file does not exist.");
    }
  }

  private createErrorLogFileIfNotExists(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "");
    }
  }

  public parseLogData(log: string): LogData {
    const [timestamp, logLevel, logJson] = log.split(" - ");
    const logData = JSON.parse(logJson);
    return {
      timestamp: new Date(timestamp).getTime(),
      logLevel,
      transactionId: logData.transactionId,
      err: logData.err,
    };
  }

  public async processLogs(format: LogFormat = "json"): Promise<string> {
    try {
      this.validateLogFilePath(this.logFilePath);
      this.createErrorLogFileIfNotExists(this.errorLogFilePath);

      const data = await this.readFile(this.logFilePath);
      const logs = data.split("\n");

      const errorLogs = logs
        .map((log) => log.trim())
        .filter((log) => log.startsWith("20")) // Filter out non-date lines
        .map((log) => this.parseLogData(log))
        .filter((log) => log.logLevel === this.logLevel);

      await this.writeFile(this.errorLogFilePath, errorLogs, format);
      const message = `${this.message} ${this.errorLogFilePath}`;
      console.log(message);
      return message;
    } catch (err) {
      console.error(err.message);
    }
  }
}

export default LogProcessor;
