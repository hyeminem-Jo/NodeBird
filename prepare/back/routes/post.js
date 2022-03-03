const express = require('express');
const { Post, Comment, Image, User } = require('../models');
// 게시글이나 댓글 역시 로그인이 되어있는지 확인한 후에 접근 가능하도록 설정
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

// ** 게시글 추가하기 라우터
// app >> router 변경
router.post('/', isLoggedIn, async (req, res, next) => { // POST /post
  try {
    // Post 테이블에 Row(행) 데이터 추가
    const post = await Post.create({ // req.body = { content: 'text~' }
      content: req.body.content,
      UserId: req.user.id,
      // 평소에 serializeUser 로 id 만 저장하고 있다가 라우터에 접근할 때, 접근 전에 deserializeUser 가 한 번씩 실행되어 저장되어있던 id 를 통해 사용자 정보를 복구하여 req.user 로 만듦 (post 할 때 req.user 에 접근 가능)
      // 로그인 이후로는 라우터를 접근할 때 deserializeUser 가 실행됨
      // 저장된 user.id
      // passport > index.js 참고
    })
    // Post 에 데이터 추가해서 정보를 "완성"한 뒤 서버에 요청
    // Post 에 기본적인 정보 (content)밖에 없으므로, 연관된 데이터를 모델에서 연관시켰던 데이터로 가져와 완성한 채로 가져온다.
    const fullPost = await Post.findOne({
      // post 가 model 에 생성되면 자동으로 id 속성이 부여됨.
      where: { id: post.id },
      include: [
        {
          model: Image, // 이미지
        },
        {
          model: Comment, // 댓글
          include: [
            {
              model: User, // 댓글을 포함시킬 때 항상 댓글 작성자도 포함
              attributes: ['id', 'nickname'],
            },
          ]
        },
        {
          model: User, // 게시글 작성자
          attributes: ['id', 'nickname'], // 비밀번호 제외
        },
        {
          model: User, // 게시글에 좋아요 누른 사람
          as: 'Likers', // Like[] 테이블
          attributes: ['id'], // 비밀번호 제외
        },
      ]
    })
    res.status(201).json(fullPost); // 프론트로 다시 보냄
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// ** 댓글 추가하기 라우터
// 파라미터: 주소 부분에서 동적으로 바뀌는 부분
// '/1/comment'
// ex) 항상 1번 게시글이 아닌 6번 게시글(/6/comment) 일 수도 있다
// => '/:postId/comment' ( :postId 부분이 동적으로 바뀜 )
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => { 
  // POST /post/1/comment
  try {
    // 조건: 게시글이 존재한다면
    const post = await Post.findOne({
      where: { id: req.params.postId }
    });
    // 부가적인, 세부적인 설정 (optional)
    // 존재하지 않는 게시글에 댓글을 달 우려 (혹시나)
    // 혹은 다른 게시글 주소에 접근해서 댓글을 추가 삭제할 우려
    if (!post) { // 조건: 게시글이 존재하지 않는 다면
      return res.status(403).send('존재하지 않는 게시글입니다.');
      // return 을 붙여줘야 send 가 두 번 발송되지 않음
      // ** 무조건 요청 한번에 응답 한번!!
      // 없는 게시글엔 댓글 못담
    }

    const comment = await Comment.create({ 
      content: req.body.content,
      PostId: parseInt(req.params.postId, 10), 
      // 조회할 때 말고 적용할 때만 params 를 parseInt() 
      // :postId 가 params 를 통해 접근
      // req.params => 문자열일 것이다. 이렇게 하면 PostId 에 문자열이 들어가 에러가 발생한다. 숫자로 바꿔주자
      // parseInt(string, radix)
      // parseInt 함수는 첫 번째 인자를 문자열로 변환하고, 그 값을 파싱하여 정수나 NaN을 반환
      // NaN을 반환할 것이 아니면, parseInt는 첫 번째 인자를 지정한 radix 진수로 표현한 정수를 반환합니다. 예를 들어 radix가 10인 경우 10진수, 8인 경우는 8진수, 16인 경우 16진수 등등으로 변환
      UserId: req.user.id // 누가 게시글을 썼는지 (내가)
    })

    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [
        {
          model: User, // 댓글 작성자 포함
          attributes: ['id', 'nickname'], // 비밀번호 제외
        }
      ]
    })
    res.status(201).json(fullComment); // 프론트로 다시 보냄
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// ** 게시글에 좋아요 달기 라우터
router.patch('/:postId/like', isLoggedIn, async (req, res, next) => { 
  // saga 에서 data(post.id = 게시글 id) 를 받아 req.params 를 통해 접근
  try {
    const post = await Post.findOne({ 
      where: { id: req.params.postId }
      // 조회할 때 말고 적용할 때만 params 를 parseInt() 
    })
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.');
      // 게시글이 없으면 좋아요도 못누름
    }
    await post.addLikers(req.user.id); // 로그인된 사용자의 id
    // 데이터로 받은 PostId 로 post 를 찾고 그 post 의 Likers 테이블에 로그인된 사용자의 id 추가
    // Like 테이블의 PostId 와 UserId 에 
    // [게시글에 좋아요 누른 유저의 id], [유저가 누른 게시글의 id] 추가됨
    // 관계 메서드: 테이블간의 관계를 이용 (models 참고) 
    res.json({ PostId: post.id, UserId: req.user.id });
    // 어떤 사용자가 어디 게시글에 좋아요 눌렀는지 프론트에 보냄
    // 로그인 이후로는 항상 라우터 접근 전 deserealizeUser 에 들러 쿠키의 id 를 통해 복구된 사용자 정보(user) 를 req.user 에 담음
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// ** 게시글에 좋아요 취소하기 라우터
router.delete('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ 
      where: { id: req.params.postId }
      // 조회할 때 말고 적용할 때만 params 를 parseInt() 
    })
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.')
      // 게시글이 없으면 좋아요 취소도 못함
    }
    await post.removeLikers(req.user.id); 
    res.json({ PostId: post.id, UserId: req.user.id });
    // 어떤 사용자가 어디 게시글에 좋아요를 취소했는지 프론트에 보냄
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// ** 게시글 삭제하기 라우터
router.delete('/:postId', isLoggedIn, async (req, res, next) => { // DELETE /post/1
  // 어떤 게시글을 삭제할 지 표시 (${data}) => 주소로 받기
  try {
    await Post.destroy({ // 제거 
      where: {
        id: req.params.postId,
        UserId: req.user.id, // 지우려는 게시글의 작성자가 본인인지 확인
        // postId 만 바꾸어 주소로 접근하면, 다른 사람이 자신의 게시글을 삭제하는 경우도 생길 위험이 있다 => 본인 확인 필요
      },
      // 선택된 id 를 가진 데이터 제거
    });
    res.status(200).json({ PostId: parseInt(req.params.postId, 10) }); 
    // 삭제된 게시물 id 프론트에 전달
    // params 는 문자열
    // 조회할 때 말고 적용할 때만 params 를 parseInt() 
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// 중복을 막음

module.exports = router;

// 시퀄라이즈 메서드
// findOne(), findAll(): 조회
// create(): 생성
// destroy(): 삭제
// update(): 수정