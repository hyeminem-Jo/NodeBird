const express = require('express');
const router = express.Router();

const { Post, User, Image, Comment, Hashtag } = require("../models");
const { Op } = require("sequelize");

// ** 해시태그 게시물 로드하기: POST/hashtag/노드
router.get("/:hashtag", async (req, res, next) => { 
  try {
    const where = {}; // 모든 posts 
    // pagenation
    if (parseInt(req.query.lastId, 10)) { // 초기 로딩이 아닐 때 (0 은 falsy 한 값)
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) } 
      // 특정 사용자의 모든 posts 중 lastId(마지막 게시물) 보다 작은 id 들을 10개(limit: 10) 불러오기
    }

    const posts = await Post.findAll({
      where, // 특정 사용자의 posts 
      // where: 게시글 가져오는 것에 대한 조건, 조건이 없으면 초기 로딩이 아닐 때도 최신 10개만 가져옴.
      limit: 10, // 게시글 전부가 아닌 10개만 가져오기
      order: [ // 최신 게시글부터 가져오기 (기본 값은 ['ASC'])
        ['createdAt', 'DESC'],
        [Comment, 'createdAt', 'DESC'] // 게시글 안의 댓글도 게시글과 같이 전체로 불러올 때 오름차순
      ], 
      // 이차원 배열인 이유: 여러 기준으로 정렬 가능
      include: [
        {
          model: Hashtag,
          where: { name: decodeURIComponent(req.params.hashtag) } // axios 주소를 통해 프론트로부터 받아온 hashtag
          // where 에만 조건을 달 수 있는 것이 아닌 include 에서도 조건을 넣을 수 있다.
          // 이렇게 되면 where, where.id = { [Op.lt]: parseInt(req.query.lastId, 10) }, where: { name: req.params.hashtag } 세개 조건에 해당하는 post 를 찾게 된다.
          // => [모든 게시글 중] [마지막 게시글 보다 id 값이 작은] [해당 해시태그가 달린] 게시글을 불러온다.
        },
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
    // console.log(posts); // 라우터가 실행되었는지 서버쪽에 기록
    res.status(200).json(posts); // 게시글들 배열 [{}, {}, {}...]
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;