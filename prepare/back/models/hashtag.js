const DataTypes = require('sequelize');
const { Model } = DataTypes; // sequelize 에 Model 이란 객체가 있음

module.exports = class Hashtag extends Model {
  static init(sequelize) { // Model 에 init 을 호출해주어야 테이블이 생성됨
    // sequelize.define => Model.init 으로 바뀌었다 생각하면 됨
    return super.init( // init 에는 인수가 두개 들어감 
      { 
        name: { // id 가 기본적으로 들어가있다.
          type: DataTypes.STRING(20),
          allowNull: false,
        },
      },
      { // 설정 객체
        modelName: 'Hashtag',
        tableName: 'hashtags', // 테이블 명은 자동으로 소문자 + 복수형으로 바뀜
        charset: 'utf8mb4', 
        collate: 'utf8mb4_general_ci',
        sequelize, // index.js 로부터 연결 객체를 클래스로 다시 보내줌
      }, 
    );
  }

  static associate(db) {
    db.Hashtag.belongsToMany(db.Post, { through: "PostHashtag" });
    // 해시태그 하나에 게시글 여러 개
  }
}



// module.exports = (sequelize, DataTypes) => {
//   const Hashtag = sequelize.define("Hashtag", {
//     // id 가 기본적으로 들어가있다.
//     name: {
//       type: DataTypes.STRING(20),
//       allowNull: false,
//     },
//   }, {
//     charset: 'utf8mb4', 
//     collate: 'utf8mb4_general_ci',
//   });
//   Hashtag.associate = (db) => {
//     db.Hashtag.belongsToMany(db.Post, { through: "PostHashtag" });
//     // 해시태그 하나에 게시글 여러 개
//   };
//   return Hashtag;
// };

