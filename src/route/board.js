import { Router } from "express";
import _ from "lodash";
import faker from "faker";
import sequilize from "sequelize";

const seq = new sequilize("express", "root", "1234", {
  host: "localhost",
  dialect: "mysql",
});

const Board = seq.define("board", {
  title: {
    type: sequilize.STRING,
    allowNull: false,
  },
  content: {
    type: sequilize.TEXT,
    allowNull: true,
  },
});

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

const boardRouter = Router();

let boards = [];

// 게시판 전체 조회
boardRouter.get("/", async (req, res) => {
  const boards = await Board.findAll();
  res.send({
    count: boards.length,
    boards,
  });
});

//게시판 id 값 조회
boardRouter.get("/:id", (req, res) => {
  const findBoard = _.find(boards, { id: parseInt(req.params.id) });
  let msg;
  if (findBoard) {
    msg = "정상적으로 조회되었습니다.";
    res.status(200).send({
      msg,
      findBoard,
    });
  } else {
    msg = `조회하신 게시글이 없습니다. .`;
    res.status(400).send({
      msg,
      findBoard,
    });
  }
});

// 게시판 생성
boardRouter.post("/", (req, res) => {
  const createBoard = req.body;
  const check_board = _.find(boards, ["id", createBoard.id]);
  let result;
  if (
    !check_board &&
    createBoard.id &&
    createBoard.title &&
    createBoard.content &&
    createBoard.createDate &&
    createBoard.updateData
  ) {
    boards.push(createBoard);
    result = `${createBoard.id}번째 게시글을 생성 하였습니다.`;
    res.status(200).send({
      result,
    });
  } else {
    result = "입력 요청값이 잘못되었습니다.";
    res.status(400).send({
      result,
    });
  }
});

//게시글 title 변경
boardRouter.put("/:id", (req, res) => {
  const check_board = _.find(boards, ["id", parseInt(req.params.id)]);
  let result;
  if (check_board) {
    boards = boards.map((data) => {
      if (data.id === parseInt(req.params.id)) {
        data.title = req.body.title;
      }
      return data;
    });
    result = "성공적으로 수정 되었습니다.";
    res.status(200).send({
      result,
    });
  } else {
    result = `${req.params.id}번째 게시글이 존재하지 않습니다.`;
    res.status(400).send({
      result,
    });
  }
});

//게시글 지우기
boardRouter.delete("/:id", (req, res) => {
  const check_board = _.find(boards, ["id", parseInt(req.params.id)]);
  let result;
  if (check_board) {
    // lodash의 reject 메서드를 이용해 해당 id를 가진 객체를 삭제
    boards = _.reject(boards, ["id", parseInt(req.params.id)]);
    result = "성공적으로 삭제 되었습니다.";
    res.status(200).send({
      result,
    });
  } else {
    result = `${req.params.id} 번째 게시글이 존재하지 않습니다.`;
    res.status(400).send({
      result,
    });
  }
});

export default boardRouter;
