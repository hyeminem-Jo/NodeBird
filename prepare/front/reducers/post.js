// reducers > post.js

import produce from 'immer';

export const initialState = {
  mainPosts: [], // 실제로는 이렇게 비어있는 채로 서버에서 받는다. 
  imagePaths: [], // 게시글에 이미지를 업로드 할 때, 이미지의 경로들이 저장되는 공간

  // 좋아요
  likePostLoading: false,
  likePostDone: false,
  likePostError: null,

  // 좋아요 취소
  unlikePostLoading: false,
  unlikePostDone: false,
  unlikePostError: null,

  // 게시물들 로드
  hasMorePosts: true, // 처음 데이터는 무조건 가져와야함 (초반에는 반드시 게시물이 떠야하므로)
  loadPostsLoading: false,
  loadPostsDone: false,
  loadPostsError: null,

  // 게시물 추가
  addPostLoading: false,
  addPostDone: false,
  addPostError: null,

  // 게시물 삭제
  removePostLoading: false,
  removePostDone: false,
  removePostError: null,

  // 댓글 추가
  addCommentLoading: false,
  addCommentDone: false,
  addCommentError: null,
};

// initialState.mainPosts = initialState.mainPosts.concat(generateDummyPost(10))
// 강좌에선 해당 코드 없애라 함 맞을까?

export const LIKE_POST_REQUEST = "LIKE_POST_REQUEST";
export const LIKE_POST_SUCCESS = "LIKE_POST_SUCCESS";
export const LIKE_POST_FAILURE = "LIKE_POST_FAILURE";

export const UNLIKE_POST_REQUEST = "UNLIKE_POST_REQUEST";
export const UNLIKE_POST_SUCCESS = "UNLIKE_POST_SUCCESS";
export const UNLIKE_POST_FAILURE = "UNLIKE_POST_FAILURE";

export const LOAD_POSTS_REQUEST = "LOAD_POSTS_REQUEST";
export const LOAD_POSTS_SUCCESS = "LOAD_POSTS_SUCCESS";
export const LOAD_POSTS_FAILURE = "LOAD_POSTS_FAILURE";

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

// reducer: [이전 state] 를 [action]을 통해 받아 다음 state 를 만들어줌 (불변성을 지키면서)
// => 하지만 immer 를 쓰면 불변성을 지킬 필요가 없다.
const reducer = (state = initialState, action) => {
  // immer 가 알아서 state 를 불변성 지킨 채로 다음 state 로 만들어줌
  // state 대신 draft 가 자리함
  return produce(state, (draft) => {
    switch (action.type) {

      // 좋아요 액션 처리 --------------------------
      case LIKE_POST_REQUEST:
        draft.likePostLoading = true;
        draft.likePostDone = false;
        draft.likePostError = null;
        break;
      case LIKE_POST_SUCCESS: {
        // action.data = { PostId, UserId } 좋아요 누른 게시글 id 로 게시글 찾기
        const post =  draft.mainPosts.find((v) => v.id === action.data.PostId);
        // 해당 게시글 post 의 Likers[] 에 좋아요 누른 유저 id 삽입
        post.Likers.push({ id: action.data.UserId }); 
        draft.likePostLoading = false;
        draft.likePostDone = true;
        break;
      }
      case LIKE_POST_FAILURE:
        draft.likePostLoading = false;
        draft.likePostError = action.error;
        break;

      // 좋아요 취소 액션 처리 --------------------------
      case UNLIKE_POST_REQUEST:
        draft.unlikePostLoading = true;
        draft.unlikePostDone = false;
        draft.unlikePostError = null;
        break;
      case UNLIKE_POST_SUCCESS: {
        // action.data = { PostId, UserId }
        const post = draft.mainPosts.find((v) => v.id === action.data.PostId);
        post.Likers = post.Likers.filter((v) => v.id !== action.data.UserId);
        // 원래 의미상으론 filter() 가 아닌 splice() 를 쓰는 것이 맞음
        draft.unlikePostLoading = false;
        draft.unlikePostDone = true;
        break;
      }
      case UNLIKE_POST_FAILURE:
        draft.unlikePostLoading = false;
        draft.unlikePostError = action.error;
        break;

      // 처음 메인화면에 게시글들 삽입 액션 처리 --------------------------
      case LOAD_POSTS_REQUEST:
        draft.loadPostsLoading = true;
        draft.loadPostsDone = false;
        draft.loadPostsError = null;
        break;
      case LOAD_POSTS_SUCCESS:
        draft.loadPostsLoading = false;
        draft.loadPostsDone = true;
        draft.mainPosts = draft.mainPosts.concat(action.data); 
        // ex) 기존에 10개 포스터가 있고, 로딩해서 최근 포스터 10개가 들어오면 포스터 20개가 되고, 또 더미포스터 10개가 들어오면 기존 20개 포스터에서 30개로 바뀐다.

        // draft.mainPosts = action.data.concat(draft.mainPosts); 
        // action.data 에 더미데이터들이 들어있을 것이고, 이것과 기존 데이터들과 합쳐준다.
        // => 가장 최근에 들어온 더미데이터가 앞에 위치하고, 그 뒤엔 기존 데이터가 위치하게 된다.
        
        draft.hasMorePosts = draft.mainPosts.length < 50;
        // hasMorePosts 가 true 인 상태에서는 게시물을 가져와달라는 뜻이고, 첫 렌더링 시 메인화면에는 당연히 게시물을 가져와야 하므로 초기엔 true 로 지정하고 그 후엔 지정된 게시물 수가 초과하면 false 로 한다.
        // mainPosts 의 갯수가 50개 일 때, 50개보다 작으면 hasMorePosts 가 true 이고, 50 개보다 많아지면 hasMorePosts 가 false 가 되므로 게시물 가져오는 시도를 멈춘다.
        // concat 으로 게시글 수가 50이 되어버리면 그 다음으로 hasMorePosts 가 false 가 됨
        break;
      case LOAD_POSTS_FAILURE:
        draft.loadPostsLoading = false;
        draft.loadPostsError = action.error;
        break;

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
        draft.mainPosts.unshift(action.data);
        // immer 활용한 코드: draft.mainPosts.unshift(dummyPost(action.data)) // 불변성 지킬 필요 x 
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
        draft.removePostLoading = false;
        draft.removePostDone = true;
        // 불변성을 지키며 지우는 방법은 filter() 
        draft.mainPosts = draft.mainPosts.filter((v) => v.id !== action.data.PostId);
        // draft.mainPosts = state.mainPosts.filter((v) => v.id !== action.data);
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
        const post = draft.mainPosts.find((v) => v.id === action.data.PostId);
        // 2. 게시글에 새로운 것 추가
        post.Comments.unshift(action.data); // 하나의 객체
        // post.Comments.unshift(dummyComment(action.data.content));
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


// 더미데이터 post 정보에 대한 객체 => 서버 개발자에게 데이터 속성을 어떤식으로 줄건지 미리 물어보면 좋음

// id 나 content 는 게시글 자체의 속성이고 User, Images, Comments 등은 다른 정보들과 합쳐서 주기 때문에 대문자로 표기해준다.

// 더미데이터 구성
// post: {
//   id: shortId.generate(),
//   User: {
//     id: shortId.generate(),
//     nickname: faker.name.findName(),
//   },
//   content: faker.lorem.paragraph(),
//   Images: [{
//     src: faker.image.image(),
//   }],
//   Comments: [{
//     User: {
//       id: shortId.generate(),
//       nickname: faker.name.findName(),
//     },
//     content: faker.lorem.sentence(),
//   }],
// };