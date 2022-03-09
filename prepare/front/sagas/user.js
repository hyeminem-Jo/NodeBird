// sagas > user.js

import axios from 'axios';
import { all, fork, call, takeLatest, put } from 'redux-saga/effects'

import { LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, 
  LOG_OUT_REQUEST, LOG_OUT_SUCCESS, LOG_OUT_FAILURE,
  SIGN_UP_REQUEST, SIGN_UP_SUCCESS, SIGN_UP_FAILURE, 
  FOLLOW_REQUEST, UNFOLLOW_REQUEST, FOLLOW_SUCCESS, 
  FOLLOW_FAILURE, UNFOLLOW_FAILURE, UNFOLLOW_SUCCESS, LOAD_USER_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_FAILURE, CHANGE_NICKNAME_REQUEST, CHANGE_NICKNAME_SUCCESS, CHANGE_NICKNAME_FAILURE, LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWINGS_REQUEST, LOAD_FOLLOWERS_SUCCESS, LOAD_FOLLOWERS_FAILURE, LOAD_FOLLOWINGS_SUCCESS, LOAD_FOLLOWINGS_FAILURE, REMOVE_FOLLOWER_REQUEST, REMOVE_FOLLOWER_SUCCESS, REMOVE_FOLLOWER_FAILURE } from '../reducers/user';

// loadUser --------------
function loadUserAPI() {
  return axios.get('/user') // data 는 없음
  // 3065 에 get 요청을 보냄
} 
// GET 이나 DELETE 는 data 가 없기 때문에, 세번째가 아닌 두번째 인자에 {withCredentials: true} 같은 옵션을 넣어줌

function* loadUser(action) {
  try { 
    const result = yield call(loadUserAPI, action.data) 
    yield put({ 
      type: LOAD_USER_SUCCESS,
      data: result.data, // 서버로부터 사용자 정보 받기
    })
  } catch (err) { 
    console.error(err);
    yield put({
      type: LOAD_USER_FAILURE,
      error: err.response.data,
    })
  }
}

// logIn --------------
function loginAPI(data) { // loginAPI 부분은 제너레이터가 아닌 일반 함수로 해야함
  return axios.post('/user/login', data) // 실제로 서버에 요청을 보냄
} // data: { email, password }

function* logIn(action) {
  try { 
    const result = yield call(loginAPI, action.data) 
    yield put({ 
      type: LOG_IN_SUCCESS,
      data: result.data, // 서버로부터 사용자 정보 받기
      // { id, email, nickname, Posts id, Followings id, Followers id }
      // LOG_IN_REQUEST 에서 받은 데이터를 바로 LOG_IN_SUCCESS 로 보냄
    })
  } catch (err) { 
    console.error(err);
    yield put({
      type: LOG_IN_FAILURE,
      error: err.response.data,
    })
  }
}

// 카카오, 네이버, 구글 로그인 등등 여러 로그인 전략이 있고, 이러한 것들을 한 번에 관리해주는 passport 라는 라이브러리가 있다.
// 또한 아이디(이메일)과 비밀번호로 로그인 할 수 있도록 해주는 것이 passport-local 이다.

// logOut --------------
function logOutAPI() { 
  return axios.post('/user/logout');
}

function* logOut() {
  try { 
    yield call(logOutAPI)
    yield put({ 
      type: LOG_OUT_SUCCESS,
    })
  } catch (err) {
    console.error(err); 
    yield put({
      type: LOG_OUT_FAILURE,
      error: err.response.data,
    })
  }
}

// signUp --------------
function signUpAPI(data) { // data: {email, nickname, password}
  return axios.post('/user', data); 
  // 백엔드 서버 주소로
}

function* signUp(action) { // action.data: {email, nickname, password}
  try { 
    const result = yield call(signUpAPI, action.data);
    console.log(result);
    yield put({ 
      type: SIGN_UP_SUCCESS,
    })
  } catch (err) { 
    console.error(err);
    yield put({
      type: SIGN_UP_FAILURE,
      error: err.response.data,
    })
  }
}

// changeNickname --------------
function changeNicknameAPI(data) { // nickname
  return axios.patch('/user/nickname', { nickname: data }); 
  // nickname (객체가 아닌 그냥 데이터 하나라면, 객체로 만들어줌)
  // ex) 달랑 content 하나, 혹은 nickname 하나 등
}

function* changeNickname(action) {
  try { 
    const result = yield call(changeNicknameAPI, action.data) 
    yield put({ 
      type: CHANGE_NICKNAME_SUCCESS,
      data: result.data,
    })
  } catch (err) { 
    console.error(err);
    yield put({
      type: CHANGE_NICKNAME_FAILURE,
      error: err.response.data,
    })
  }
}

// follow --------------
function followAPI(data) { // 팔로우할 사람 id
  return axios.patch(`/user/${data}/follow`); // /user/1/follow
}

function* follow(action) { 
  try { 
    const result = yield call(followAPI, action.data) // 팔로우할 사람 id
    yield put({ 
      type: FOLLOW_SUCCESS,
      data: result.data,
    })
  } catch (err) { 
    console.error(err);
    yield put({
      type: FOLLOW_FAILURE,
      error: err.response.data,
    })
  }
}

// unfollow (removeFollowings) --------------
function unfollowAPI(data) { // 내 팔로잉에서 제거할 유저 id
  return axios.delete(`/user/${data}/follow`);
}

function* unfollow(action) {
  try { 
    const result = yield call(unfollowAPI, action.data) 
    yield put({ 
      type: UNFOLLOW_SUCCESS,
      data: result.data,
    })
  } catch (err) { 
    console.error(err);
    yield put({
      type: UNFOLLOW_FAILURE,
      error: err.response.data,
    })
  }
}

// removeFollower --------------
function removeFollowerAPI(data) { // 내 팔로워에서 제거할 유저 id
  return axios.delete(`/user/follower/${data}`); 
}

function* removeFollower(action) {
  try { 
    const result = yield call(removeFollowerAPI, action.data) 
    yield put({ 
      type: REMOVE_FOLLOWER_SUCCESS,
      data: result.data,
    })
  } catch (err) { 
    console.error(err);
    yield put({
      type: REMOVE_FOLLOWER_FAILURE,
      error: err.response.data,
    })
  }
}

// loadFollowers --------------
function loadFollowersAPI() { // 팔로워 목록 불러오기
  return axios.get('user/followers');
}

function* loadFollowers(action) {
  try { 
    const result = yield call(loadFollowersAPI, action.data)
    yield put({ 
      type: LOAD_FOLLOWERS_SUCCESS,
      data: result.data,
      // result.data = [ {id: 12, nickname: jinny ...}, {}, ... ] 
    })
  } catch (err) { 
    console.error(err);
    yield put({
      type: LOAD_FOLLOWERS_FAILURE,
      error: err.response.data,
    })
  }
}

// loadFollowings --------------
function loadFollowingsAPI() { // 내 팔로잉에서 제거할 유저 id
  return axios.get('user/followings');
}

function* loadFollowings(action) {
  try { 
    const result = yield call(loadFollowingsAPI, action.data) 
    yield put({ 
      type: LOAD_FOLLOWINGS_SUCCESS,
      data: result.data,
      // result.data = [ {id: 12, nickname: jinny ...}, {}, ... ] 
    })
  } catch (err) { 
    console.error(err);
    yield put({
      type: LOAD_FOLLOWINGS_FAILURE,
      error: err.response.data,
    })
  }
}


function* watchRemoveFollowers() {
  yield takeLatest(REMOVE_FOLLOWER_REQUEST, removeFollower); 
}

function* watchLoadFollowers() {
  yield takeLatest(LOAD_FOLLOWERS_REQUEST, loadFollowers); 
}

function* watchLoadFollowings() {
  yield takeLatest(LOAD_FOLLOWINGS_REQUEST, loadFollowings); 
}

function* watchChangeNickname() {
  yield takeLatest(CHANGE_NICKNAME_REQUEST, changeNickname); 
}

function* watchLoadUser() {
  yield takeLatest(LOAD_USER_REQUEST, loadUser); 
}

function* watchLogIn() {
  yield takeLatest(LOG_IN_REQUEST, logIn); 
}

function* watchLogOut() {
  yield takeLatest(LOG_OUT_REQUEST, logOut);
}

function* watchFollow() {
  yield takeLatest(FOLLOW_REQUEST, follow);
}

function* watchUnfollow() {
  yield takeLatest(UNFOLLOW_REQUEST, unfollow);
}

function* watchSignUp() {
  yield takeLatest(SIGN_UP_REQUEST, signUp); 
}

export default function* userSaga() {
  yield all([
    fork(watchLoadFollowers),
    fork(watchLoadFollowings),
    fork(watchChangeNickname),
    fork(watchLoadUser),
    fork(watchLogIn),
    fork(watchLogOut),
    fork(watchFollow),
    fork(watchUnfollow),
    fork(watchRemoveFollowers),
    fork(watchSignUp),
  ])
}