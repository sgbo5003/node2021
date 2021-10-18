import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../models/index.js";

const { User, Permission, Board } = db;

const userRouter = Router();

// 유저 전체 조회
userRouter.get("/", async (req, res) => {
  const { name, age } = req.query;
  const { Op } = sequilize;
  try {
    const findUserQuery = {
      attributes: ["id", "name", "age"],
      include: [Permission],
    };
    let result;
    if (name && age) {
      findUserQuery["where"] = { name: { [Op.substring]: name }, age };
    } else if (name) {
      findUserQuery["where"] = { name: { [Op.substring]: name } };
    } else if (age) {
      findUserQuery["where"] = { age };
    }
    result = await User.findAll(findUserQuery);

    res.status(200).send({
      count: result.length,
      result,
    });
  } catch (err) {
    console.log(err);
  }
});

// //유저 id 값 조회
userRouter.get("/:id", async (req, res) => {
  try {
    const findUser = await User.findOne({
      // include : [Permission, Board], // 모든 컬럼을 다 보고 싶으면
      include: [
        {
          model: Permission,
          attributes: ["id", "title", "level"],
        },
        {
          model: Board,
          attributes: ["id", "title"],
        },
      ],
      where: {
        id: req.params.id,
      },
    });
    res.status(200).send({
      findUser,
    });
  } catch (err) {
    console.log("실패", err);
    res.status(500).send({ msg: "서버에 문제가 발생했습니다." });
  }
});

//유저생성
userRouter.post("/", async (req, res) => {
  try {
    const { name, age, password, permission } = req.body; // permission 추가
    if (!name || !age || !password || !permission)
      res.status(400).send({ msg: "입력요청값이 잘못되었습니다." });
    else {
      const hashpwd = await bcrypt.hash(password, 4); // password hash 처리
      const user = await User.create({
        name,
        age,
        password: hashpwd,
      });

      await user.createPermission({
        title: permission.title,
        level: permission.level,
      }); // permission 생성
      res.status(201).send({
        msg: `id ${user.id}, ${user.name} 유저가 생성되었습니다.`,
      });
    }
  } catch (err) {
    console.log("실패", err);
    res.status(500).send({ msg: "서버에 문제가 발생했습니다." });
  }
});

userRouter.put("/:id", async (req, res) => {
  try {
    const updateUser = req.params.id;
    const updateUserName = req.body.name;
    const updateUserAge = req.body.age;
    const { Op } = sequilize;

    if (!updateUser || (!updateUserName && !updateUserAge)) {
      res
        .status(400)
        .send("유저가 존재하지 않거나 입력 요청이 잘못되었습니다.");
    }

    const findUserQuery = await User.findOne({
      where: {
        id: { [Op.eq]: updateUser },
      },
    });

    let updateUserQuery;

    if (updateUserName && updateUserAge) {
      updateUserQuery = await User.update(
        { name: updateUserName, age: updateUserAge },
        {
          where: {
            id: { [Op.eq]: updateUser },
          },
        }
      );
    } else if (updateUserName) {
      updateUserQuery = await User.update(
        { name: updateUserName },
        {
          where: {
            id: { [Op.eq]: updateUser },
          },
        }
      );
    } else if (updateUserAge) {
      updateUserQuery = await User.update(
        { age: updateUserAge },
        {
          where: {
            id: { [Op.eq]: updateUser },
          },
        }
      );
    }
    res.status(200).send({
      msg: `${updateUser}님 수정을 완료하였습니다.`,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

userRouter.delete("/:id", async (req, res) => {
  //auth체크 + 권한, 본인 체크
  try {
    let user = await User.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!user) {
      res.status(400).send({ msg: "유저가 존재하지 않습니다." });
    }

    await user.destroy();
    res.status(200).send({ mgs: "유저정보가 정상적으로 삭제 되었습니다." });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ msg: "서버에 문제가 발생했습니다. 잠시 후 시도해 주세요" });
  }
});

userRouter.get("/test/:id", async (req, res) => {
  const { Op } = sequilize;
  try {
    // findAll
    const userResult = await User.findAll({
      attributes: ["id", "name", "age"],
      where: {
        [Op.or]: [
          {
            name: { [Op.startsWith]: "김" },
            age: { [Op.between]: [30, 40] },
          },
          {
            name: { [Op.startsWith]: "이" },
            age: { [Op.between]: [30, 40] },
          },
        ],
      },
      order: [
        ["name", "ASC"],
        ["age", "DESC"],
      ],
    });

    const boardResult = await Board.findAll({
      limit: 100,
      attributes: ["id", "title"],
    });

    const user = await User.findOne({
      where: { id: req.params.id },
    });
    const board = await Board.findOne({
      where: { id: req.params.id },
    });

    if (!user || !board) {
      res.status(400).send({ msg: "해당 정보가 존재하지 않습니다." });
    }
    await user.destroy();
    board.title += "test 타이틀 입니다.";
    await board.save();

    res.status(200).send({
      board,
      users: {
        count: userResult.length,
        data: userResult,
      },
      boards: {
        count: boardResult.length,
        data: boardResult,
      },
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ msg: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
});

// const seq = new sequilize("express", "root", "1234", {
//   host: "localhost",
//   dialect: "mysql",
// });

// const checkSequalizeAuth = async () => {
//   try {
//     await seq.authenticate();
//     console.log("DB 연결 성공");
//   } catch (err) {
//     console.log("DB 연결 실패:", err);
//   }
// };

// checkSequalizeAuth();

// const initDb = async () => {
//   await User.sync();
//   await Board.sync();
// };

export default userRouter;
