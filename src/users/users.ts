import express from "express";

const userRouter = express.Router();

userRouter.use((req, res, next) => {
  console.log("Users");
  next();
});

userRouter.post("/login", (req, res) => {
  res.type("application/json");
  res.send({ title: "login" });
});

userRouter.post("/register", (req, res) => {
  res.type("application/json");
  res.send({ title: "register" });
});

export { userRouter };
