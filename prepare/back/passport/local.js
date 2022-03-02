const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
// 변수명을 Strategy 그대로 써도 되지만, LocalStrategy 로 바꾸면 좋다
// { Strategy: LocalStrategy } : 구조분해 할 때 변수명 바꾸는 문법
// ex) 나중에 카카오 로그인이면 CacaoStrategy 로 바꿀 수 있다.
const { User } = require('../models'); // 시퀄라이즈 재사용
const bcrypt = require('bcrypt')

module.exports = () => { 
  passport.use(new LocalStrategy({
    usernameField: 'email', // 아이디 칸
    passwordField: 'password', // 비밀번호 칸
    // 위 코드 의미: 프론트(sagas user.js)에서 data.email, data.password 형태였던 것이 서버로 전해져 백엔드(routes user.js) 로 가면 req.body.email, req.body.password 형태로 전해지는데, 그것을 표현한 것이다.
  }, async (email, password, done) => {
    // 비동기 요청을 하면 서버에러가 발생할 수 있기 때문에 try 를 써준다.
    // => 항상 await 은 try 로 감싸주어야함
    try { 
      const user = await User.findOne({ // 조건은 where 안에 적음
        where: { email } // es6 부터 { email: email } 를 줄일 수 있음
      });
      // 1. 이메일(아이디) 검사
      if (!user) { // 이메일 틀림(회원가입된 사용자가 아니면 로그인 안됨)
        // 클라이언트 실패(1)
        return done(null, false, { reason: '존재하지 않는 이메일입니다!' });
        // done 으로 결과 판단
        // done(서버에러, 성공, 클라이언트 에러(보내는 측에서 잘못됨))
        // done 은 콜백의 개념이라 세개의 인자가 passport.authenticate('local', ) 의 두번째 인자로 전달됨
        // res.status(403);
      }
      // 2. 비밀번호 검사 
      // 비밀번호 비교 (이메일 통과 후 비밀번호 선별)
      // 유저가 입력한 password 와 db 에 저장된 password 비교
      // user 에 user.email, nickname, password, createdAt 등 테이블 객체가 전부 들어있다. (findOne 은 documents 객체 하나를 반환)
      // compare 는 비동기 함수 이므로 await 을 붙여주어야함
      const result = await bcrypt.compare(password, user.password); 
      if (result) { // 비밀번호가 일치할 때(이메일, 비밀번호 모두 부합)
        return done(null, user); // "성공" 인자 부분에 사용자 정보 삽입
      } 
      // 비밀번호가 일치하지 않을 때 
      // 클라이언트 실패(2)
      return done(null, false, { reason: '비밀번호가 틀렸습니다.' });

    } catch (error) { // 서버 실패(1)
      console.error(error); // 에러가 무엇인지 항상 확인
      return done(error); // 서버 에러인 경우 done 으로 
    }
    
  }));
};

// 로그인 전략: 하나는 객체, 하나는 함수로 인자가 들어감
// 첫 번째 인자: req.body 에 대한 설정
// 두 번째 인자: 로그인 전략 (이메일이 진짜 있는지 검사)
