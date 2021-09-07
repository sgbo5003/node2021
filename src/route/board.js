import { Router } from "express";
import _ from "lodash";

const boardRouter = Router();

let boards = [
  {
    id: 1,
    title: "1번쨰 게시물입니다.",
    content: "1번쨰 게시물 내용입니다.",
    createDate: "2021-09-07",
    updateData: "2021-09-06",
  },
  {
    id: 2,
    title: "2번쨰 게시물입니다.",
    content: "2번쨰 게시물 내용입니다.",
    createDate: "2021-09-07",
    updateData: "2021-09-06",
  },
  {
    id: 3,
    title: "3번쨰 게시물입니다.",
    content: "3번쨰 게시물 내용입니다.",
    createDate: "2021-09-07",
    updateData: "2021-09-06",
  },
];

// 게시판 전체 조회
boardRouter.get("/", (req, res) => {
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
