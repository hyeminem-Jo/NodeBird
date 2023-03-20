import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import Router from "next/router";
import { END } from 'redux-saga';
import axios from "axios";
import useSWR from 'swr'; // load 즉 get 요청할 때 간편하게
// swr 안의 훅인 useSWR 사용

import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";
import { LOAD_MY_INFO_REQUEST } from "../reducers/user";
// import { LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWINGS_REQUEST, LOAD_MY_INFO_REQUEST } from "../reducers/user";
import wrapper from "../store/configureStore";

// get 요청 - 팔로워들 목록 불러오기
// 첫번째 인수로 들어가는 url 주소를 받아 실제로 연결한다. 
// fetcher 를 다른 걸로 바꾸면 graphql 도 쓸 수 있다.
const fetcher = (url) => axios.get(url, { withCredentials: true })
.then((result) => result.data)

// profile.js
// 프로필 페이지에 접근할 때마다 렌더되어 다음이 실행
// 메인페이지가 아닌 다른 페이지에서도 새로고침 할 때 로그인 정보를 가져와야 로그인인 상태의 프로필이 유지된다.
const Profile = () => {
  const [ followingsLimit, setFollowingsLimit ] = useState(3);
  const [ followersLimit, setFollowersLimit ] = useState(3);
  const { me } = useSelector((state) => state.user);

  const { data: followingsData, error: followingError } = useSWR(`http://localhost:3065/user/followings?limit=${followingsLimit}`, fetcher);
  const { data: followersData, error: followerError } = useSWR(`http://localhost:3065/user/followers?limit=${followersLimit}`, fetcher);
  // data 에 result.data, 즉 follower, following 들의 list 가 담김
  // data, error 가 담김 => 둘다 없으면 로딩중, 둘중 하나라도 있으면 data - 성공 error - 실패
  // 구조분해할당을 한 상황인데, 둘다 그냥 data 라 하면 변수가 겹치므로 이름을 지어준다. 
  // 사실 SWR 을 이용해서 3개씩 가져오는 것이 그리 효율적인 방법이 아니다.
  // => 3개 > (중복된 3개 + 3개) > (중복된 3개 + 중복된 세개 + 3개)
  // => 앞에서 이미 로드된 팔로잉, 팔로워가 계속 겹치면서 같이 렌더링 되면서 데이터의 낭비가 발생한다.
  // => 해결책: 1. useSWRInfinite 훅이 최근에 생긴다함
  // 2. offset 과 limit 을 같이 사용하여 기존에 불렀던 데이터는 캐싱을 해두고 새로 불러올 데이터만 계속 추가해서 합쳐주면 됨 (useEffect 에 folllowersData 의 id 로 비교해서 기존 state 에 concat)

  // 리덕스 대신 SWR 을 씀 => dispatch 필요 x
  // useEffect(() => {
  //   dispatch({
  //     type: LOAD_FOLLOWERS_REQUEST,
  //   })
  //   dispatch({
  //     type: LOAD_FOLLOWINGS_REQUEST,
  //   })
  // }, []) 

  // 프로필에 있는 상태에서 로그인 했다가 다시 로그아웃 하면 바로 메인페이지로 이동
  useEffect(() => {
    if (!(me && me.id)) {
      Router.push('/');
    }
  }, [me && me.id]) // me.id 
  // 굳이 me.id 를 넣은 이유: me 는 객체이며, dependency 배열에 객체를 넣는 것은 매우 안좋은 습관이다. (참조 문제)

  // 더보기 누를 때마다 팔로잉, 팔로워를 3개씩 추가로 보여준다. 3, 3+3, 3+3+3 ...
  // 해당 클릭 이벤트를 onClickMore 프로퍼티에 담아 보낸다.
  const loadMoreFollowings = useCallback(() => {
    setFollowingsLimit((prev) => prev + 3);
  }, [])

  const loadMoreFollowers = useCallback(() => {
    setFollowersLimit((prev) => prev + 3);
  }, [])
  
  // return 이 되어버리면 그 아래 것들이 실행안되기 때문에 return 은 무조건 hooks 아래에 위치
  if (followerError || followingError) { // 에러가 있으면 에러 표시
    console.error(followerError || followingError);
    return <div>팔로잉/팔로워 로딩 중 에러가 발생합니다.</div>
  }
  
  // 로그인을 아직 안했을 때 프로필을 못들어가게 return null 로 방지 
  if (!me) {
    return '내 정보 로딩중'; 
    // 로그인 안한 상태로 프로필로 가면, 빈 바탕화면에 '내 정보 로딩중' 가 뜨고 로딩이 끝나면 메인페이지로 돌아가있음
    // return null;
  }
  
  return (
    <>
      <Head>
        <title>내 프로필 | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        {/* 더보기 버튼 클릭 이벤트를 전달 */}
        {/* SWR 에서 로딩중일 때: error 도 없고 data 도 없을 때 */}
        <FollowList header="팔로잉" data={followingsData} onClickMore={loadMoreFollowings} 
        loading={!followingsData && !followingError} />
        <FollowList header="팔로워" data={followersData} onClickMore={loadMoreFollowers} 
        loading={!followersData && !followerError} />
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
