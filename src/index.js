import express from "express";
import userRouter from "./route/users.js";
import boardRouter from "./route/boards.js";
import db from "./models/index.js";

const app = express();
// NODE_ENV 환경변수 체크, 개발환경일때와 상용환경을 구분
if (process.env.NODE_ENV === "development") {
  // DATABASE에서 외래키 체크를 강제로 해제 !! 로컬 개발 환경에서만 제한적으로 사용해야 함.
  db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true }).then(() => {
    // force:true -> 기존 테이블을 모두 지우고 새로 생성
    // force:ture -> 옵션은 모델 변경 직후에만 넣어주고 그 이외에는 빼주는게 좋다.
    db.sequelize.sync({ force: true }).then(() => {
      console.log("개발환경 sync 끝");
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.use("/users", userRouter);
      app.use("/boards", boardRouter);
      app.listen(3000);
    });
  });
} else if (process.env.NODE_ENV === "production") {
  db.sequelize.sync().then(() => {
    console.log("상용환경 sync 끝");
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/users", userRouter);
    app.use("/boards", boardRouter);
    app.listen(3000);
  });
}
