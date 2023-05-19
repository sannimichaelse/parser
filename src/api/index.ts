import express, { Request, Response } from "express";
import parserRouter from "./routes/parser";
import { validateRequestBody } from "./middlewares/parser-middleware";

const app = express();
app.use(express.json());

app.get("", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "welcome to log parser api",
  });
});

app.use("/api/v1/parser", validateRequestBody, parserRouter);

app.listen(6000, () => {
  console.log("Server is running on port 6000");
});

export default app;
