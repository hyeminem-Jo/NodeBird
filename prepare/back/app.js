const express = require('express'); 
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const dotenv = require('dotenv');

const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const db = require('./models'); // sequelize 가 들어잇는 db
const passportConfig = require('./passport');

dotenv.config();
const app = express(); // express 서버, 한 번 호출해줘야함

// 서버가 실행될 때 db sequelize 도 같이 연결된다.
db.sequelize.sync() // promise
  .then(() => {
    console.log('db 연결 성공');
  })
  .catch(console.error);

passportConfig();

// front 에서 받은 data 를 해석하여 req.body 에 넣어줌
// .use 안에 들어가는 것은 미들웨어
app.use(cors({
  origin: '*', // 모든 주소를 허용
  // credentials: 'false', // false 는 기본값
}))
app.use(express.json()); // front 에서 json 형태로 데이터를 보내줬을 때
app.use(express.urlencoded({ extended: true })); // form submit 을 했을 때
// 세션/쿠키 설정, 미들웨어들 삽입
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 만들 때 secret 사용
app.use(session({
  saveUninitialized: false,
  resave: false, 
  // 위 두개 속성은 true 로 할 일이 드물다
  secret: process.env.COOKIE_SECRET,
  // secret: 'nodebirdsecret'
  // secret: 쿠키에 랜덤한 문자열을 보낸다 했는데, 사실 실제데이터를 기반으로 만들어짐
  // 이때 secret 이 노출되어 secret 의 key 값인 nodebirdsecret 가 노출되면, 실제데이터가 복원될 수 있어 이로 인해 해킹당할 수 있다.
}));
app.use(passport.initialize());
app.use(passport.session());
// ** 코드가 다른 라우터들보다 상단에 위치해야함

// get: 메서드, '/': url
app.get('/', (req, res) => { // 메인페이지('/') 를 가져온다(get)
  res.send('hello express');
})

app.get('/', (req, res) => { // 메인페이지('/') 를 가져온다(get)
  res.send('hello api'); // 문자열을 응답
})

app.get('/posts', (req, res) => {
  res.json([ 
    { id: 1, content: 'hello'},
    { id: 2, content: 'hello2'},
    { id: 3, content: 'hello3'},
  ])
})

app.use('/post', postRouter); // => 중복된 것이 바깥으로 빠져나감
app.use('/user', userRouter); 

// next() 가 에러처리 되는 부분은 이 현재 코드위치에 내부적으로 존재 (안보임)
// 내부적으로 이미 존재하지만, 이 기본적인 에러처리 미들웨어를 직접 다르게 바꾸고 싶으면 아래처럼 작성하면 됨
// ex) 에러처리 페이지를 따로 만들거나, 에러처리 되는 부분을 수정하고 싶다든가 등
// 에러처리 미들웨어는 err 까지 인자가 4개다.
// app.use((err, req, res, next) => {

// })

app.listen(3065, () => {
  console.log('서버 실행 중!!');
}); 

// 실행: node app


// app.use('/post', postRouter); 
// '/post' : prefix, 접두어 라고 함
// => 중복된 것이 바깥으로 빠져나감