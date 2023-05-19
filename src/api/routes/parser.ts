import { FileLogTarget, LogLevel, Logger } from "../../core/Logger";
import express, { Request, Response } from "express";

const router = express.Router();

router.post("", async (req: Request, res: Response) => {
  const { inputPath: input, outputPath: output } = req.body;
  const logger = new Logger();
  logger.addAsyncTarget(new FileLogTarget());
  const logMessage = "Errors successfully extracted and written to";
  logger.log(LogLevel.ERROR, logMessage, { input, output });
  const data = await logger.readLogFile(LogLevel.ERROR, logMessage, {
    input,
    output,
  });
  const jsonData = JSON.parse(data);
  res.status(201).json(jsonData);
});

export default router;
