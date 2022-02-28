module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define("Image", {
    // id 가 기본적으로 들어가있다.
    src: {
      type: DataTypes.STRING(200), // url 이 길어질 경우를 대비
      allowNull: false,
    },
  }, {
    charset: 'utf8', 
    collate: 'utf8_general_ci',
  });
  Image.associate = (db) => {
    db.Image.belongsTo(db.Post);
  };
  return Image;
};

// 서비스에서 필수 정보가 다 명시됐다.
// 사용자 정보, 게시글 정보, 사용자가 남긴 댓글, 게시글에 있는 해시태그 및 이미지