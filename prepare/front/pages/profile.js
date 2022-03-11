import React, { useEffect } from "react";
import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";
import Head from "next/head";
import { useDispatch, useSelector } from "react-redux";
import Router from "next/router";
import { LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWINGS_REQUEST, LOAD_MY_INFO_REQUEST, LOAD_USER_REQUEST } from "../reducers/user";
import axios from "axios";
import { END } from 'redux-saga';
import wrapper from "../store/configureStore";


// 프로필 페이지에 접근할 때마다 렌더되어 다음이 실행
const Profile = () => {
  const dispatch = useDispatch();
  const { me } = useSelector((state) => state.user);

  // 프로필 페이지 profile.js
  useEffect(() => {
    // 메인페이지가 아닌 다른 페이지에서도 새로고침 할 때 로그인 정보를 가져와야 로그인인 상태의 프로필이 유지된다.
    dispatch({ 
      type: LOAD_USER_REQUEST,
    })
    dispatch({
      type: LOAD_FOLLOWERS_REQUEST,
    })
    dispatch({
      type: LOAD_FOLLOWINGS_REQUEST,
    })
  }, []) 

  // 프로필에 있는 상태에서 로그인 했다가 다시 로그아웃 하면 바로 메인페이지로 이동
  useEffect(() => {
    if (!(me && me.id)) {
      Router.push('/');
    }
  }, [me && me.id]) // me.id 
  // 굳이 me.id 를 넣은 이유: me 는 객체이며, dependency 배열에 객체를 넣는 것은 매우 안좋은 습관이다. (참조 문제)

  // 로그인을 아직 안했을 때 프로필을 못들어가게 return null 로 방지 
  if (!me) {
    return null;
  }
  
  return (
    <>
      <Head>
        <title>내 프로필 | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList header="팔로잉" data={me?.Followings} />
        <FollowList header="팔로워" data={me?.Followers} />
      </AppLayout>
    </>
  );
};

// 나의 로그인(로그인 정보) 여부에 따라 화면이 '바뀜' (로그인이 되어있지 않을 때 프로필 페이지가 안보여야함)
// => getServerSideProps 필요
export const getServerSideProps = wrapper.getServerSideProps((store) => async ({ req }) => {
  // 서버쪽에서 실행되면 req 라는 것이 존재한다.
  console.log('getServerSideProps start');
  console.log(req.headers);
  const cookie = req ? req.headers.cookie : '';
  axios.defaults.headers.Cookie = ''; 
  if (req && cookie) { 
    axios.defaults.headers.Cookie = cookie;
  }
  
  store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  
  store.dispatch(END);
  console.log('getServerSideProps end');
  await store.sagaTask.toPromise();
});

export default Profile;
