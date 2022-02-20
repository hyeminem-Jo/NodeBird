// sagas > post.js

import axios from 'axios';
import { all, fork, delay, put, takeLatest } from 'redux-saga/effects';

// addPost --------------
function addPostAPI(data) { 
  return axios.post('/api/post', data) 
}

function* addPost(action) {
  try { 
    yield delay(1000);
    // const result = yield call(addPostAPI, action.data) 
    yield put({ 
      type: 'ADD_POST_SUCCESS',
      // data: result.data,
    })
  } catch (err) { 
    yield put({
      type: 'ADD_POST_FAILURE',
      data: err.response.data,
    })
  }
}

function* watchAddPost() {
  yield takeLatest('ADD_POST_REUEST', addPost);
}

export default function* postSaga() {
  yield all([
    fork(watchAddPost),
  ])
}