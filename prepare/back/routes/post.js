const express = require('express');
const { Post, Comment } = require('../models');
// 게시글이나 댓글 역시 로그인이 되어있는지 확인한 후에 접근 가능하도록 설정
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

// app >> router 변경
router.post('/', isLoggedIn, async (req, res, next) => { // POST /post
  try {
    const post = await Post.create({ // req.body = { content: 'text~' }
      content: req.body.content,
      UserId: req.user.id,
      // 평소에 serializeUser 로 id 만 들고있다가 라우터에 접근할 때, 접근 전에 deserializeUser 가 한 번씩 실행되어 저장되어있던 id 를 통해 사용자 정보를 복구하여 req.user 로 만듦 (post 할 때 req.user 에 접근 가능)
      // 로그인 이후로는 라우터를 접근할 때 deserializeUser 가 실행됨
      // 저장된 user.id
      // passport > index.js 참고
    })
    res.status(201).json(post); // 프론트로 다시 보냄
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// 파라미터: 주소 부분에서 동적으로 바뀌는 부분
// '/1/comment'
// ex) 항상 1번 게시글이 아닌 6번 게시글(/6/comment) 일 수도 있다
// => '/:postId/comment' ( :postId 부분이 동적으로 바뀜 )
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => { 
  // POST /post/1/comment
  try {
    // 부가적인, 세부적인 설정 (optional)
    // 존재하지 않는 게시글에 댓글을 달 우려 (혹시나)
    // 혹은 다른 게시글 주소에 접근해서 댓글을 추가 삭제할 우려
    // 조건: 게시글이 존재한다면
    const post = await Post.findOne({
      where: { id: req.params.postId }
    });
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
      // return 을 붙여줘야 send 가 두 번 발송되지 않음
      // ** 무조건 요청 한번에 응답 한번!!
    }

    const comment = await Comment.create({ 
      content: req.body.content,
      PostId: req.params.postId, // :postId 가 params 를 통해 접근
      UserId: req.user.id // 누가 게시글을 썼는지 (내가)
    })
    res.status(201).json(comment); // 프론트로 다시 보냄
  } catch (error) {
    console.error(error);
    next(error);
  }
})

router.delete('/', (req, res) => { // DELETE /post
  res.json({ id: 1 })
})

// 중복을 막음

module.exports = router;