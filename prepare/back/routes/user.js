const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const { User, Post } = require('../models'); // 사용자 테이블 불러오기
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const db = require('../models');
// 구조분해 없이 그냥 db 로 불러오면 db.User 로 써야함요

const router = express.Router();
// CRUD에서 조회는 GET(기존에 있는 정보를 띄워주기 ex. 게시글, 로그인 프로필, 팔로우 목록 ...), 
// 등록은 POST, 수정은 PUT, 삭제는 DELETE

// ** 새로고침 시 매번 사용자 정보 복구 
// (새로고침해도 브라우저에 쿠키가 남아있어 쿠키를 서버에 보냄)
// 로그인 상태에서 새로고침 시 항상 브라우저에서 요청을 하고 쿠키 id 로 서버에서 사용자 정보 복구 후 브라우저로 보냄 => 서버에서 로그인 되었는지 조회 (GET)
// => 하지만 사용자가 항상 로그인 상태인 것이 아닌 로그아웃인 상태도 있을 것이고, 로그아웃인 상태에서도 새로고침하면 로그인 요청이 될 수도 있다. 이 경우 req.user.id 에서 에러가남
// => 이유: deserealizeUser 는 로그인 이후로만 실행하고, 로그인 상태가 아니라면 req.user 가 존재 x
// => 해결: (복구된 정보)req.user 가 존재하는지(로그인 되었는지) 먼저 확인 후 브라우저로 보냄
router.get('/', async (req, res, next) => { // GET /user/
  try {
    if (req.user) { // 복구할 때도 마찬가지로 "완성된" user 정보를 가져온다.
      const fullUserWithoutPassword = await User.findOne({
        // 로그인 이후로는 항상 라우터 접근 전 deserealizeUser 에 들러 쿠키의 id 를 통해 복구된 사용자 정보(user) 를 req.user 에 담음
        where: { id: req.user.id },
        attributes: {
          exclude: ['password'] 
        },
        include: [ 
          {
            model: Post,
            attributes: ['id'],
            // 서버로부터 필요한 데이터만 불러오기
            // 게시글 내용, 팔로잉, 팔로워까지 전부 통채로 가져오면 데이터 용량이 크기 때문에 id 만 가져옴
            // 첫 화면에서는 게시글, 팔로잉, 팔로워의 갯수(length) 만 필요
          },
          {
            model: User,
            as: 'Followings',
            attributes: ['id'],
          },
          {
            model: User,
            as: 'Followers',
            attributes: ['id'],
          },
        ]
      })
      res.status(200).json(fullUserWithoutPassword); 
      // 로그인 상태에서 새로고침 시 서버에서 사용자 정보 복구 후 브라우저로 보냄
    } else {
      res.status(200).json(null); // 로그아웃 때 새로고침 시 아무것도 안보내면 됨
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// ** 로그인
// local 에서 만든 passport 전략을 user/login 부분에 실행
// done 은 콜백의 개념이라 세개의 인자가 다음의 passport.authenticate('local', ) 의 두번째 인자로 전달됨 
// => done(null, false, { reason: '존재하지 않는 이메일입니다!' })
// => (err, user, info) 는 매개변수라 마음대로 지음
router.post('/login', isNotLoggedIn,(req, res, next) => { // 미들웨어 확장(express 기법)
  // isNotLoggedIn: 로그인 안한 사람이 로그인 접근 가능
  // next() 로 인해 다음 미들웨어 (passport.authenticate()) 로 이동 
  passport.authenticate('local', (err, user, info) => {
    if (err) { // 서버쪽에 에러가 있는 경우
      console.error(err);
      return next(err);
      // 지금까지 에러가 나면 next 로 알아서 했는데, next 나 res 변수가 없기 때문에 쓸 수가 없다. 그래서 미들웨어를 확장해서 쓴다. (제로초 백엔드 5강 패스포트(passport)로 로그인하기 14분)
      // router 나 app 에 붙는 것들이 미들웨어
      // passport.authenticate()는 원래 req, res, next 를 쓸 수 없는 미들웨언데 이를 확장하는 방식을 써서 쓸 수 있게 했다.
    }
    if (info) { // done 의 세번째 인자(=클라이언트 에러)가 있을 때
      return res.status(401).send(info.reason); // 클라이언트로 응답 보냄
      // status 번호 중 403 은 금지, 허용되지 않은 요청이다.
      // 로그인시 나는 클라이언트 에러는 보통 401(미승인, 비인증)을 쓴다.
      // 궁금하면 http 상태코드를 검색하면 됨 (각 코드별 뜻)
      // 200 번대 성공, 300번대 리다이렉트나 캐싱, 400번대 클라이언트에러, 500번대 서버에러
    }
    // 진짜 로그인 실행 (passport 에 들어있는 것)
    // 자사서비스 로그인이 아닌 passport 로그인
    // => 자사서비스 로그인이 성공하면 passport 로그인을 한 번 더함
    // passport 에서 로그인 할 수 있게 허락
    return req.login(user, async (loginErr) => {
      if (loginErr) { // 혹시나 로그인 과정에서 에러가 발생했을 때
        // 여기서 에러나는 일은 극히 드뭄 (혹시나 해서 처리)
        console.error(loginErr)
        return next(loginErr); 
      }

      // User 에 데이터 추가, 삭제해서 정보를 "완성"한 뒤 서버에 요청
      // User 에 기본적인 정보(email, password 등) 밖에 없으므로, 연관된 데이터를 모델에서 연관시켰던 데이터로 가져와 완성한 채로 가져온다.
      // 비밀번호를 제외한 모든 유저정보
      // 사용자 정보가 있는데 사용자를 다시 찾는 이유: 
      // 현재 부족한 사용자 정보에 대해 추가나 삭제를 해줌 (Posts, Followings ..)
      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        // attributes: db 에서 '받고 싶은 데이터만' 들고올 수 있다.
        // 이렇게 하면 createdAt, updatedAt, password 는 안가져와짐
        // attributes: ['id', 'nickname', 'email'],
        attributes: {
          // exclude: 제외하고자 하는 데이터만 입력하고 싶을 때
          exclude: ['password'] // 비밀번호만 제외해서 가져옴
        },
        // Posts, Followings, Followers 에 대한 데이터 추가
        include: [ // include 할 때 as 가 있으면 as 까지 같이 작성
          {
            model: Post,
            attributes: ['id'],
            // 서버로부터 필요한 데이터만 불러오기
            // 게시글 내용, 팔로잉, 팔로워까지 전부 통채로 가져오면 데이터 용량이 크기 때문에 id 만 가져옴
            // 첫 화면에서는 게시글, 팔로잉, 팔로워의 갯수(length) 만 필요
          },
          {
            model: User,
            as: 'Followings',
            attributes: ['id'],
          },
          {
            model: User,
            as: 'Followers',
            attributes: ['id'],
          },
        ]
      })
      // req.login() 을 할 때 내부적으로 setHeader 에서 쿠키를 보내고, 자동으로 세션과 연결시켜준다.
      // req.setHeader('Cookie', 'cxlhy..')
      // 서버쪽에서는 데이터를 통채로 들고 있고, 프론트에는 랜덤한 문자열만 보내 보안의 위협을 최소로 한다. => "쿠키"
      // 서버쪽에 통채로 데이터를 들고 있는 것이 "세션"
      return res.status(200).json(fullUserWithoutPassword); // 사용자 정보 프론트로 넘겨줌
    })
  })(req, res, next);
}) // POST /user/login

// ** 회원가입
// app.js 에 있는 "/user" 와 "/" 가 합쳐짐
router.post('/', isNotLoggedIn, async (req, res, next) => { // POST /user/
  // isNotLoggedIn: 로그인 안한 사람이 회원가입 접근 가능
  try {
    // email 이 겹치는 유저가 있으면 exUser 에 저장
    const exUser = await User.findOne({ 
      where: { // 조건은 where 안에 적음
        email: req.body.email,
        // 혹시 기존의 저장되어있던 사용자들 중 front 에서 보낸 email 과 같은 email 을 사용하고 있는 사용자가 있는지 확인
      }
    })
    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디입니다.');
      // status(403): 간단한 상태 코드를 보낼 수 있음, 403 은 금지의 의미
      // 응답은 무조건 한 번 보내야하는데, 이 res 와 아래코드의 res 까지 실행되면 안되므로 return 을 꼭 붙여준다.
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12); 
    // 비번 hash 화 () 안의 숫자는 보통 10~13 으로, 높을 수록 보안성 증가
    // 하지만 너무 높게 하면 서버가 느려질 수 있음 (적절히 사용)

    await User.create({ // create(): 테이블 안에 데이터를 넣음
      // await 을 붙여야 실제 데이터가 들어감
      email: req.body.email, // data {email}
      nickname: req.body.nickname, // data {nickname}
      password: hashedPassword, // data {password}
    });
    res.status(201).send("ok"); // 요청에 대한 성공적인 응답: 200
  } catch (error) {
    console.error(error);
    next(error); // status(500)
    // next 를 통해 에러를 보내면 에러들이 한번에 처리됨
    // 에러처리를 따로따로 하기 귀찮을 때 catch 에서 한번에 next 로 보내줌
  }
});

// ** 로그아웃
router.post('/logout', isLoggedIn, (req, res) => { // 세션, 쿠키 지우면 끝
  // isNotLoggedIn: 로그인 한 사람이 로그아웃 접근 가능
  // router.post('/user/logout', (req, res) => { // 세션, 쿠키 지우면 끝
  req.logout();
  req.session.destroy(); // 저장된 쿠키, id 제거
  res.send('ok') // 로그아웃 성공
})

// ** 닉네임 수정
router.patch('/nickname', isLoggedIn, async (req, res, next) => {
  try {
    await User.update( // id 가 본인인 nickname 을 수정
      {
        nickname: req.body.nickname, // 본인 id 의 닉네임을 front 로부터 받은 닉네임으로 수정
      },
      {
        where: { id: req.user.id }, //  남의 nickname 수정 x
      }
    );
    res.status(200).json({ nickname: req.body.nickname }); // 수정된 닉네임 다시 전달
  } catch (error) {
    console.error(error);
    next();
  }
})

// ** 팔로우 PATCH/user/1/follow
router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => {
  try {
    // 실존 유저인지 검사 (없는 사람을 팔로잉 할 수 없으니 팔로잉 한 유저가 실존하는지 체크)
    // * 조회할 때는 params 숫자로 안해도 됨
    const user = await User.findOne({
      where: { id: req.params.userId }  // 내가 팔로우 하려는 유저 id
    }); 
    if (!user) {
      res.status(403).send('팔로우 실패, 존재하지 않는 계정입니다.');
      // 403: 금지
    }
    // 팔로우 버튼을 누르면 내가 그 사람의 '팔로워' 가 되기 때문
    await user.addFollowers(req.user.id); // 상대 팔로우리스트에 나의 id 추가
    // front 에 내 팔로잉 리스트에 추가할 유저 id 전달 (내 프로필에서 팔로잉 +1 해야되기 때문)
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) }); // parsInt() 안해주납..?
  } catch (error) {
    console.error(error);
    next();
  }
})

// ** 팔로우 취소 (팔로잉 제거) DELETE/user/1/follow
router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send('언팔로우 실패, 존재하지 않는 계정입니다.') // 실존 유저인지 검사 
    }
    await user.removeFollowers(req.user.id); // 상대 팔로우리스트에서 나의 id 제거
    // front 에 내가 팔로잉 리스트에서 삭제할 유저 id 전달 (내 프로필에서 팔로잉 -1 해야되기 때문)
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) }); // parsInt() 안해주납..?
  } catch (error) {
    console.error(error);
    next();
  }
})

// ** 팔로워 제거 DELETE/user/follower/1
router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne(
      { where: { id: req.params.userId }} // 제거할 팔로워 id
    ); 
    if (!user) { // 상대 계정이 실존하는지 검사
      res.status(403).send('차단 실패, 존재하지 않는 계정입니다.');
    }
    await user.removeFollowings(req.user.id) // 상대(내 팔로워)의 팔로잉에서 '나'를 삭제
    // 내가 그 사람을 차단하는 것 === 그 사람이 나를 팔로잉 끊는 것
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) })
  } catch (error) {
    console.error(error);
    next();
  }
})

// ** 팔로워 유저들 목록 불러오기 (세부 정보) GET/user/followers
// 팔로잉, 팔로워 정보: Followers[], Followings[] 는 프로필에서 개수 표현만 하기 위해 DB 에서 attribute 를 통해 id 만 가지고 왔었다.
// 팔로잉, 팔로워 리스트에서 그 유저들의 세부 정보를 가져와보서 표현하자
router.get('/followers', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id }  // '나' 를 먼저 찾고 거기서 getFollowers 로 Followers 를 찾음
    }); 
    if (!user) {
      res.status(403).send('팔로워 목록 불러오기 실패, 존재하지 않는 계정입니다.') // 실존 유저인지 검사 
    }
    const followers = await user.getFollowers();
    res.status(200).json(followers); 
  } catch (error) {
    console.error(error);
    next();
  }
})

// ** 팔로잉 유저들 목록 불러오기 (세부 정보) GET/user/followings
router.get('/followings', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id }  // '나' 를 먼저 찾고 거기서 getFollowers 로 Followers 를 찾음
    }); 
    if (!user) {
      res.status(403).send('팔로잉 목록 불러오기 실패, 존재하지 않는 계정입니다.') // 실존 유저인지 검사 
    }
    const followings = await user.getFollowings();
    res.status(200).json(followings); 
  } catch (error) {
    console.error(error);
    next();
  }
})


module.exports = router;