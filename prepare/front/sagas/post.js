// sagas > post.js

import axios from "axios";
import { all, fork, delay, put, takeLatest, throttle, call } from "redux-saga/effects";
import shortId from "shortid";

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
  generateDummyPost,
} from "../reducers/post";

// loadPosts --------------
function loadPostsAPI(data) {
  return axios.get("/api/posts", data);
}

function* loadPosts(action) {
  try {
    yield delay(1000); // 서버에서 못가져오니 delay 로 서버에서 가져오는 흉내 (비동기)
    // LOAD_POSTS_SUCCESS 할 때 데이터 10개를 가짜로 가져옴
    yield put({
      type: LOAD_POSTS_SUCCESS,
      data: generateDummyPost(10)
    });
  } catch (err) {
    yield put({
      type: LOAD_POSTS_FAILURE,
      data: err.response.data,
    });
  }
}

// addPost --------------
function addPostAPI(data) {
  return axios.post("/post", { content: data });
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
      data: result.data.id, // model 객체에서 id 는 자동으로 생성됨
    });
  } catch (err) {
    yield put({
      type: ADD_POST_FAILURE,
      data: err.response.data,
    });
  }
}

// removePost --------------
function removePostAPI(data) {
  return axios.delete("/api/post", data);
}

function* removePost(action) {
  try {
    yield delay(1000);
    yield put({
      type: REMOVE_POST_SUCCESS,
      data: action.data // 삭제 게시글 id 
    });
    // from user reducer
    yield put({ // 게시글 수 변경 (user action)
      type: REMOVE_POST_OF_ME,
      data: action.data, // 삭제 게시글 id
    });
  } catch (err) {
    yield put({
      type: REMOVE_POST_FAILURE,
      data: err.response.data,
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
    yield put({
      type: ADD_COMMENT_FAILURE,
      data: err.response.data,
    });
  }
}

function* watchLoadPost() {
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
    fork(watchLoadPost), 
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