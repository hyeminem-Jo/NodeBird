const express = require("express");
const { Post, User, Image, Comment } = require("../models");

const router = express.Router();

router.get("/", async (req, res, next) => { // GET /posts/
  try {
    const posts = await Post.findAll({
    // 이전에 findOne() 에서는 하나의 id 를 특정하여 데이터 하나씩 꺼냈지만 findAll() 은 들어있는 데이터 전부 꺼냄
    // findOne() 의 경우, where: { UserId: 1 }, UserId 가 1번인 게시글을 전부 가져오기 처럼 하면 findAll() 과 똑같은 동작을 함
      // 하지만 게시글 전부를 가져오진 않고 로딩 될때마다 10개씩만 꺼내서 주기
      // 특수한 조건: limit, (내가 원하는 구간만 잘라서 가져오기)
      // where: { id: lastId }, 
      // 이전에 로딩된 게시글들 중 마지막 게시글을 뜻
      // 마지막 게시글 보다 순서가 뒤인 게시글들 10개 불러옴
      // [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      // id 숫자는 보통 최근에 생성될 수록 크고, 페이지를 볼 때 최신 게시글 순으로 보기 때문에 큰 숫자부터 들어감 (오름차순, 옛날것~최신것)
      limit: 10, // 게시글 전부가 아닌 10개만 가져오기
      order: [ // 최신 게시글부터 가져오기 (기본 값은 ['ASC'])
        ['createdAt', 'DESC'],
        [Comment, 'createdAt', 'DESC'] // 게시글 안의 댓글도 게시글과 같이 전체로 불러올 때 오름차순
      ], 
      // 이차원 배열인 이유: 여러 기준으로 정렬 가능
      include: [
        {
          model: User, // 작성자 정보
          attributes: ['id', 'nickname'], // 사용자 비밀번호 빼고 가져옴
        },
        {
          model: Image, // 이미지 정보
        },
        {
          model: Comment, // 댓글 정보
          include: [{
            model: User, // 댓글 작성자
            attributes: ['id', 'nickname'], // 사용자 비밀번호 빼고 가져옴
          }]
        },
      ]
    });
    console.log(posts); // 라우터가 실행되었는지 서버쪽에 기록
    res.status(200).json(posts); // 게시글들 배열 [{}, {}, {}...]
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
