const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const { User } = require('../models'); // 사용자 테이블 불러오기
// 구조분해 없이 그냥 db 로 불러오면 db.User 로 써야함요

const router = express.Router();

// local 에서 만든 passport 전략을 user/login 부분에 실행
// done 은 콜백의 개념이라 세개의 인자가 다음의 passport.authenticate('local', ) 의 두번째 인자로 전달됨 
// => done(null, false, { reason: '존재하지 않는 이메일입니다!' })
// => (err, user, info) 는 매개변수라 마음대로 지음
router.post('/login', (req, res, next) => { // 미들웨어 확장(express 기법)
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
      return res.json(user); // 사용자 정보 프론트로 넘겨줌
    })
  })(req, res, next);
}) // POST /user/login

// app.js 에 있는 "/user" 와 "/" 가 합쳐짐
router.post('/', async (req, res, next) => { // POST /user/
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
    res.status(200).send("ok"); // 요청에 대한 성공적인 응답: 200
  } catch (error) {
    console.error(error);
    next(error); // status(500)
    // next 를 통해 에러를 보내면 에러들이 한번에 처리됨
    // 에러처리를 따로따로 하기 귀찮을 때 catch 에서 한번에 next 로 보내줌
  }
});

module.exports = router;