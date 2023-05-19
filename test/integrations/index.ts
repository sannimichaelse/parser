import "mocha";
import { expect } from "chai";
import { agent as request } from "supertest";
import app from "../../src/api/index";

describe("POST api/v1", () => {
  it("should get base url", async () => {
    const response = await request(app).get("/");
    expect(response.body.status).to.equal("ok");
    expect(response.body.message).to.equal("welcome to log parser api");
  });

  it("should not create log file with invalid input extension", async () => {
    const response = await request(app).post("/api/v1/parser").send({
      inputPath: "fb.com",
      outputPath: "errors.json",
    });
    expect(response.body.message).to.equal(
      "Invalid input log file. Expected a .log extension."
    );
  });

  it("should create log file with correct input and output", async () => {
    const response = await request(app).post("/api/v1/parser").send({
      inputPath: "app.log",
      outputPath: "errors.json",
    });
    expect(response.body).to.be.an("array");
    expect(response.body[0].timestamp).to.equal(1628475171259);
    expect(response.body[0].logLevel).to.equal("error");
    expect(response.body[0].transactionId).to.equal(
      "9abc55b2-807b-4361-9dbe-aa88b1b2e978"
    );
    expect(response.body[0].err).to.equal("Not found");
  });
});
