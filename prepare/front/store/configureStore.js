// configureStore.js

import { applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from 'redux-saga';
import { createWrapper } from "next-redux-wrapper";
import { composeWithDevTools } from 'redux-devtools-extension';

import reducer from "../reducers";
import rootSaga from '../sagas';

// ex) 엄청 간단한 미들웨어:
const loggerMiddleware = ({ dispatch, getState }) => (next) => (action) => {
  console.log(action) // action 을 실행하기 전에 console.log() 를 한번 실행해주는 미들웨어
  return next(action);
}

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware()
  // const middlewares = [sagaMiddleware];
  const middlewares = [sagaMiddleware, loggerMiddleware];
  
  // enhancer: 리덕스의 기능이 확장된 것
  const enhancer = process.env.NODE_ENV === 'production'
  // 개발용 미들웨어와 배포용 미들웨어는 다름
    ? compose(applyMiddleware(...middlewares)) // 배포용
    : composeWithDevTools(applyMiddleware(...middlewares)) // 개발용 

  const store = createStore(reducer, enhancer);
  store.sagaTask = sagaMiddleware.run(rootSaga);
  return store; // state , reducer 를 포함한 것
};

// next-redux-wrapper 로 만듦
const wrapper = createWrapper(configureStore, {
  debug: process.env.NODE_ENV === "development",
});
// configureStore 옆으로 두 번째 인자: optional 객체
// 개발시 다음과 같이 debug 를 true 로 하는 것이 설명도 뜨고 편리하다.

export default wrapper;
