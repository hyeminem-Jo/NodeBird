import React, { useCallback } from 'react';
import { Avatar, Button, Card } from 'antd';
import Link from 'next/link';

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
        // 짹짹 클릭: 내가 쓴 게시글 이동
        // 팔로잉, 팔로워 클릭: 내 프로필 이동
        <div key="twit">
          <Link href={`/user/${me.id}`}>
            <a>짹짹<br/>{me.Posts.length}</a>
          </Link>
        </div>,
        <div key="followings">
          <Link href={`/profile`}>
            <a>팔로잉<br/>{me.Followings.length}</a>
          </Link>
        </div>,
        <div key="followings">
          <Link href={`/profile`}>
            <a>팔로워<br/>{me.Followers.length}</a>
          </Link>
        </div>,
      ]}
    >
      <Card.Meta
        avatar={(
          <Link href={`/user/${me.id}`}>
            <a><Avatar>{me.nickname[0]}</Avatar></a>
          </Link>
        )}
        title={me.nickname}
      />
      <Button onClick={onLogOut} loading={logOutLoading}>로그아웃</Button>
    </Card>
  )
}

export default UserProfile;