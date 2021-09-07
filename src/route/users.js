import { Router } from "express";
import _ from "lodash";
import faker from "faker";
faker.locale = "ko";

const userRouter = Router();

// 랜덤 숫자 생성
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min) + min);
};

let users = [];

// faker.js 를 사용하여 랜덤 데이터 집어넣기
for (let i = 1; i < 100; i++) {
  users.push({
    id: i,
    name: faker.name.lastName() + faker.name.firstName(),
    age: getRandomInt(15, 40),
  });
}

// 유저 전체 조회
userRouter.get("/", (req, res) => {
  res.send({
    count: users.length,
    users,
  });
});

//유저 id 값 조회
userRouter.get("/:id", (req, res) => {
  const findUser = _.find(users, { id: parseInt(req.params.id) });
  let msg;
  if (findUser) {
    msg = "정상적으로 조회되었습니다.";
    res.status(200).send({
      msg,
      findUser,
    });
  } else {
    msg = "해당 아이디를 가진 유저가 존재하지 않습니다.";
    res.status(400).send({
      msg,
      findUser,
    });
  }
});

//유저생성
userRouter.post("/", (req, res) => {
  const createUser = req.body;
  const check_user = _.find(users, ["id", createUser.id]);

  let result;
  if (!check_user && createUser.id && createUser.name && createUser.age) {
    users.push(createUser);
    result = `${createUser.name}님을 생성 했습니다.`;
  } else {
    result = "입력 요청값이 잘못되었습니다.";
  }
  res.send({
    result,
  });
});

//name 변경
userRouter.put("/:id", (req, res) => {
  // users 안에서 현재 요청이 들어온 :id 값이 같은 애가 있는지 확인하고 있으면 index 값을 리턴, 없으면 -1을 리턴
  const check_user = _.find(users, ["id", parseInt(req.params.id)]);
  // const find_user_idx = _.findIndex(users);
  let result;
  // find_user_idx가 -1이 아니면? -> users안에 :id와 동일한 id를 가진 객체가 존재
  //   if(find_user_idx !== -1){
  // users[0] = { id: 1, name: "홍길동" , age: 21}
  //       users[find_user_idx].name = req.body.name;
  //       result = "성공적으로 수정 되었습니다.";
  //       res.status(200).send({
  //         result,
  //       });
  //   }
  if (check_user) {
    users = users.map((data) => {
      if (data.id === parseInt(req.params.id)) {
        data.name = req.body.name;
      }
      return data;
    });
    result = "성공적으로 수정 되었습니다.";
    res.status(200).send({
      result,
    });
  } else {
    result = `${req.params.id} 아이디를 가진 유저가 존재하지 않습니다.`;
    res.status(400).send({
      result,
    });
  }
});

//user 지우기
userRouter.delete("/:id", (req, res) => {
  // lodash 의 _.find 를 이용해 요청이 들어온 :id 값을 가진 users 안의 객체가 있는지 체크
  const check_user = _.find(users, ["id", parseInt(req.params.id)]);
  let result;
  // 같은 아이디 값을 가진 값이 있으면?
  if (check_user) {
    // lodash의 reject 메서드를 이용해 해당 id를 가진 객체를 삭제
    users = _.reject(users, ["id", parseInt(req.params.id)]);
    result = "성공적으로 삭제 되었습니다.";
    res.status(200).send({
      result,
    });
  } else {
    result = `${req.params.id} 아이디를 가진 유저가 존재하지 않습니다.`;
    res.status(400).send({
      result,
    });
  }
});

export default userRouter;
