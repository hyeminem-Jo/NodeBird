import React from 'react';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import AppLayout from '../components/AppLayout';
import { Card } from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import wrapper from '../store/configureStore';
import { LOAD_USER_REQUEST } from '../reducers/user';
import { END } from 'redux-saga';

const About = () => {
  const { userInfo } = useSelector((state) => state.user);
  return (
    <AppLayout>
      <Head>
        <title>Jinny | NodeBird</title>
      </Head>
      {userInfo 
        ? (
          <Card
            actions={[
              <div key="twit">
                짹짹
                <br />
                {userInfo.Posts}
              </div>,
              <div key="following">
                팔로잉
                <br />
                {userInfo.Followings}
              </div>,
              <div key="follower">
                팔로워
                <br />
                {userInfo.Followers}
              </div>,
            ]}
          >
            <Card.Meta
              avatar={<Avatar>{userInfo.nickname[0]}</Avatar>}
              title={userInfo.nickname}
              description="노드버드 초보자"
            /> 
          </Card>
        ) 
        : null}
    </AppLayout>
  );
};

// Jinny2 의 정보(userInfo)가 서버사이드렌더링이 안되면 null, 아무것도 안뜰 것임 (내 정보(me)x)
export const getStaticProps = wrapper.getStaticProps((store) => async () => {
  store.dispatch({ // 내 정보가 아닌 특정 사용자(타인의 정보) 가져오기
    type: LOAD_USER_REQUEST,
    data: 13, // Jinny2 의 userId
  });
  // REQUEST 가 saga 에서 SUCCESS 될 때까지 기다림
  store.dispatch(END);
  await store.sagaTask.toPromise();
})
// export const getServerSideProps = wrapper.getServerSideProps(
// (store) => async ({ req }) => {

export default About;