// reducers > post.js

import shortId from 'shortid';
import produce from 'immer';

// 더미데이터를 넣어둬보자
// post 정보에 대한 객체
// 서버 개발자에게 데이터 속성을 어떤식으로 줄건지 미리 물어보면 좋음

// id 나 content 는 게시글 자체의 속성이고 User, Images, Comments 등은 다른 정보들과 합쳐서 주기 때문에 대문자로 표기해준다.
export const initialState = {
  mainPosts: [
    // 더미데이터
    {
      id: 1, // 게시글의 id, 나의 id
      // 유저 정보
      User: {
        id: 1, // 나의 id
        nickname: "제로초",
      },
      content: "첫 번째 게시글 #해시태그 #익스프레스",
      // 이미지
      Images: [
        {
          id: shortId.generate(),
          src: "https://cdn.pixabay.com/photo/2022/01/27/16/14/heart-6972452_1280.jpg",
        },
        {
          id: shortId.generate(),
          src: "https://cdn.pixabay.com/photo/2022/02/11/14/52/waffles-7007465_1280.jpg",
        },
        {
          id: shortId.generate(),
          src: "https://cdn.pixabay.com/photo/2022/01/11/18/46/rose-6931259_1280.jpg",
        },
      ],
      // 댓글
      Comments: [ // 대문자로 되어있는 속성들은 전부 서버로부터 받아오는 데이터인데, 이 데이터들은 전부 id 가 고유하게 붙어있다.
        {
          id: shortId.generate(),
          User: {
            id: shortId.generate(),
            nickname: "nero",
          },
          content: "우와 개정판이 나왔군요~",
        },
        {
          id: shortId.generate(),
          User: {
            id: shortId.generate(),
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

  removePostLoading: false,
  removePostDone: false,
  removePostError: null,

  addCommentLoading: false,
  addCommentDone: false,
  addCommentError: null,
};

export const ADD_POST_REQUEST = "ADD_POST_REQUEST";
export const ADD_POST_SUCCESS = "ADD_POST_SUCCESS";
export const ADD_POST_FAILURE = "ADD_POST_FAILURE";

export const REMOVE_POST_REQUEST = "REMOVE_POST_REQUEST";
export const REMOVE_POST_SUCCESS = "REMOVE_POST_SUCCESS";
export const REMOVE_POST_FAILURE = "REMOVE_POST_FAILURE";

export const ADD_COMMENT_REQUEST = "ADD_COMMENT_REQUEST";
export const ADD_COMMENT_SUCCESS = "ADD_COMMENT_SUCCESS";
export const ADD_COMMENT_FAILURE = "ADD_COMMENT_FAILURE";

// 우리가 쓴 글, 즉 실제 데이터를 받기 위해 action 객체가 아닌 action creator 로 변경
export const addPost = (data) => ({
  type: ADD_POST_REQUEST,
  data,
});

export const addComment = (data) => ({
  type: ADD_COMMENT_REQUEST,
  data,
});

// 현재 게시글도 실제로 저장할 수 없기 때문에 가짜 객체(더미데이터)로 만들어준다.
const dummyPost = (data) => ({
  id: data.id,
  content: data.content,
  User: {
    id: 1,
    nickname: "제로초",
  },
  Images: [],
  Comments: [],
});

const dummyComment = (data) => ({
  id: shortId.generate(),
  User: {
    id: 1,
    nickname: '제로초',
  },
  content: data,
})

// reducer: [이전 state] 를 [action]을 통해 받아 다음 state 를 만들어줌 (불변성을 지키면서)
// => 하지만 immer 를 쓰면 불변성을 지킬 필요가 없다.
const reducer = (state = initialState, action) => {
  // immer 가 알아서 state 를 불변성 지킨 채로 다음 state 로 만들어줌
  // state 대신 draft 가 자리함
  return produce(state, (draft) => {
    switch (action.type) {

      // 게시글 작성 액션 처리 --------------------------
      case ADD_POST_REQUEST:
        draft.addPostLoading = true;
        draft.addPostDone = false;
        draft.addPostError = null;
        break;
      case ADD_POST_SUCCESS:
        draft.addPostLoading = false;
        draft.addPostDone = true;
        // 이전 게시글 위에 추가 위치되도록 앞에 표기
        // action.data = { id, content }
        draft.mainPosts.unshift(dummyPost(action.data)) // 불변성 지킬 필요 x 
        // 이전 코드 => mainPosts: [dummyPost(action.data), ...state.mainPosts]; 
        break;
      case ADD_POST_FAILURE:
          draft.addPostLoading = false;
          // draft.addPostLoading = true;
          draft.addPostError = action.error;
          break;

      // 게시글 삭제 액션 처리 --------------------------
      case REMOVE_POST_REQUEST:
          draft.removePostLoading = true;
          draft.removePostDone = false;
          draft.removePostError = null;
          break;
      case REMOVE_POST_SUCCESS:
          // 불변성을 지키며 지우는 방법은 filter() 
          draft.mainPosts = draft.mainPosts.filter((v) => v.id !== action.data);
          // draft.mainPosts = state.mainPosts.filter((v) => v.id !== action.data);
          draft.removePostLoading = false;
          draft.removePostDone = true;
          break;
      case REMOVE_POST_FAILURE:
          draft.removePostLoading = false;
          draft.removePostError = action.error;
          break;

      // 댓글 작성 액션 처리 --------------------------
      case ADD_COMMENT_REQUEST:
          draft.addCommentLoading = true;
          draft.addCommentDone = false;
          draft.addCommentError = null;
          break;
      case ADD_COMMENT_SUCCESS: {
        
        // 접근 가능 데이터는 3개 :
        // action.data.content,
        // action.data.postId,
        // action.data.userId, 를 받음
        
        // 1. 게시글 찾기
        const post = draft.mainPosts.find((v) => v.id === action.data.postId);
        // 2. 게시글에 새로운 것 추가
        post.Comments.unshift(dummyComment(action.data.content));
        draft.addCommentLoading = false;
        draft.addCommentDone = true;
        break;
      }
      case ADD_COMMENT_FAILURE:
          draft.addCommentLoading = false;
          draft.addCommentError = action.error;
          break;
      default:
        break // return state;
    }
  }) 
};

export default reducer;
