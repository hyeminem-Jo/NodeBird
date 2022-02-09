import React, { useCallback } from 'react';
import {Avatar, Button, Card} from 'antd';
import Proptypes from 'prop-types'


const UserProfile = ({ setIsLoggedIn }) => {

  const onLogOut = useCallback(() => {
    setIsLoggedIn(false); // 로그아웃
  }, [])

  return (
    // ** 리액트에서 배열로 jsx 를 쓸 때 key 를 넣어주어야 함
    <Card
      actions={[
        <div key="twit">짹짹<br/>0</div>,
        <div key="followings">팔로잉<br/>0</div>,
        <div key="followings">팔로워<br/>0</div>,
      ]}
    
    >
      <Card.Meta
        avatar={<Avatar>HJ</Avatar>}
        title="Jinny"
      />
      <Button onClick={onLogOut}>로그아웃</Button>
    </Card>
  )
}

UserProfile.propTypes = {
  setIsLoggedIn: Proptypes.func.isRequired,
}

export default UserProfile;