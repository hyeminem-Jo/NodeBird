module.exports = (sequelize, DataTypes) => {
  // MySQL 에서는 users
  const User = sequelize.define(
    "User",
    {
      // 액셀이라 생각하고 작성
      // id 가 기본적으로 들어가있다.
      // id: {}, id 는 mysql 에서 1, 2, 3... 자동으로 넣어줌

      // 로그인 할 때 사용자 정보
      // email, nickname, password 는 컬럼이라 부른다. (엑셀에서 세로줄)
      email: {
        type: DataTypes.STRING(30), // data 타입, 글자 수 제한
        allowNull: false, // true: 선택기입, false: 필수기입
        unique: true, // 로그인 할 때 email 은 아이디기 때문에 고유해야한다.
      },
      nickname: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false, // 로그인할 때 비밀번호는 필수
      },
    },
    {
      // 해당 User model 에 대한 세팅
      charset: "utf8",
      collate: "utf8_general_ci", // 한글 저장
    }
  );
  User.associate = (db) => {
    db.User.hasMany(db.Post); // db 에서는 Posts, 응답으로 줄 때도 Posts[]
    db.User.hasMany(db.Comment);
    db.User.belongsToMany(db.Post, { through: "Like", as: "Liked" });

    // 같은 테이블, 다대다
    // 서로 팔로우, 팔로잉 하는 유저
    // 팔로잉하는 사람은 다수의 팔로워들을 가질 수 있고, 팔로워들은 다수를 팔로잉 할 수 있다.
    // 찾을 때 반대로 찾아야됨 :
    // ex) 한 유저의 팔로워를 찾고 싶다면, 그 "팔로잉" 당하는 유저가 누구인지 부터 찾아야 한다.
    // 제로의 '팔로잉 리스트'를 보고 싶다면, '팔로워' 입장인 제로의 id 로 찾아야함
    // 팔로잉(갑)  팔로워
    // 이영지   <  제로
    // 아이유   <  제로  
    // 장동건   <  제로
    db.User.belongsToMany(db.User, {
      through: "Follow",
      as: "Followers", // addFollowers()
      foreignKey: "FollowingId", 
      // 팔로워 리스트 key: 나를 '팔로잉' 한 사람들
    });
    db.User.belongsToMany(db.User, {
      through: "Follow",
      as: "Followings",
      foreignKey: "FollowerId",
      // 팔로잉 리스트 key: 내가 '팔로워' 인 사람들
    });
  };
  return User;
};

// 같은 테이블, 다대다: foreignKey, as
// 같은 테이블, 1대다: as 만

// STRING(문자), TEXT(긴 글), BOOLEAN(참,거짓), INTEGER(정수), FLOAT(실수), DATETIME(?)
