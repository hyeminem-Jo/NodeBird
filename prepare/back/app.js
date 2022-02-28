const express = require('express'); 
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const db = require('./models'); // sequelize 가 들어잇는 db

const app = express(); // express 서버, 한 번 호출해줘야함

// 서버가 실행될 때 db sequelize 도 같이 연결된다.
db.sequelize.sync() // promise
  .then(() => {
    console.log('db 연결 성공');
  })
  .catch(console.error);

// front 에서 받은 data 를 해석하여 req.body 에 넣어줌
// .use 안에 들어가는 것은 미들웨어
app.use(express.json()); // front 에서 json 형태로 데이터를 보내줬을 때
app.use(express.urlencoded({ extended: true })); // form submit 을 했을 때
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

app.listen(3065, () => {
  console.log('서버 실행 중!!');
}); 

// 실행: node app


// app.use('/post', postRouter); 
// '/post' : prefix, 접두어 라고 함
// => 중복된 것이 바깥으로 빠져나감