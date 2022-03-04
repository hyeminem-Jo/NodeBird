import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { FOLLOW_REQUEST, UNFOLLOW_REQUEST } from '../reducers/user';

const FollowButton = ({ post }) => {
  const dispatch = useDispatch();
  const { me, followLoading, unfollowLoading } = useSelector((state) => state.user);

  // 팔로잉 여부, 내 팔로잉 목록에 해당 글을 쓴 유저의 id 가 없으면 팔로우 버튼이 뜨도록 하기
  const isFollowing = me?.Followings.find((v) => v.id === post.User.id); // 실제 데이터로 하면 post.UserId 로 해도 되려나??

  const onClickFollow = useCallback(() => {
    // 내가 이 유저를 팔로잉하고 있으면 언팔로우 버튼이 뜰 것이고, 
    // 그 상태에서 누르면 언팔로우 되는 것이기 때문에
    if (isFollowing) {
      dispatch({
        type: UNFOLLOW_REQUEST,
        data: post.User.id, // 게시글 작성자 정보
      })
    } else {
      dispatch({
        type: FOLLOW_REQUEST,
        data: post.User.id,
      })
    }
  }, [isFollowing]);

  // Unhandled Runtime Error 에러:
  // hooks, 즉 useCallback 이런 것보다 아래에 위치해야한다.
  if (post.User.id === me.id) {
    return null; // return null 을 하면 아무것도 안보여진다.
  }

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