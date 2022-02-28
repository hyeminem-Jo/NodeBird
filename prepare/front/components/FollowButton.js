import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { FOLLOW_REQUEST, UNFOLLOW_REQUEST } from '../reducers/user';

const FollowButton = ({ post }) => {
  const dispatch = useDispatch();
  const { me, followLoading, unfollowLoading } = useSelector((state) => state.user);

  // 팔로잉 여부, 내 팔로잉 목록에 해당 글을 쓴 유저의 id 가 없으면 팔로우 버튼이 뜨도록 하기
  const isFollowing = me?.Followings.find((v) => v.id === post.User.id);

  const onClickFollow = useCallback(() => {
    // 내가 이 유저를 팔로잉하고 있으면 언팔로우 버튼이 뜰 것이고, 
    // 그 상태에서 누르면 언팔로우 되는 것이기 때문에
    if (isFollowing) {
      dispatch({
        type: UNFOLLOW_REQUEST,
        data: post.User.id,
      })
    } else {
      dispatch({
        type: FOLLOW_REQUEST,
        data: post.User.id,
      })
    }
  }, [isFollowing]);

  return (
    <div>
      <Button loading={followLoading || unfollowLoading} onClick={onClickFollow}>
        {isFollowing ? '언팔로우' : '팔로우'}
      </Button>
    </div>
  );
};

FollowButton.propTypes = {
  post: PropTypes.object.isRequired,
}

export default FollowButton;