import express from "express";

const userRouter = express.Router();

userRouter.get("/", (req, res) => {
  res.send("Get all users");
});

userRouter.post("/", (req, res) => {
  res.send("Create a new user");
});

export default userRouter;
