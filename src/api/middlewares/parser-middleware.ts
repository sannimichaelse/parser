import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";

export const validateRequestBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { inputPath } = req.body;
  const inputFileExtension = path.extname(inputPath);

  if (inputFileExtension !== ".log") {
    return res
      .status(400)
      .json({ message: "Invalid input log file. Expected a .log extension." });
  }

  const absoluteFilePath = path.resolve(`${inputPath}`);

  if (!fs.existsSync(absoluteFilePath)) {
    return res.status(400).json({ message: "Log file does not exist." });
  }

  next();
};
