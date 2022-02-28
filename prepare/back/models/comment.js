module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define("Comment", {
    // id 가 기본적으로 들어가있다.
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // UserId: {1}
    // PostId: {3}
    // 해석: 1번 사용자가 쓴 댓글, 3번 게시물에 달린 댓글
  }, {
    charset: 'utf8mb4', 
    collate: 'utf8mb4_general_ci',
  });
  Comment.associate = (db) => {
    db.Comment.belongsTo(db.User);
    // 어떤 댓글은 사람(작성자)한테 속해있다
    db.Comment.belongsTo(db.Post);
    // 댓글 하나 적으면 그 게시글은 하나
  };
  return Comment;
};

// belongsTo() 는 고유 id 컬럼을 만들어준다. (소속된 곳의 고유 id 가 들어감)

