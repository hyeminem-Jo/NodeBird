// configureStore.js

import { createWrapper } from "next-redux-wrapper";
import { applyMiddleware, compose, createStore } from "redux";
import { composeWithDevTools } from 'redux-devtools-extension';

import reducer from "../reducers";

const configureStore = () => {
  const middlewares = [];
  
  // enhancer: 리덕스의 기능이 확장된 것
  const enhancer = process.env.NODE_ENV === 'production'
  // 개발용 미들웨어와 배포용 미들웨어는 다름
    ? compose(applyMiddleware(...middlewares)) // 배포용
    : composeWithDevTools(applyMiddleware(...middlewares)) // 개발용 - 여기에 dev tool 을 넣어줌
    // composeWithDevTools 를 사용할 때 history 가 쌓이면 메모리도 많이 차지하고, 중앙데이터들이 어떻게 변하는지 전부 보이기 때문에 보안에 취약할 수 있다.
    // 그러므로 배포용일 땐 데브 툴(composeWithDevTools) 을 연결하지 않고, 개발용일 때는 composeWithDevTools 를 연결해준다.

  const store = createStore(reducer, enhancer);
  return store; // state , reducer 를 포함한 것
};

const wrapper = createWrapper(configureStore, {
  debug: process.env.NODE_ENV === "development",
});
// configureStore 옆으로 두 번째 인자: optional 객체
// 개발시 다음과 같이 debug 를 true 로 하는 것이 설명도 뜨고 편리하다.

export default wrapper;
