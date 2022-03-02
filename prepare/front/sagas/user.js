// sagas > user.js

import axios from 'axios';
import { all, fork, call, delay, takeLatest, put } from 'redux-saga/effects'

import { LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, 
  LOG_OUT_REQUEST, LOG_OUT_SUCCESS, LOG_OUT_FAILURE,
  SIGN_UP_REQUEST, SIGN_UP_SUCCESS, SIGN_UP_FAILURE, 
  FOLLOW_REQUEST, UNFOLLOW_REQUEST, FOLLOW_SUCCESS, 
  FOLLOW_FAILURE, UNFOLLOW_FAILURE, UNFOLLOW_SUCCESS } from '../reducers/user';

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
      // LOG_IN_REQUEST 에서 받은 데이터를 바로 LOG_IN_SUCCESS 로 보냄
    })
  } catch (err) { 
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
    yield put({
      type: SIGN_UP_FAILURE,
      error: err.response.data,
    })
  }
}

// follow --------------
function followAPI() {
  return axios.post('/api/follow');
}

function* follow(action) {
  try { 
    yield delay(1000);
    // const result = yield call(followAPI) 
    yield put({ 
      type: FOLLOW_SUCCESS,
      data: action.data,
    })
  } catch (err) { 
    yield put({
      type: FOLLOW_FAILURE,
      error: err.response.data,
    })
  }
}

// unfollow --------------
function unfollowAPI() { 
  return axios.post('/api/unfollow');
}

function* unfollow(action) {
  try { 
    yield delay(1000);
    // const result = yield call(unfollowAPI) 
    yield put({ 
      type: UNFOLLOW_SUCCESS,
      data: action.data,
    })
  } catch (err) { 
    yield put({
      type: UNFOLLOW_FAILURE,
      error: err.response.data,
    })
  }
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
    fork(watchLogIn),
    fork(watchLogOut),
    fork(watchFollow),
    fork(watchUnfollow),
    fork(watchSignUp),
  ])
}