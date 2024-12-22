import express, { Request, Response, NextFunction } from "express";
import { userRouter } from "./users/users.js";

const port = 8000;
const app = express();

// app.get("/hello", (req, res) => {
//   res.send("Hello world!");
// });
app.use((req, res, next) => {
  console.log("Time ", Date.now());
  next();
});
app
  .route("/hello")
  .get((req, res) => {
    // throw new Error("Error!!!");
    res.type("application/json");
    res.send({ title: "Hello world GET!" });
  })
  .post((req, res) => {
    res.send("Hello world! POST");
  });

app.use("/users", userRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err.message);
  res.type("application/json");
  res.status(401).send({ message: err.message });
});

app.listen(port, () => {
  console.log(`Server listen by port:${port}`);
});
