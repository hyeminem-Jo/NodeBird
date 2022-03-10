import React from "react";
import Proptypes from "prop-types";
import Head from "next/head";
import "antd/dist/antd.css";
// import withReduxSaga from 'next-redux-saga' 가 필요없어짐 (next9 버전 이후로..?)

import wrapper from "../store/configureStore";

// 만약 헤드 부분을 수정하고 싶다면 Next 에서 제공하는 Head 컴포넌트를 쓰면 된다. => ex) title, 즉 창에 NodeBird 라고 띄워보기

const NodeBird = ({ Component }) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>NodeBird</title>
      </Head>
      <Component />
    </>
  );
};

NodeBird.propTypes = {
  Component: Proptypes.elementType.isRequired,
};

export default wrapper.withRedux(NodeBird); 
// configurerStore.js 의 next-redux-wrapper 로 만든 wrapper 로 app.js 를 감쌈
// 이걸로 이제 개별페이지들에 ssr 을 적용시켜줄 것이다.
// 원래 next 에선 ssr 용 메서드를 4가지 제공하지만, 이 4가지 모두 redux 랑 같이 사용할 땐 문제가 있기 때문에 'next-redux-wrapper 가 제공하는 ssr 용 메서드'를 사용하는 것이 더 낫다.

// export default wrapper.withRedux(withReduxSaga(NodeBird));