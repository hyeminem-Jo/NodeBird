// sagas > user.js

import axios from 'axios';
import { all, fork, call, delay, takeLatest, put } from 'redux-saga/effects'

import { LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, 
  LOG_OUT_REQUEST, LOG_OUT_SUCCESS, LOG_OUT_FAILURE,
  SIGN_UP_REQUEST, SIGN_UP_SUCCESS, SIGN_UP_FAILURE } from '../reducers/user';
// 
// logIn --------------
function loginAPI(data) { // loginAPI 부분은 제너레이터가 아닌 일반 함수로 해야함
  return axios.post('/api/login', data) // 실제로 서버에 요청을 보냄
}

function* logIn(action) {
  try { 
    console.log('login action - saga')
    yield delay(1000);
    // const result = yield call(loginAPI, action.data) 
    yield put({ 
      type: LOG_IN_SUCCESS,
      data: action.data, // 일단 데이터는 action.data
      // LOG_IN_REQUEST 에서 받은 데이터를 바로 LOG_IN_SUCCESS 로 보냄
      // data: result.data,
    })
  } catch (err) { 
    yield put({
      type: LOG_IN_FAILURE,
      error: err.response.data,
    })
  }
}

// logOut --------------
function logOutAPI() { 
  return axios.post('/api/logout');
}

function* logOut() {
  try { 
    yield delay(1000);
    // const result = yield call(logOutAPI) 
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
function signUpAPI() { 
  return axios.post('/api/logout');
}

function* signUp() {
  try { 
    yield delay(1000); // 1초 후에
    // 여기서 throw new Error('') 를 하면 catch (에러)부분이 동작함
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

function* watchLogIn() {
  yield takeLatest(LOG_IN_REQUEST, logIn); 
}

function* watchLogOut() {
  yield takeLatest(LOG_OUT_REQUEST, logOut);
}

function* watchSignUp() {
  yield takeLatest(SIGN_UP_REQUEST, signUp); 
}

export default function* userSaga() {
  yield all([
    fork(watchLogIn),
    fork(watchLogOut),
    fork(watchSignUp),
  ])
}