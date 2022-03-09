const express = require('express');
const multer = require('multer'); // 백엔드에 파일, 이미지, 동영상 전송 가능
// multer 는 app(app.js) 에 장착해도 되지만, 보통 router 마다 장착한다.
// 이유: Form 마다 이미지를 한장 올리거나, 여러 장 올리거나, 이미지 없이 텍스트만 올리는 등 보내는 매체와 수, 데이터의 타입들이 다르고 app 에 장착해버리면 모든 라우터에 공통적으로 적용되버리기 때문에 라우터마다 개별적으로 넣어줘야 함
const path = require('path'); // node 에서 기본적으로 제공하는 모듈 (설치 필요x)
const fs = require('fs'); // 파일 시스템을 조작할 수 있는 모듈
// 'uploads' 라는 폴더 안에 이미지들을 넣기로 했는데, 'uploads' 폴더가 존재하지 않는다고 에러가 뜸
// node 를 사용하면 node 를 통해 폴더를 생성시킬 수 있다. => node 에서 제공하는 모듈인 fs 사용

const { Post, Comment, Image, User, Hashtag } = require('../models');
// 게시글이나 댓글 역시 로그인이 되어있는지 확인한 후에 접근 가능하도록 설정
const { isLoggedIn } = require('./middlewares');

const router = express.Router();
// app >> router 변경

try { // uploads 폴더 미리 만들어주기
  fs.accessSync('uploads');
} catch (error) {
  console.log('uploads 폴더가 없으므로 생성합니다.');
  fs.mkdirSync('uploads'); // uploads 폴더 생성된 것을 확인 가능
}

// 이미지 upload (코드를 맨 위에 올려놔야 다른 router 에서도 쓸 수 있음)
// multer 세팅: multer 함수에 옵션을 넣어줌
// 보통 diskStorage(컴퓨터의 하드디스크) 에 저장
// 나중엔 아마존 s3 라는 클라우드에 저장 
// => 컴퓨터 하드디스크에 저장할 경우: 나중에 백엔드 서버가 요청을 많이 받아 서버 스케일링(같은 서버를 여러 대 복사)을 해줘야 할 때, 컴퓨터의 uploads 폴더에 넣어 놓으면 서버를 복사할 때마다 이미지도 같이 복사되어 넘어가면서 서버에 쓸데없이 공간차지를 하게 됨
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads'); // destination 은 uploads 라는 폴더에 저장
    },
    filename(req, file, done) { // ex) 제로초.png 일경우
      // 파일명이 가끔씩 중복될 때가 있는데 그럴 경우 기본적으로 node 는 기존 파일 위에 덮어씌워 버린다.
      // 그렇기 때문에 업로드 할 시 파일명 뒤에 언제 업로드가 되었는지 날짜(밀리초 까지)를 붙여준다.
      
      // 1. 확장자 추출(.png)
      const ext = path.extname(file.originalname); // .png
      // 2. 확장자 삽입, '제로초' 라는 이름 꺼낼 수 있음
      const basename = path.basename(file.originalname, ext); // 제로초
      // 3. (파일명 저장) 이름 뒤에 시간 초와 확장자를 붙여줌
      done(null, basename + '_' + new Date().getTime() + ext); // 제로초202203051997.png
    },
  }),
  // 파일을 너무 크게 올리면 문제가 발생할 수 있음 (파일 업로드도 서버 공격이 될 수 있음)
  // 하지만 동영상의 경우 웬만해선 우리의 서버를 안거치면 좋다. 이미지나 영상을 처리하는 것은 서버의 CPU 나 메모리를 잡아먹어 매우 부담을 줌. 
  // 그래서 웬만하면 프론트에서 바로 클라우드로 올리는 방법을 쓴다. (대규모 서비스의 경우)
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB 로 제한 (동영상의 경우 100, 200MB)
})
// PostForm 의 image input 에서 올린 것이 그대로 array 로 전달됨 
// 하나의 input 에서 여러 장 올릴 때: array('image')
// 하나의 input 에서 한 장만 올릴 때: single('image')
// 하나 이상의 input(업로드 칸이 두개씩 있을 때) 일 때: fills ('image')
// 이미지가 아닌 text 만 올릴 때: none()

// ** 게시글 추가하기: POST /post
// upload.none(): 이미지 없이 글만 올리기 
// 미리보기 구현 때 formData 로 이미지를 받아 upload.array() 를 통해 이미지 정보가 서버로 넘어갔고, 지금은 formData 로부터 글과 이미지 주소 이름, 즉 text 만 받아오기 때문에 none() 을 사용
router.post('/', isLoggedIn, upload.none(), async (req, res, next) => { 
  try {
    const hashtags = req.body.content.match(/#[^\s#]+/g); 
    // ex) '#노드 #익스프레스 안녕'.match(/#[^\s#]+/g) => [#노드, #익스프레스]
    // ex) '안녕'.match(/#[^\s#]+/g) => null

    // Post 테이블에 Row(행) 데이터 추가
    const post = await Post.create({ // req.body = { content: 'text~' }
      // 항상 백과 프론트 사이에서 데이터를 주고 받을 땐 key 를 잘봐야 함
      // 
      content: req.body.content,
      UserId: req.user.id,
      // 평소에 serializeUser 로 id 만 저장하고 있다가 라우터에 접근할 때, 접근 전에 deserializeUser 가 한 번씩 실행되어 저장되어있던 id 를 통해 사용자 정보를 복구하여 req.user 로 만듦 (post 할 때 req.user 에 접근 가능)
      // 로그인 이후로는 라우터를 접근할 때 deserializeUser 가 실행됨
      // 저장된 user.id
      // passport > index.js 참고
    })

    // 게식글에 해시태그를 추가했을 때
    if (hashtags) { // hashtags: ex. [#노드, #익스프레스]
      const result = await Promise.all(hashtags.map((tag) => Hashtag.findOrCreate({ 
        where: { name: tag.slice(1).toLowerCase() }, // 없을 때는 등록되고 있을 때는 가져오게됨
        // slice: 앞에 해시태그(#) 를 떼버리기 (뒤에 순수 글자만 가져가기)
        // toLowerCase(): 소문자로 만들기 ex)React 로 적으나 react 로 적으나 똑같이 검색되게 함
        // => db 엔 소문자로 만들어 저장
        // 예외 처리: 중복 문제가 발생할 수 있다.
        // 1. 같은 해시태그를 두 번 쓰는 경우 ex) #노드 #노드 #익스프레스
        // => Hashtag 테이블에 같은 해시태그가 두 번 중복되어 등록이 된다.[노드, 노드, 익스프레스]
        // 2. 사람들이 중복된 해시태그를 적은 경우 ex) 유저1이 #노드 #익스프레스 를 쓰고 유저2도 #노드 #익스프레스
        // => Hashtag 테이블에 두 번씩 같은 해시태그가 등록이 된다. [노드, 노드, 익스프레스, 익스프레스]
        // 해결방법: 무조건 create 로 등록하는 것이 아닌, 그 해시태그가 이미 있으면 create 하지 못하도록 한다.
        // => create > findOrCreate(): 있으면 가져오고 없으면 등록한다.
      })));
      await post.addHashtags(result.map((v) => v[0])); // result: [[노드, true], [익스프레스, false]]
      // .map((v) => v[0]) 이렇게 하는 이유: findOrCreate 때문에
      // findOrCreate() 는 result: [[노드, true], [익스프레스, true]] 와 같이 boolean 값(find or create 되었는지 여부)도 반환하기 때문에 첫번째 인덱스 값만 추출 => 노드, 익스프레스
      // 
    }

    // 게시글에 이미지를 추가했을 때
    if (req.body.image) { // 14분
      // multer 는 파일이나 이미지가 아닌 텍스트의 경우 req.body 로 표현
      // 프론트에서 전달받은 저 'image' 는 이미지 자체가 아닌 '경로 이름' 이다.
      if (Array.isArray(req.body.image)) { // 이미지가 여러 개
        // 이미지를 여러 개 올리면 req.body.image 가 image: [제로초.png, 부기초.jpg ..] 와 같이 배열로 올라온다.
        // 하나가 아닌 여러 개일 경우 배열이 맞는지 확인 (하나면 배열이 아니기 때문)
        const images = await Promise.all(req.body.image.map((image) => Image.create({ src: image })));
        // 최종 게시되는 이미지배열인 Image[] 에 해당 이미지 경로 추가
        // => 시퀄라이즈에 create(생성)
        // 해당 작업은 비동기이며(promise) 제로초 이미지 하나, 부기초 이미지 하나 총 두 번을 생성해야 하고 각각 제로초, 부기초 promise 이므로 두 promise 를 한꺼번에 처리 => Promise.all
        // db 에 파일 자체를 저장하면 너무 무거워지고 파일은 원래 캐싱이 가능하지만 db 에 존재하면 캐싱도 못하기 때문에(현재 파일은 uploads 폴더(하드디스크)에 올라감) 그 파일에 접근할 수 있는 주소만 갖고 있다. (보통 그래서 파일은 s3 클라우드에 저장)
        await post.addImages(images); // model
        // Image 테이블을 include 하면 이미지 정보가 알아서 post.images 로 들어감 (req.post.images..?)
        // 댓글 라우터에선 데이터를 PostId 로 받아 그걸로 Comment - Post 를 직접 연결시켰다.
        // => PostId: parseInt(req.params.postId, 10)
        // 하지만 여기선 PostId 를 받지 않아 어떤 게시글에 이미지가 담기는지 알 수 없고, 게시글과 이미지 사이를 연결하기 위해 addImages() 를 해주어야 한다.
      } else { // 이미지가 하나 image: 제로초.png (배열로 안감싸짐)
        const image = await Image.create({ src: req.body.image });
        await post.addImages(image); 
        // Image 테이블을 include 하면 이미지 정보가 알아서 post.images 로 들어감 (req.post.images..?)
      }

    }

    // Post 에 데이터 추가해서 정보를 "완성"한 뒤 서버에 요청
    // Post 에 기본적인 정보 (content)밖에 없으므로, 연관된 데이터를 모델에서 연관시켰던 데이터로 가져와 완성한 채로 가져온다.
    const fullPost = await Post.findOne({
      // post 가 model 에 생성되면 자동으로 id 속성이 부여됨.
      where: { id: post.id },
      include: [
        {
          model: Image, // 이미지 
          // post.addImages(image); 를 함으로써 Image 테이블을 include 할 때 이미지 정보가 알아서 post.images 로 들어간다...?
        },
        {
          model: Comment, // 댓글
          include: [
            {
              model: User, // 댓글을 포함시킬 때 항상 댓글 작성자도 포함
              attributes: ['id', 'nickname'],
            },
          ]
        },
        {
          model: User, // 게시글 작성자
          attributes: ['id', 'nickname'], // 비밀번호 제외
        },
        {
          model: User, // 게시글에 좋아요 누른 사람
          as: 'Likers', // Like[] 테이블
          attributes: ['id'], // 비밀번호 제외
        },
      ]
    })
    res.status(201).json(fullPost); // 프론트로 다시 보냄
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// ** 이미지 미리보기 업로드(추가)하기: POST /post/images
// 순서: 1. isLoggedIn 검사 > 2. 위의 upload 에서 이미 이미지 올려줌 > 3. (req, res, next) 실행
router.post('/images', isLoggedIn, upload.array('image'), (req, res, next) => {
  console.log(req.files) // req.files: 업로드된 이미지에 대한 정보가 들어있음 
  res.json(req.files.map((v) => v.filename)) // 어디로 업로드 되었는지에 대한 파일명들 프론트로 전달
  // 이미지 정보들 중 '파일명'만 추출해서 새로운 배열로 만들어 전달 
  // => [{ filename: 커플사진.jpg }, { filename: 히승이 엽사.png }, ...]
  // 이미지 업로드: 5강 백엔드 10분 ~
}) 

// ** 리트윗 하기: POST /post/1/retweet
// ch5 백엔드 5분 30초
router.post('/:postId/retweet', isLoggedIn, async (req, res, next) => { 
  // POST /post/1/comment
  try {
    // 조건: 게시글이 존재한다면
    // 게시글 존재 여부를 찾을 때 'Retweet 게시글'도 include 로도 같이 찾으면 좋음
    // => 그냥 게시글의 여부뿐만 아니라, 리트윗 게시글의 여부 까지 모두 찾기 위해
    const post = await Post.findOne({
      where: { id: req.params.postId },
      include: [{
        model: Post, 
        as: 'Retweet', // => post.Retweet 생성
        // ex) Retweet 이 1번: 1번 게시글을 리트윗한 게시글
        // ex) 8번 게시글이 1번 게시글을 리트윗한 게시글일 때 => postId: 8, Retweet: 1
      }],
    });
    // 부가적인, 세부적인 설정 (optional)
    // 존재하지 않는 게시글에 댓글을 달 우려 (혹시나)
    // 혹은 다른 게시글 주소에 접근해서 댓글을 추가 삭제할 우려
    if (!post) { // 조건: 게시글이 존재하지 않는 다면
      return res.status(403).send('존재하지 않는 게시글입니다.');
      // return 을 붙여줘야 send 가 두 번 발송되지 않음
      // ** 무조건 요청 한번에 응답 한번!!
      // 없는 게시글엔 댓글 못담
    }
    // 위에서 include 를 한 이유: 리트윗은 신경쓸 부분이 많아서
    // ex) 내가 내 게시글을 리트윗한 경우, 어떤사람이 내 게시글을 리트윗한 게시글을 또 다시 내가 리트윗 했을 때
    // => '나의 게시글을 리트윗한 게시글'을 내가 다시 리트윗 불가능
    if (req.user.id === post.UserId || 
      (post.Retweet && post.Retweet.UserId === req.user.id)) {
        // post.Retweet = 리트윗 게시물
        // post.Retweet.User = 원본이 나인 리트윗 게시물
        // => 원본이 나인 리트윗 게시물에 내가 리트윗 못하도록 하기
        return res.status(403).send('자신의 글은 리트윗할 수 없습니다.');
    }
    // 남의 게시글을 리트윗한 게시글을 내가 다시 리트윗 가능
    // post.RetweetId = 리트윗한 게시글의 원본 게시글
    // ex) 1번 게시글을 8번 게시글이 리트윗했는데, 9번 게시글이 8번 게시글을 리트윗 한다면 사실상 결국 9번 게식글은 1번 게시글(원본)을 리트윗 한것임
    // ex) 내가 9번 게시글을 쓰는 상황에서 8번 게시글을 리트윗 하려고 할 때
    // 8번이 1번을 리트윗한 게시글이라면? => 9번의 리트윗Id(원본id) 는 1번(post.RetweetId)
    // 8번이 아무것도 리트윗하지 않은 게시글이라면? => 9번의 리트윗Id(원본id) 는 8번(post.id)
    const retweetTargetId = post.RetweetId || post.id
    // 내가 리트윗 하려는 게시글이 이전에 리트윗한 이력이 있으면 전자, 그것이 아니라면 후자를 택
    // 리트윗 하지 않은 게시글의 경우 post.RetweetId = null 이다. => 그럼 오른쪽 값이 들어감

    // 똑같은 게시글을 두 번이상 리트윗할 수 없음.
    // 내가 이전에 리트윗했던 게시글인지 조회 및 확인
    // Post 에 똑같은 RetweetId 가 있으면 경고
    const exPost = await Post.findOne({ // exPost: 원본 게시글
      where: {
        UserId: req.user.id,
        RetweetId: retweetTargetId,
      },
    });
    if (exPost) { // 내가 이미 한 번 리트윗했던 게시글이라면
      return res.status(403).send('이미 리트윗 했습니다.'); 
      // data 에 '이미 리트윗 했습니다.' 가 담김 > action.error 에 담김 > retweetFailure 에 담김
    }

    // 수많은 검사를 지나 이번엔 이제 진짜 리트윗 게시글 생성
    const retweet = await Post.create({
      UserId: req.user.id,
      RetweetId: retweetTargetId,
      content: 'retweet', // content 를 비우면 안됨
      // model post 에서 content 에 allowNull: false 이 적용되어있다.
    }) // 이걸 그대로 json(retweet) 로 보내기 전에 잠깐!!!
    // 'retweet' 만으론 내가 어떤 게시글을 리트윗했는지 안나온다. => 원본 게시글에 대한 정보가 제대로 안나온다.
    // 이전 강의 때 그냥 post가 아닌 나머지 부가적인 연관정보들까지 포함시켜서 fullPost로 데이터를 보냈던 것과 유사하게, Retweet 게시글 + 원본 게시글 대한 전체적인 정보 + 연관된 정보들(UserId, RetweetID 등) 을 추가
    // 이유: 원본 게시글에 대한 모든 정보가 있어야함 => 리트윗 게시글 틀 안에 원본게식글이 들어있어야 하기 때문
    const retweetWithPrevPost = await Post.findOne({
      // retweet 'With' PrevPost => 그냥 retweet 만 보내는게 아닌 리트윗 당한 원본에 대한 정보 추가
      // post.Retweet(리트윗한 게시글)에 원본(리트윗 당한 게식글)에 대한 정보까지 담김
      where: { id: retweet.id },
      include: [
        { 
          model: Post, // 원본 게시글
          as: 'Retweet', // 리트윗 게시글 <-> 원본 게시글 관계테이블
          include: [{
            model: User, // 원본 게시글 작성자
            attributes: ['id', 'nickname'],
          }, {
            model: Image,
          }]
        }, 
        {
          model: User, // 원본 게시글 작성자
          attributes: ['id', 'nickname'],
        },
        {
          model: Image,
        },
        {
          model: Comment,
          include: [{
            model: User,
            attributes: ['id', 'nickname'],            
          }]
        },
        {
          model: User,
          as: 'Likers', // 좋아요 누른 목록ㄱ
          attributes: ['id'],
        },
      ],
    })

    // data 형태:
    // data:
    //   Comments: []
    //   Images: []
    //   Likers: []
    //   Retweet(리트윗 '당한' 원본): {id: 14, content: '리트윗 해주세여', createdAt: '2022-03-~', updatedAt: '2022-03~', UserId: 12, …}
    //   RetweetId: 14
    //   User: {id: 13, nickname: 'Jinny2'}
    //   UserId: 13
    //   content: "retweet"
    //   createdAt: "2022-03-08T14:33:46.000Z"
    //   id: 15(리트윗 '한' 본인 게시글)
    //   updatedAt: "2022-03-08T14:33:46.000Z"
    //   [[Prototype]]: Object
    //   type: "RETWEET_SUCCESS"

    res.status(201).json(retweetWithPrevPost); // 프론트로 다시 보냄
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// ** 댓글 추가하기 라우터: POST /post/1/comment
// 파라미터: 주소 부분에서 동적으로 바뀌는 부분
// ex) 항상 1번 게시글이 아닌 6번 게시글(/6/comment) 일 수도 있다
// => '/:postId/comment' ( :postId 부분이 동적으로 바뀜 )
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => { 
  // POST /post/1/comment
  try {
    // 조건: 게시글이 존재한다면
    const post = await Post.findOne({
      where: { id: req.params.postId }
    });
    // 부가적인, 세부적인 설정 (optional)
    // 존재하지 않는 게시글에 댓글을 달 우려 (혹시나)
    // 혹은 다른 게시글 주소에 접근해서 댓글을 추가 삭제할 우려
    if (!post) { // 조건: 게시글이 존재하지 않는 다면
      return res.status(403).send('존재하지 않는 게시글입니다.');
      // return 을 붙여줘야 send 가 두 번 발송되지 않음
      // ** 무조건 요청 한번에 응답 한번!!
      // 없는 게시글엔 댓글 못담
    }

    const comment = await Comment.create({ 
      content: req.body.content,
      PostId: parseInt(req.params.postId, 10), // PostId 로 Comment - Post 를 직접 연결
      // 조회할 때 말고 적용할 때만 params 를 parseInt() 
      // :postId 가 params 를 통해 접근
      // req.params => 문자열일 것이다. 이렇게 하면 PostId 에 문자열이 들어가 에러가 발생한다. 숫자로 바꿔주자
      // parseInt(string, radix)
      // parseInt 함수는 첫 번째 인자를 문자열로 변환하고, 그 값을 파싱하여 정수나 NaN을 반환
      // NaN을 반환할 것이 아니면, parseInt는 첫 번째 인자를 지정한 radix 진수로 표현한 정수를 반환합니다. 예를 들어 radix가 10인 경우 10진수, 8인 경우는 8진수, 16인 경우 16진수 등등으로 변환
      UserId: req.user.id // 누가 게시글을 썼는지 (내가)
    })

    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [
        {
          model: User, // 댓글 작성자 포함
          attributes: ['id', 'nickname'], // 비밀번호 제외
        }
      ]
    })
    res.status(201).json(fullComment); // 프론트로 다시 보냄
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// ** 게시글에 좋아요 달기: PATCH /post/1/like
router.patch('/:postId/like', isLoggedIn, async (req, res, next) => { 
  // saga 에서 data(post.id = 게시글 id) 를 받아 req.params 를 통해 접근
  try {
    const post = await Post.findOne({ 
      where: { id: req.params.postId }
      // 조회할 때 말고 적용할 때만 params 를 parseInt() 
    })
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.');
      // 게시글이 없으면 좋아요도 못누름
    }
    await post.addLikers(req.user.id); // 로그인된 사용자의 id
    // 데이터로 받은 PostId 로 post 를 찾고 그 post 의 Likers 테이블에 로그인된 사용자의 id 추가
    // Like 테이블의 PostId 와 UserId 에 
    // [게시글에 좋아요 누른 유저의 id], [유저가 누른 게시글의 id] 추가됨
    // 관계 메서드: 테이블간의 관계를 이용 (models 참고) 
    res.json({ PostId: post.id, UserId: req.user.id });
    // 어떤 사용자가 어디 게시글에 좋아요 눌렀는지 프론트에 보냄
    // 로그인 이후로는 항상 라우터 접근 전 deserealizeUser 에 들러 쿠키의 id 를 통해 복구된 사용자 정보(user) 를 req.user 에 담음
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// ** 게시글에 좋아요 취소하기: DELETE /post/1/like
router.delete('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ 
      where: { id: req.params.postId }
      // 조회할 때 말고 적용할 때만 params 를 parseInt() 
    })
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.')
      // 게시글이 없으면 좋아요 취소도 못함
    }
    await post.removeLikers(req.user.id); 
    res.json({ PostId: post.id, UserId: req.user.id });
    // 어떤 사용자가 어디 게시글에 좋아요를 취소했는지 프론트에 보냄
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// ** 게시글 삭제하기: DELETE /post/1
router.delete('/:postId', isLoggedIn, async (req, res, next) => { // DELETE /post/1
  // 어떤 게시글을 삭제할 지 표시 (${data}) => 주소로 받기
  try {
    await Post.destroy({ // 제거 
      where: {
        id: req.params.postId,
        UserId: req.user.id, // 지우려는 게시글의 작성자가 본인인지 확인
        // postId 만 바꾸어 주소로 접근하면, 다른 사람이 자신의 게시글을 삭제하는 경우도 생길 위험이 있다 => 본인 확인 필요
      },
      // 선택된 id 를 가진 데이터 제거
    });
    res.status(200).json({ PostId: parseInt(req.params.postId, 10) }); 
    // 삭제된 게시물 id 프론트에 전달
    // params 는 문자열
    // 조회할 때 말고 적용할 때만 params 를 parseInt() 
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// 중복을 막음

module.exports = router;

// 시퀄라이즈 메서드
// findOne(), findAll(): 조회
// create(): 생성
// destroy(): 삭제
// update(): 수정