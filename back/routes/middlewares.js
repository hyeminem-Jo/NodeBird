// 로그인도 안했는데 로그아웃 주소로 접근할 시 
exports.isLoggedIn = (req, res, next) => { 
  // 로그인 여부 알 수 있는 방법:
  // 프론트: me 로 검사
  // 백엔드: req.user 로 검사하는 방법 / passport 에서 제공하는 isAuthenticated() 를 사용하는 방법
  if (req.isAuthenticated()) { 
    // req.isAuthenticated() 가 true 면 로그인 한 상태
    next();
    // next() 는 이전 강의에서 지금껏 에러처리하는데 사용해왔는데,
    // next() 는 사용방법이 2개가 있다.
    // 1. next() 안에 어떠한 에러든 넣으면 에러를 처리
    // 2. 그냥 next() 하면 다음 미들웨어로 넘어감
  } else {
    res.status(401).send('로그인이 필요합니다.');
  }
}

// 이미 로그인 했는데 또 로그인 주소로 접근 시
exports.isNotLoggedIn = (req, res, next) => { 
  if (!req.isAuthenticated()) { 
    next();
  } else {
    res.status(401).send('로그인 하지 않은 사용자만 접근 가능합니다.');
  }
}