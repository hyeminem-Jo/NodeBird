import React from 'react';
import Proptypes from 'prop-types'
import Head from 'next/head'
import 'antd/dist/antd.css';

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
  )
}

NodeBird.propTypes = {
  Component: Proptypes.elementType.isRequired,
}

export default NodeBird;
