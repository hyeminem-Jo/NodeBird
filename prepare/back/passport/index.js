const passport = require('passport');
const local = require('./local');
const { User } = require('../models');

module.exports = () => {
  // 설정

  // (1) 로그인 시 한 번만
  // user: 
  // req.login() 에서 받은 user
  // => done(서버에러, 성공, 클라이언트 에러) 에서의 ("성공" 부분)
  // ** done 이후에 만들어진 세션쿠키와 가져온 id값을 done이후에 시리얼라이즈 객체로 만든뒤 직렬화시키고 세션에 저장
  passport.serializeUser((user, done) => { // user 를 통해서 id 가져옴
    done(null, user.id); // 쿠키와 묶어줄 유저 정보 id 만 저장(가벼움)
  });

  // (2) 로그인 성공 후 그 다음 요청부터 계속...
  // 제로초로 로그인 했을 시, 이전에 저장된 id 와 connet.sid 라는 쿠키가 함께 다음 요청때 보내진다. => id 를 받아 사용자 정보를 복구
  // 브라우저에서 쿠키를 보내면 서버를 들르기 전에 db 를 방문해 쿠키와 연결된 id 로 user 정보를 복원해서 가져옴
  // ** 세션에 저장된 데이터를 다시 시퀄라이즈 객체로 바꾸는 작업
  // deserialize에서 복구된 값은 req.body가 아니라 req.user에 들어감
  //  deserializeUser는 serializeUser의 user.id를 가져오는 게 아닌 세션 쿠키를 통해서 메모리에 저장된 id 를 찾아서 가져오는 것
  passport.deserializeUser(async (id, done) => { // id 를 통해서 user 정보를 가져옴
    try {
      const user = await User.findOne({ where: { id } });
      done(null, user); // id 로 모두 복원된 user 정보(무거움)
      // 위의 것을 req.user 안에 넣어줌 (정보 복구 후 req 에 담음)
      // ex) 로그아웃 시 req.user 정보 사용
    } catch (error) {
      console.error(error);
      done(error);
    }
    
  })

  // 로컬 실행
  local();
}