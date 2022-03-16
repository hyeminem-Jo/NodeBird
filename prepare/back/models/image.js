const DataTypes = require('sequelize');
const { Model } = DataTypes; // sequelize 에 Model 이란 객체가 있음

module.exports = class Image extends Model {
  static init(sequelize) { // Model 에 init 을 호출해주어야 테이블이 생성됨
    // sequelize.define => Model.init 으로 바뀌었다 생각하면 됨
    return super.init( // init 에는 인수가 두개 들어감 
      { 
        src: {
          type: DataTypes.STRING(200), // url 이 길어질 경우를 대비
          allowNull: false,
        },
      },
      { // 설정 객체
        modelName: 'Image',
        tableName: 'images', // 테이블 명은 자동으로 소문자 + 복수형으로 바뀜
        charset: 'utf8', 
        collate: 'utf8_general_ci',
        sequelize, // index.js 로부터 연결 객체를 클래스로 다시 보내줌
      }, 
    );
  }

  static associate(db) {
    db.Image.belongsTo(db.Post);
  }
}
// 서비스에서 필수 정보가 다 명시됐다.
// 사용자 정보, 게시글 정보, 사용자가 남긴 댓글, 게시글에 있는 해시태그 및 이미지



// module.exports = (sequelize, DataTypes) => {
//   const Image = sequelize.define("Image", {
//     // id 가 기본적으로 들어가있다.
//     src: {
//       type: DataTypes.STRING(200), // url 이 길어질 경우를 대비
//       allowNull: false,
//     },
//   }, {
//     charset: 'utf8', 
//     collate: 'utf8_general_ci',
//   });
//   Image.associate = (db) => {
//     db.Image.belongsTo(db.Post);
//   };
//   return Image;
// };

// // 서비스에서 필수 정보가 다 명시됐다.
// // 사용자 정보, 게시글 정보, 사용자가 남긴 댓글, 게시글에 있는 해시태그 및 이미지