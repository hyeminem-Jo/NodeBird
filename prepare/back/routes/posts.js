const express = require("express");
const { Op } = require("sequelize");
const { Post, User, Image, Comment } = require("../models");

const router = express.Router();

router.get("/", async (req, res, next) => { // GET /posts/
  try {
    const where = {}; // where 을 따로 뺌
    // 이유: 초기 로딩일 때와 초기 로딩이 아닐 때 불러오는 조건이 다름
    // 초기 로딩일 때: 그냥 최신글 10개 불러옴
    // 초기 로딩이 아닐 때: 스크롤을 내려 더 불러오는 상황, lastId 다음 것을 불러와야함

    // 쿼리스트링이라 lastId 가 req.query.lastId 에 담긴다.
    // req.query.lastId 는 초기에 로딩할 땐 0 이며, 그것이 아니면 어떤 값이 있을 것
    // 초기 로딩이 아닐 때 (0 은 falsy 한 값)
    if (parseInt(req.query.lastId, 10)) {
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) } 
      // lastId(마지막 게시물) 보다 작은 id 들을 10개(limit: 10) 불러오기
      // '보다 작은' 을 시퀄라이즈에서는 Op(operator) 를 씀
    }
    // 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 페이지일 때
    // 21 번 게시글이 가장 최신 글, 오른쪽 순으로 오래된 게시글 순
    // 마지막으로 게시된 것이 11번(lastId) 인 상태에서 다시 로드할 때, 11번(lastId)보다 작은 10번 이하 게시글들이 10개 불려야함

    const posts = await Post.findAll({
      where, // where: 게시글 가져오는 것에 대한 조건, 조건이 없으면 초기 로딩이 아닐 때도 최신 10개만 가져옴.
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
          model: User, // 게시글 작성자 
          attributes: ['id', 'nickname'], // 사용자 비밀번호 빼고 가져옴
        },
        {
          model: User, // 게시글에 좋아요 누른 사람
          as: 'Likers', // Like 테이블에 소속된 User
          attributes: ['id'], // 사용자 비밀번호 빼고 가져옴
        },
        {
          model: Image, // 이미지 정보
        },
        {
          model: Comment, // 댓글 정보
          include: [{
            model: User, // 댓글 작성자
            attributes: ['id', 'nickname'], // 사용자 비밀번호 빼고 가져옴
            // order: [['createdAt', 'DESC']],
          }]
        },
        { 
          model: Post, // 원본 게시글
          as: 'Retweet', // 리트윗 게시글 <-> 원본 게시글 관계테이블
          include: [{
            model: User, // 원본 게시글 작성자
            attributes: ['id', 'nickname'],
          }, {
            model: Image,
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
