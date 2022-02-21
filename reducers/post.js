// reducers > post.js

// 더미데이터를 넣어둬보자
// post 정보에 대한 객체
// 서버 개발자에게 데이터 속성을 어떤식으로 줄건지 미리 물어보면 좋음

// id 나 content 는 게시글 자체의 속성이고 User, Images, Comments 등은 다른 정보들과 합쳐서 주기 때문에 대문자로 표기해준다.
export const initialState = {
  mainPosts: [
    {
      id: 1,
      // 유저 정보
      User: {
        id: 1,
        nickname: "제로초",
      },
      content: "첫 번째 게시글 #해시태그 #익스프레스",
      // 이미지
      Images: [
        {
          src: "https://cdn.pixabay.com/photo/2022/01/27/16/14/heart-6972452_1280.jpg",
        },
        {
          src: "https://cdn.pixabay.com/photo/2022/02/11/14/52/waffles-7007465_1280.jpg",
        },
        {
          src: "https://cdn.pixabay.com/photo/2022/01/11/18/46/rose-6931259_1280.jpg",
        },
      ],
      // 댓글
      Comments: [
        {
          User: {
            nickname: "nero",
          },
          content: "우와 개정판이 나왔군요~",
        },
        {
          User: {
            nickname: "hero",
          },
          content: "얼른 사고 싶어요",
        },
      ],
    },
  ],

  // Mainposts 외 다른 속성
  imagePaths: [], // 게시글에 이미지를 업로드 할 때, 이미지의 경로들이 저장되는 공간
  // postAdded: false, // 게시글 추가가 완료되었을 때 true 로 전환
  addPostLoading: false,
  addPostDone: false,
  addPostError: null,

  addCommentLoading: false,
  addCommentDone: false,
  addCommentError: null,
};

export const ADD_POST_REQUEST = "ADD_POST_REQUEST";
export const ADD_POST_SUCCESS = "ADD_POST_SUCCESS";
export const ADD_POST_FAILURE = "ADD_POST_FAILURE";

export const ADD_COMMENT_REQUEST = "ADD_COMMENT_REQUEST";
export const ADD_COMMENT_SUCCESS = "ADD_COMMENT_SUCCESS";
export const ADD_COMMENT_FAILURE = "ADD_COMMENT_FAILURE";

// 우리가 쓴 글, 즉 실제 데이터를 받기 위해 action 객체가 아닌 action creator 로 변경
export const addPost = (data) => ({
  type: ADD_POST_REQUEST,
  data,
})

export const addComment = (data) => ({
  type: ADD_COMMENT_REQUEST,
  data,
})


// 현재 게시글도 실제로 저장할 수 없기 때문에 가짜 객체(더미데이터)로 만들어준다.
const dummyPost = {
  id: 2,
  content: '더미데이터 입니다',
  User : {
    id: 1,
    nickname: '제로초',
  },
  Images: [],
  Comments: [],
} 

// [이전 state] 와 [action]을 받아 다음 state 를 돌려줌
const reducer = (state = initialState, action) => {
  switch (action.type) {

    // 게시글 작성 액션 처리 
    case ADD_POST_REQUEST : 
      return {
        ...state,
        addPostLoading: true,
        addPostDone: false,
        addPostError: null, // 둘다 falsy 한 값이기 때문에 false 해도 됨
      }
    case ADD_POST_SUCCESS : 
      return {
        ...state,
        mainPosts: [dummyPost, ...state.mainPosts], // 이전 게시글 위에 추가 위치되도록 앞에 표기
        addPostLoading: false,
        addPostDone: true,
      }
    case ADD_POST_FAILURE : 
      return {
        ...state,
        addPostLoading: false,
        addPostError: action.error,
      }

    // 댓글 작성 액션 처리 
    case ADD_COMMENT_REQUEST : 
      return {
        ...state,
        addCommentLoading: true,
        addCommentDone: false,
        addCommentError: null, // 둘다 falsy 한 값이기 때문에 false 해도 됨
      }
    case ADD_COMMENT_SUCCESS : 
      return {
        ...state,
        addCommentLoading: false,
        addCommentDone: true,
      }
    case ADD_COMMENT_FAILURE : 
      return {
        ...state,
        addCommentLoading: false,
        addCommentError: action.error,
      }
    default:
      return state;
  }
};

export default reducer;
