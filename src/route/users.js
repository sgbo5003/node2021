import { Router } from "express";
import _ from "lodash";
import faker from "faker";
import sequilize from "sequelize";
import bycrpt from "bcrypt";
faker.locale = "ko";

const userRouter = Router();

const seq = new sequilize("express", "root", "1234", {
  host: "localhost",
  dialect: "mysql",
});

// 랜덤 숫자 생성
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min) + min);
};

const checkSequalizeAuth = async () => {
  try {
    await seq.authenticate();
    console.log("DB 연결 성공");
  } catch (err) {
    console.log("DB 연결 실패:", err);
  }
};

checkSequalizeAuth();

const User = seq.define("user", {
  name: {
    type: sequilize.STRING,
    allowNull: false,
  },
  age: {
    type: sequilize.INTEGER,
    allowNull: false,
  },
  password: {
    type: sequilize.STRING,
    allowNull: false,
  },
});

// const initDb = async () => {
//   await User.sync();
//   await Board.sync();
// };

// initDb();

const user_sync = async () => {
  try {
    await User.sync({ force: true });
    for (let i = 0; i < 10000; i++) {
      const hashpwd = await bycrpt.hash("test1234", 10);
      User.create({
        name: faker.name.lastName() + faker.name.firstName(),
        age: getRandomInt(15, 40),
        password: hashpwd,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

// user_sync();

// 유저 전체 조회
userRouter.get("/", async (req, res) => {
  const { name, age } = req.query;
  const { Op } = sequilize;
  try {
    const findUserQuery = {
      attributes: ["id", "name", "age"],
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
// userRouter.get("/:id", (req, res) => {
//   const findUser = _.find(users, { id: parseInt(req.params.id) });
//   let msg;
//   if (findUser) {
//     msg = "정상적으로 조회되었습니다.";
//     res.status(200).send({
//       msg,
//       findUser,
//     });
//   } else {
//     msg = "해당 아이디를 가진 유저가 존재하지 않습니다.";
//     res.status(400).send({
//       msg,
//       findUser,
//     });
//   }
// });

// 유저 생성
// const UserCreate = async () => {
//   try {
//     await User.sync({ force: true });
//     for (let i = 0; i < 100; i++) {
//       User.create({
//         // await -> 순서 보장
//         name: faker.name.lastName() + faker.name.firstName(),
//         age: getRandomInt(15, 40),
//       });
//     }
//     console.log("성공");
//   } catch (err) {
//     console.log("에러", err);
//   }
// };

// UserCreate();

//유저생성
userRouter.post("/", async (req, res) => {
  try {
    const { name, age } = req.body;
    if (!name || !age)
      res.status(400).send({ msg: "입력요청값이 잘못되었습니다." });

    const result = await User.create({
      name,
      age,
    });
    res.status(201).send({
      msg: `id ${result.id}, ${result.name} 유저가 생성되었습니다.`,
    });
    console.log("유저 생성 성공");
  } catch (err) {
    console.log("실패", err);
    res.status(500).send({ msg: "서버에 문제가 발생했습니다." });
  }

  //   const check_user = _.find(users, ["id", createUser.id]);

  //   let result;
  //   if (!check_user && createUser.id && createUser.name && createUser.age) {
  //     users.push(createUser);
  //     result = `${createUser.name}님을 생성 했습니다.`;
  //   } else {
  //     result = "입력 요청값이 잘못되었습니다.";
  //   }

  // result = await User.findAll(findUserQuery);
  res.send({
    result,
  });
});

//name 변경
// userRouter.put("/:id", (req, res) => {
//   // users 안에서 현재 요청이 들어온 :id 값이 같은 애가 있는지 확인하고 있으면 index 값을 리턴, 없으면 -1을 리턴
//   const check_user = _.find(users, ["id", parseInt(req.params.id)]);
//   // const find_user_idx = _.findIndex(users);
//   let result;
//   // find_user_idx가 -1이 아니면? -> users안에 :id와 동일한 id를 가진 객체가 존재
//   //   if(find_user_idx !== -1){
//   // users[0] = { id: 1, name: "홍길동" , age: 21}
//   //       users[find_user_idx].name = req.body.name;
//   //       result = "성공적으로 수정 되었습니다.";
//   //       res.status(200).send({
//   //         result,
//   //       });
//   //   }
//   if (check_user) {
//     users = users.map((data) => {
//       if (data.id === parseInt(req.params.id)) {
//         data.name = req.body.name;
//       }
//       return data;
//     });
//     result = "성공적으로 수정 되었습니다.";
//     res.status(200).send({
//       result,
//     });
//   } else {
//     result = `${req.params.id} 아이디를 가진 유저가 존재하지 않습니다.`;
//     res.status(400).send({
//       result,
//     });
//   }
// });

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

//user 지우기
// userRouter.delete("/:id", (req, res) => {
//   // lodash 의 _.find 를 이용해 요청이 들어온 :id 값을 가진 users 안의 객체가 있는지 체크
//   const check_user = _.find(users, ["id", parseInt(req.params.id)]);
//   let result;
//   // 같은 아이디 값을 가진 값이 있으면?
//   if (check_user) {
//     // lodash의 reject 메서드를 이용해 해당 id를 가진 객체를 삭제
//     users = _.reject(users, ["id", parseInt(req.params.id)]);
//     result = "성공적으로 삭제 되었습니다.";
//     res.status(200).send({
//       result,
//     });
//   } else {
//     result = `${req.params.id} 아이디를 가진 유저가 존재하지 않습니다.`;
//     res.status(400).send({
//       result,
//     });
//   }
// });

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

export default userRouter;
