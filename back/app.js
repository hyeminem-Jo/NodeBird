const express = require('express'); 
const cors = require('cors'); // 도메인 에러 위반 대응
const session = require('express-session'); // 세션 관리용 미들웨어
const cookieParser = require('cookie-parser'); // 요청된 쿠키를 쉽게 추출할 수 있도록 도와주는 미들웨어
const passport = require('passport'); // 로그인 라이브러리
const dotenv = require('dotenv'); // 패스워드 키 보안
const morgan = require('morgan'); // 요청, 응답 표시
const path = require('path');

const postRouter = require('./routes/post');
// posts 라우터를 따로 하나 더 만듬 (단수와 복수의 동작을 철저히 구분)
// post 라우터에서는 게시글 하나만 쓰고 지우고, 댓글 하나만 쓰고 삭제하고 등.. 
// posts 라우터에서는 게시글을 여러 개 다룸
const postsRouter = require('./routes/posts');
const hashtagRouter = require('./routes/hashtag');
const userRouter = require('./routes/user');
const db = require('./models'); // sequelize 가 들어잇는 db
// db 를 조작할 땐 항상 await 을 써준다.
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
// 미들웨어는 위에서부터 아래로, 왼쪽에서부터 오른쪽으로 실행(순서 중요)
// 미들웨어는 똑같은 라우터가 있으면, 맨위에 있는 라우터만 실행되고 그 뒤로 실행 x
app.use(morgan('dev')); 
// 프론트에서서 백엔드로 요청할 때 요청, 응답이 터미널에 뜸
app.use(cors({
  origin: 'http://localhost:3060', // credentials: true 를 하면 보안때문에 정확한 주소를 기입해야함
  credentials: true, // 쿠키도 같이 전달
  // credentials: 'false', // false 는 기본값
}))

// 이미지 업로드 > PostCard.js 에서 이미지 경로 설정 후 uploads 폴더를 프론트에 제공할 수 있도록 설정
// '/' 슬래시 경로는 localhost:3065/ 이다.
// __dirname 는 현재(back) 폴더를 뜻하고, 그 안에 uploads 폴더를 합쳐준다.
// __dirname + '/uploads' <= 이렇게 안하고 node 에서는 보통 path.join() 을 해준다.
// => 이유: 맥, 윈도우 등 운영체제에 따라 경로 표시에 대한 차이가 있기 때문. path.join() 은 운영체제에 맞게 알아서 연결시켜준다.
app.use('/', express.static(path.join(__dirname, 'uploads')));

// front 로부터 받는 데이터 형태 (front -> back)
app.use(express.json()); // json 형태로 데이터를 받을 때 (axios 로 보내질 때)
app.use(express.urlencoded({ extended: true })); // form submit 으로 받을 때 (일반 form) 
// (현재 multipart(파일, 이미지, 동영상) 로 받는 옵션은 없음)

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

app.use('/hashtag', hashtagRouter); 
app.use('/posts', postsRouter); 
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