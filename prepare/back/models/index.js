const Sequelize = require('sequelize');
const comment = require('./comment');
const hashtag = require('./hashtag');
const image = require('./image');
const post = require('./post');
const user = require('./user');

// 배포할 때는 프로덕션으로 바뀌고, 일단 개발할 때는 기본값은 development
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
// config.json 의 내용을 가져오는데, 현재 env 는 development 이므로 config.json 의 내용 중 "development": {} 객체 부분이 바로 config 이다.
const db ={};

const sequelize = new Sequelize(config.database, config.username, config.password, config)

// 클래스들을 그대로 넣어줌
db.Comment = comment;
db.Hashtag = hashtag;
db.Image = image;
db.Post = post;
db.User = user;

Object.keys(db).forEach(modelName => {
  db[modelName].init(sequelize);
})

// 이 코드를 통해 sequelize 가 node, MySQL 을 연결해준다.
// sequelize 는 내부적으로 mysql2 를 사용하고 있다.
// sequelize 드라이버에 설정 정보들을 보내줘서 연결

// db 를 반복문으로 associate 를 실행해 model 간 관계를 연결해줌
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// 시퀄라이즈에 모델들 등록
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

