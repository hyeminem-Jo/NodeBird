// sagas > index.js
import { all, fork } from 'redux-saga/effects';
import axios from 'axios';

import postSaga from './post';
import userSaga from './user';

// 일일히 saga 에서 axios 요청을 할 때 http://localhost:3065/user~ 로  중복 표기하는 것이 아닌, 다음과 같이 기본 url 로 설정하면 그냥 /user 로 표기해도 된다.
axios.defaults.baseURL = 'http://localhost:3065';

// axios 요청할 때 공통적으로 모두 쿠키를 전달할 수 있도록 설정 
// => { withCredentials = true } 중복 제거
axios.defaults.withCredentials = true;

export default function* rootSaga() {
  yield all([
    fork(postSaga),
    fork(userSaga),
  ])
}
