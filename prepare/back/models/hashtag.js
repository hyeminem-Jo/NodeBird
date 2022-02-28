module.exports = (sequelize, DataTypes) => {
  const Hashtag = sequelize.define("Hashtag", {
    // id 가 기본적으로 들어가있다.
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4', 
    collate: 'utf8mb4_general_ci',
  });
  Hashtag.associate = (db) => {
    db.Hashtag.belongsToMany(db.Post, { through: "PostHashtag" });
    // 해시태그 하나에 게시글 여러 개
  };
  return Hashtag;
};

