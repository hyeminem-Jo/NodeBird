module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define("Post", {
  // id 가 기본적으로 들어가있다.w
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4', // 게시글을 쓸 때 이모티콘 같은 것도 넣으려면 mb4 추가
    collate: 'utf8mb4_general_ci', // 이모티콘 저장
  });
  Post.associate = (db) => {
    db.Post.belongsTo(db.User); // post.addUser (단수)
    // 어떤 게시글은 사람(작성자)한테 속해있다
    db.Post.hasMany(db.Comment); // post.addComments (복수)
    // 게시글 하나에 댓글이 여러 개
    db.Post.hasMany(db.Image); // post.addImages (복수)
    // 게시글 하나에 사진이 여러 개
    db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" }); // post.addHashtags
    // 게시글 하나에 해시태그 여러 개

    // 좋아요: 다대다
    db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers' }); 
    // 관계 메서드: sequalize 에서 관계 메서드를 생성해줌
    // => 테이블 간의 관계를 이용할 수 있다.
    // post.addLikers 라는 것이 생김 (=> 게시글에 좋아요 한사람 추가)
    // 그 외 remove(지우기) get(가져오기), set(바꾸기) ...
    // get 은 상대적으로 쓰임새가 떨어짐 (include 를 사용하면 되서)

    // as 에 따라서 post.getLikers 처럼 게시글 좋아요 누른 사람을 가져올 수 있다.
    // user: 게시물에 좋아요를 누른 사람들

    // 같은 테이블, 1 대 다
    // 리트윗: 어떤 게시글이 어떤 게시글의 리트윗 일 수 있다.
    // 한 게시글을 여러 게시글이 리트윗 
    db.Post.belongsTo(db.Post, { as: "Retweet" }) // PostId => RetweetId
  };
  return Post;
};

// 같은 테이블, 다대다: foreignKey, as
// 같은 테이블, 1대다: as 만