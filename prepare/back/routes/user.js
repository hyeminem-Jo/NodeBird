const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models'); // 사용자 테이블 불러오기
// 구조분해 없이 그냥 db 로 불러오면 db.User 로 써야함

const router = express.Router();

// app.js 에 있는 "user/" 와 "/" 가 합쳐짐
router.post('/', async (req, res, next) => { // POST /user/
  try {
    const exUser = await User.findOne({ // email 이 겹치는 유저가 있으면 exUser 에 저장
      where: {
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