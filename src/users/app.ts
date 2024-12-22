import express, { Request, Response, NextFunction, Express } from "express";
import { userRouter } from "./users";
import { Server } from "http";

export class App {
  app: Express;
  server: Server | null;
  port: number;

  constructor() {
    this.app = express();
    this.port = 8000;
    this.server = null;
  }

  public useRoutes() {
    this.app.use("/users", userRouter);
  }

  public async init() {
    this.useRoutes;
    this.server = this.app.listen(this.port);
    console.log(`Server listen by port:${this.port}`);
  }
}
