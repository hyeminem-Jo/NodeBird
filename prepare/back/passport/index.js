const passport = require('passport');
const local = require('./local');

module.exports = () => {
  // 설정
  passport.serializeUser(() => {

  });
  passport.deserializeUser(() => {

  })

  // 로컬 실행
  local();
}