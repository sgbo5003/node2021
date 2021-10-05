import faker from "faker";
import bycrpt from "bcrypt";
import db from "./src/models/index.js";

const { User, Board } = db;
faker.locale = "ko";

// 랜덤 숫자 생성
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min) + min);
};

const user_sync = async () => {
  try {
    await User.sync({ force: true });
    for (let i = 0; i < 1000; i++) {
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

const board_sync = async () => {
  try {
    await Board.sync({ force: true });
    for (let i = 0; i < 10000; i++) {
      await Board.create({
        title: faker.lorem.sentences(1),
        content: faker.lorem.sentences(10),
      });
    }
  } catch (err) {
    console.log(err);
  }
};

// board_sync();
