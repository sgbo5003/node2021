import { Router } from "express";
import db from "../models/index.js";

const { Board, User } = db;

const boardRouter = Router();

// 게시판 전체 조회
boardRouter.get("/", async (req, res) => {
  try {
    const boards = await Board.findAll();
    res.send({
      count: boards.length,
      boards,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ msg: "서버에 문제가 발생했습니다. 잠시 후 시도해 주세요" });
  }
});

//게시판 id 값 조회
boardRouter.get("/:id", async (req, res) => {
  try {
    const findBoard = await Board.findOne({
      include: [
        {
          model: User,
          attribute: ["id", "name"],
        },
      ],
      where: {
        id: req.params.id,
      },
    });
    if (!findBoard) {
      res.status(400).send({ msg: "해당 아이디값을 가진 board가 없습니다." });
    }
    res.status(200).send({
      findBoard,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ msg: "서버에 문제가 발생했습니다. 잠시 후 시도해 주세요" });
  }
});

// 게시판 생성
boardRouter.post("/", async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const writer = await User.findOne({ id: userId }); // user model
    if (!title) {
      res.status(400).send({ msg: "입력요청값이 잘못되었습니다." });
    } else if (!writer) {
      res.status(400).send({ msg: "작성자가 존재하지 않습니다." });
    } else {
      const result = await Board.create({
        title: title ? title : null,
        content: content ? content : null,
        userId: userId ? userId : null,
      });

      res.status(201).send({
        msg: `id ${result.id}, ${result.title} 게시글이 생성되었습니다.`,
      });
    }
  } catch (err) {
    console.log("실패", err);
    res.status(500).send({ msg: "서버에 문제가 발생했습니다." });
  }
});

//게시글 title 변경
boardRouter.put("/:id", async (req, res) => {
  try {
    const { title, content } = req.body;
    const id = req.params.id;

    let board = await Board.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!board || (!title && !content)) {
      res
        .status(400)
        .send({ msg: "게시글이 존재하지 않거나 입력요청값이 잘못되었습니다." });
    }

    if (title) board.title = title;
    if (content) board.content = content;

    await board.save();
    res.status(200).send({
      msg: `${id}번째 게시글이 정상적으로 수정되었습니다.`,
    });
  } catch (err) {
    console.log("실패", err);
    res.status(500).send({ msg: "서버에 문제가 발생했습니다." });
  }
});

//게시글 지우기
boardRouter.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    let board = await Board.findOne({
      where: {
        id: id,
      },
    });
    if (!board) {
      res.status(400).send({ msg: "해당 게시판이 존재하지 않습니다." });
    }

    await board.destroy();
    res.status(200).send({
      mgs: `${id}번째 게시판이 정상적으로 삭제 되었습니다.`,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ msg: "서버에 문제가 발생했습니다. 잠시 후 시도해 주세요" });
  }
});

export default boardRouter;
