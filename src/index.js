import express from "express";
import userRouter from "./route/users.js";
import boardRouter from "./route/board.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", userRouter);
app.use("/board", boardRouter);

app.listen(3000);
