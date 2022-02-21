import React from "react";
import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";
import Head from "next/head";
import { useSelector } from "react-redux";

const Profile = () => {

  const { me } = useSelector((state) => state.user);

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
