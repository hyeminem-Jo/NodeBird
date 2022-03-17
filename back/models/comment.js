const DataTypes = require('sequelize');
const { Model } = DataTypes; // sequelize 에 Model 이란 객체가 있음

module.exports = class Comment extends Model {
  static init(sequelize) { // Model 에 init 을 호출해주어야 테이블이 생성됨
    // sequelize.define => Model.init 으로 바뀌었다 생각하면 됨
    return super.init( // init 에는 인수가 두개 들어감 
      { 
        content: { // id 가 기본적으로 들어가있다.
          type: DataTypes.TEXT,
          allowNull: false,
        },
        // UserId: {1}
        // PostId: {3}
        // 해석: 1번 사용자가 쓴 댓글, 3번 게시물에 달린 댓글
      },
      { // 설정 객체
        modelName: 'Comment',
        tableName: 'comments', // 테이블 명은 자동으로 소문자 + 복수형으로 바뀜
        charset: 'utf8mb4', 
        collate: 'utf8mb4_general_ci',
        sequelize, // index.js 로부터 연결 객체를 클래스로 다시 보내줌
      }, 
    );
  }

  static associate(db) {
    db.Comment.belongsTo(db.User);
    // 어떤 댓글은 사람(작성자)한테 속해있다
    db.Comment.belongsTo(db.Post);
    // 댓글 하나 적으면 그 게시글은 하나
  }
}

// belongsTo() 는 고유 id 컬럼을 만들어준다. (소속된 곳의 고유 id 가 들어감)




// module.exports = (sequelize, DataTypes) => {
//   const Comment = sequelize.define("Comment", {
//     // id 가 기본적으로 들어가있다.
//     content: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     // UserId: {1}
//     // PostId: {3}
//     // 해석: 1번 사용자가 쓴 댓글, 3번 게시물에 달린 댓글
//   }, {
//     charset: 'utf8mb4', 
//     collate: 'utf8mb4_general_ci',
//   });
//   Comment.associate = (db) => {
//     db.Comment.belongsTo(db.User);
//     // 어떤 댓글은 사람(작성자)한테 속해있다
//     db.Comment.belongsTo(db.Post);
//     // 댓글 하나 적으면 그 게시글은 하나
//   };
//   return Comment;
// };


