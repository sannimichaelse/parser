import { expect } from "chai";
import LogProcessor from "../../src/core/LogProcessor";
import { LogLevel } from "../../src/core/Logger";

describe("LogProcessor class", () => {
  it("should write errors successfully into ./errors.json", async () => {
    const logProcessor = new LogProcessor(
      "./app.log",
      "./errors.json",
      LogLevel.ERROR,
      "Errors successfully extracted and written to"
    );
    const response = await logProcessor.processLogs();
    expect(response).to.equal(
      "Errors successfully extracted and written to ./errors.json"
    );
  });
  it("should write errors successfully into ./errors.syslog", async () => {
    const logProcessor = new LogProcessor(
      "./app.log",
      "./errors.syslog",
      LogLevel.ERROR,
      "Errors successfully extracted and written to"
    );
    const response = await logProcessor.processLogs("syslog");
    expect(response).to.equal(
      "Errors successfully extracted and written to ./errors.syslog"
    );
  });

  it("should write errors successfully into ./errors.csv", async () => {
    const logProcessor = new LogProcessor(
      "./app.log",
      "./errors.csv",
      LogLevel.ERROR,
      "Errors successfully extracted and written to"
    );
    const response = await logProcessor.processLogs("keyvalue");
    expect(response).to.equal(
      "Errors successfully extracted and written to ./errors.csv"
    );
  });

  it("should throw an error if wrong log file is supplied ", () => {
    const logProcessor = new LogProcessor(
      "app.json",
      "./errors.json",
      LogLevel.ERROR,
      "Errors successfully extracted and written to"
    );
    try {
      logProcessor.validateLogFilePath("app.json");
    } catch (err) {
      expect(err.message).to.equal(
        "Invalid log file. Expected a .log extension."
      );
    }
  });

  it("should not throw an error if log file exists ", () => {
    const logProcessor = new LogProcessor(
      "/.app.log",
      "./errors.js",
      LogLevel.ERROR,
      "Errors successfully extracted and written to"
    );
    try {
      logProcessor.validateLogFilePath("./app.log");
    } catch (err) {
      expect(err).to.not.exist;
    }
  });

  it("should parse log data ", () => {
    const logProcessor = new LogProcessor(
      "/.app.log",
      "./errors.js",
      LogLevel.ERROR,
      "Errors successfully extracted and written to"
    );

    const response = logProcessor.parseLogData(
      `2021-08-09T02:12:51.259Z - error - {"transactionId":"9abc55b2-807b-4361-9dbe-aa88b1b2e978","details":"Cannot find user orders list","code": 404,"err":"Not found"}`
    );
    expect(response.timestamp).to.equal(1628475171259);
    expect(response.logLevel).to.equal("error");
    expect(response.transactionId).to.equal(
      "9abc55b2-807b-4361-9dbe-aa88b1b2e978"
    );
    expect(response.err).to.equal("Not found");
  });
});
