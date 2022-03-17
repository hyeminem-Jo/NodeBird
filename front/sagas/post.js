// sagas > post.js

import axios from "axios";
import { all, fork, put, takeLatest, throttle, call } from "redux-saga/effects";
// import shortId from "shortid";

import { ADD_POST_TO_ME, REMOVE_POST_OF_ME } from "../reducers/user";
import {
  ADD_POST_REQUEST,
  ADD_POST_SUCCESS,
  ADD_POST_FAILURE,
  ADD_COMMENT_REQUEST,
  ADD_COMMENT_SUCCESS,
  ADD_COMMENT_FAILURE,
  REMOVE_POST_REQUEST,
  REMOVE_POST_SUCCESS,
  REMOVE_POST_FAILURE,
  LOAD_POSTS_REQUEST,
  LOAD_POSTS_SUCCESS,
  LOAD_POSTS_FAILURE,
  LIKE_POST_REQUEST,
  UNLIKE_POST_REQUEST,
  LIKE_POST_SUCCESS,
  LIKE_POST_FAILURE,
  UNLIKE_POST_SUCCESS,
  UNLIKE_POST_FAILURE,
  UPLOAD_IMAGES_REQUEST,
  UPLOAD_IMAGES_SUCCESS,
  UPLOAD_IMAGES_FAILURE,
  RETWEET_REQUEST,
  RETWEET_SUCCESS,
  RETWEET_FAILURE,
  LOAD_POST_REQUEST,
  LOAD_POST_SUCCESS,
  LOAD_POST_FAILURE,
  LOAD_HASHTAG_POSTS_REQUEST,
  LOAD_USER_POSTS_REQUEST,
  LOAD_USER_POSTS_SUCCESS,
  LOAD_USER_POSTS_FAILURE,
  LOAD_HASHTAG_POSTS_SUCCESS,
  LOAD_HASHTAG_POSTS_FAILURE,
  // generateDummyPost,
} from "../reducers/post";

// likePost --------------
// 좋아요: 게시글의 일부분을 수정 - patch(부분 수정)
function likePostAPI(data) {
  return axios.patch(`/post/${data}/like`); // /post/1/like
  // data 가 주소에 이미 들어있기 때문에 따로 ,data 를 또 넣을 필요 x
  // data 는 post.id (PostCard 컴포넌트에서)
  // => 라우터 주소에 어디 게시글에 좋아요를 눌렀는지 표시
}

function* likePost(action) {
  try {
    const result = yield call(likePostAPI, action.data)
    yield put({
      type: LIKE_POST_SUCCESS,
      data: result.data, // { PostId, UserId }
      // 어떤 사용자가 어디 게시글에 좋아요 눌렀는지
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LIKE_POST_FAILURE,
      error: err.response.data,
    });
  }
}

// unlikePost --------------
// 좋아요 취소: 게시글의 일부분을 수정 - patch(부분 수정)
function unlikePostAPI(data) {
  return axios.delete(`/post/${data}/like`); // /post/1/like
  // return axios.patch(`/post/${data}/unlike`);
  // data 가 주소에 이미 들어있기 때문에 따로 ,data 를 또 넣을 필요 x
}

function* unlikePost(action) {
  try {
    const result = yield call(unlikePostAPI, action.data)
    yield put({
      type: UNLIKE_POST_SUCCESS,
      data: result.data, // { PostId, UserId }
      // 어떤 사용자가 어디 게시글에 좋아요 눌렀는지
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: UNLIKE_POST_FAILURE,
      error: err.response.data,
    });
  }
}

// loadPost --------------
// 서버에서 공유할 게시글 불러오는 요청(게시글 조회, get)
function loadPostAPI(data) {
  return axios.get(`/post/${data}`); 
}

function* loadPost(action) {
  try {
    const result = yield call(loadPostAPI, action.data)
    yield put({
      type: LOAD_POST_SUCCESS,
      data: result.data, 
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_POST_FAILURE,
      error: err.response.data,
    });
  }
}


// loadUserPosts --------------
// 서버에서 게시글들 불러오는 요청(게시글 조회, get)
function loadUserPostsAPI(data, lastId) {
  return axios.get(`/user/${data}/posts?lastId=${lastId || 0}`); 
}

function* loadUserPosts(action) {
  try {
    const result = yield call(loadUserPostsAPI, action.data, action.lastId)
    yield put({
      type: LOAD_USER_POSTS_SUCCESS,
      data: result.data, // 게시글들 배열 [{}, {}, {}...]
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_USER_POSTS_FAILURE,
      error: err.response.data,
    });
  }
}


// loadHashtagPosts --------------
function loadHashtagPostsAPI(data, lastId) {
  return axios.get(`/hashtag/${encodeURIComponent(data)}?lastId=${lastId || 0}`); 
  // data 에 "리액트" 와 같은 한글이 들어감 
  // => 서버 요청할 때 한글이 들어가면 에러가 난다.
  // => 해결: encodeURIComponent(data): 주소창에 넣어도되는 문구로 바뀜 
  // ex) encodeURIComponent("리액트") > '%EB%A6%AC%EC%95%A1%ED%8A%B8'
  // 이는 decodeURIComponent() 를 하면 다시 원래대로 돌아온다 > "리액트"
}

function* loadHashtagPosts(action) {
  try {
    console.log('loadHashtag console');
    const result = yield call(loadHashtagPostsAPI, action.data, action.lastId)
    yield put({
      type: LOAD_HASHTAG_POSTS_SUCCESS,
      data: result.data, // 게시글들 배열 [{}, {}, {}...]
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_HASHTAG_POSTS_FAILURE,
      error: err.response.data,
    });
  }
}

// loadPosts --------------
// 서버에서 게시글들 불러오는 요청(게시글 조회, get)
function loadPostsAPI(lastId) {
  return axios.get(`/posts?lastId=${lastId || 0}`); 
  // get 은 데이터를 넣지 못하므로 쿼리 스트링으로 넣어준다.
  // get 으로 데이터를 보내려면 주소(/posts) + ? + key(lastId) = 값(lastId) 의 형태로 넣어주어야 한다.
  // 쿼리 스트링: ? 를 처음에 붙인 뒤 위와 같은 key=value 형태로 &로 구분하여 넣어준다.
  // => `/posts?lastId=${lastId}&limit=10&offset=10`
  // get 의 장점: 주소에 데이터가 담겨있어 주소를 캐싱하면 그 데이터까지 캐싱됨 (patch 등은 x)
  // lastId || 0 => 게시글이 0개 일 때 lastId 가 undefined 가 되면 0 으로 대체
}

function* loadPosts(action) {
  try {
    const result = yield call(loadPostsAPI, action.lastId)
    yield put({
      type: LOAD_POSTS_SUCCESS,
      data: result.data, // 게시글들 배열 [{}, {}, {}...]
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_POSTS_FAILURE,
      error: err.response.data,
    });
  }
}

// addPost --------------
function addPostAPI(data) {
  return axios.post("/post", data); // form 데이터는 무조건 그대로 보냄
  // return axios.post("/post", { content: data }); 이제 이미지도 보냄
}

function* addPost(action) {
  try {
    const result = yield call(addPostAPI, action.data)
    // action.data 를 받는 형태는 자유롭게 할 수 있다. (게시글의 id 값도 받아야하기 때문에 객체 형태로 바꿈)
    yield put({
      type: ADD_POST_SUCCESS,
      data: result.data,  
    });
    // 내가 올리는 게시글의 id 를 post.js reducer 뿐 아니라 user.js reducer 에도 공유
    yield put({ // 게시글 수 변경 (user action)
      type: ADD_POST_TO_ME,
      data: result.data.id, // model 객체에서 id 속성은 자동으로 생성됨
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: ADD_POST_FAILURE,
      error: err.response.data,
    });
  }
}

// removePost --------------
function removePostAPI(data) {
  return axios.delete(`/post/${data}`); // delete 는 data 넣지 x
}

function* removePost(action) {
  try {
    const result = yield call(removePostAPI, action.data);
    yield put({
      type: REMOVE_POST_SUCCESS,
      data: result.data // 삭제 게시글 id (PostId)
    });
    // from user reducer
    yield put({ // 게시글 수 변경 (user action)
      type: REMOVE_POST_OF_ME,
      data: action.data, // 삭제 게시글 id (PostId)
      // result.data 가 아닌가??
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: REMOVE_POST_FAILURE,
      error: err.response.data,
    });
  }
}

// addComment --------------
function addCommentAPI(data) {
  return axios.post(`/post/${data.postId}/comment`, data);
  // 중간에 게시글 id 은 안넣어도 작동하지만, 의미를 살려서 넣어주면 좋다
  // => 어떤 게시글의 댓글인지 알 수 있음
  // POST /post/1/comment
}

function* addComment(action) {
  try {
    const result = yield call(addCommentAPI, action.data)
    yield put({
      type: ADD_COMMENT_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: ADD_COMMENT_FAILURE,
      error: err.response.data,
    });
  }
}

// uploadImages --------------
function uploadImagesAPI(data) {
  return axios.post('/post/images', data); // form 데이터
  // { name: data } 이렇게 감싸면 form 데이터가 아닌 json 이 되버림
  // form 데이터는 '그대로' 들어가야 한다.
}

function* uploadImages(action) {
  try {
    const result = yield call(uploadImagesAPI, action.data)
    yield put({
      type: UPLOAD_IMAGES_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: UPLOAD_IMAGES_FAILURE,
      error: err.response.data,
    });
  }
}

// retweet --------------
function retweetAPI(data) {
  return axios.post(`/post/${data}/retweet`); 
  // data: post.id, 해당 주소 포스트를 리트윗
}

function* retweet(action) {
  try {
    const result = yield call(retweetAPI, action.data)
    yield put({
      type: RETWEET_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: RETWEET_FAILURE,
      error: err.response.data,
    });
  }
}


function* watchRetweet() {
  yield takeLatest(RETWEET_REQUEST, retweet);
}

function* watchUploadImages() {
  yield takeLatest(UPLOAD_IMAGES_REQUEST, uploadImages);
}

function* watchLikePost() {
  yield takeLatest(LIKE_POST_REQUEST, likePost);
}

function* watchUnlikePost() {
  yield takeLatest(UNLIKE_POST_REQUEST, unlikePost);
}

function* watchLoadPost() {
  yield takeLatest(LOAD_POST_REQUEST, loadPost);
}

function* watchLoadUserPosts() {
  yield throttle(5000, LOAD_USER_POSTS_REQUEST, loadUserPosts);
}

function* watchLoadHashtagPosts() {
  yield throttle(5000, LOAD_HASHTAG_POSTS_REQUEST, loadHashtagPosts);
}

function* watchLoadPosts() {
  // yield takeLatest(LOAD_POSTS_REQUEST, loadPosts);
  yield throttle(5000, LOAD_POSTS_REQUEST, loadPosts);
}

function* watchAddPost() {
  yield takeLatest(ADD_POST_REQUEST, addPost);
}

function* watchRemovePost() {
  yield takeLatest(REMOVE_POST_REQUEST, removePost);
}

function* watchAddComment() {
  yield takeLatest(ADD_COMMENT_REQUEST, addComment);
}

export default function* postSaga() {
  yield all([
    fork(watchRetweet), 
    fork(watchUploadImages), 
    fork(watchLikePost), 
    fork(watchUnlikePost), 
    fork(watchLoadPost), 
    fork(watchLoadUserPosts), 
    fork(watchLoadHashtagPosts), 
    fork(watchLoadPosts), 
    fork(watchAddPost), 
    fork(watchRemovePost), 
    fork(watchAddComment)
  ]);
}


// function addPostAPI(postData) {
//   return axios.post("/post", postData, {
//     widthCredentials: true,
//   });
// }