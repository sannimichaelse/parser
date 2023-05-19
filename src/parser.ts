import { Logger, FileLogTarget, LogLevel } from "./core/Logger";
import { program } from "commander";

program
  .version("1.0.0")
  .description("Log parser app")
  .option("-in, --input <input>", "Specify the input")
  .option("-out, --output <output>", "Specify the output")
  .action(({ input, output }) => {
    const logger = new Logger();
    logger.addAsyncTarget(new FileLogTarget());
    const logMessage = "Errors successfully extracted and written to";
    logger.log(LogLevel.ERROR, logMessage, { input, output });
  });

program.parse(process.argv);
