import React, { useEffect } from "react";
import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";
import Head from "next/head";
import { useSelector } from "react-redux";
import Router from "next/router";

const Profile = () => {
  const { me } = useSelector((state) => state.user);

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
        <FollowList header="팔로잉 리스트" data={me.Followings} />
        <FollowList header="팔로워 리스트" data={me.Followers} />
      </AppLayout>
    </>
  );
};

export default Profile;
