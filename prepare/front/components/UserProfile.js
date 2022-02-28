import React, { useCallback } from 'react';
import { Avatar, Button, Card } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { logoutRequestAction } from '../reducers/user';


const UserProfile = () => {
  const dispatch = useDispatch();
  const { me, logOutLoading } = useSelector((state) => state.user)

  const onLogOut = useCallback(() => {
    dispatch(logoutRequestAction())
    // setIsLoggedIn(false); // 로그아웃
  }, [])

  return (
    // ** 리액트에서 배열로 jsx 를 쓸 때 key 를 넣어주어야 함
    <Card
      actions={[
        <div key="twit">짹짹<br/>{me.Posts.length}</div>,
        <div key="followings">팔로잉<br/>{me.Followings.length}</div>,
        <div key="followings">팔로워<br/>{me.Followers.length}</div>,
      ]}
    >
      <Card.Meta
        avatar={<Avatar>{me.nickname[0]}</Avatar>}
        title={me.nickname}
      />
      <Button onClick={onLogOut} loading={logOutLoading}>로그아웃</Button>
    </Card>
  )
}

export default UserProfile;