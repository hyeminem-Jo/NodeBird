import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Popover, Avatar, List, Comment } from "antd";
import { RetweetOutlined, HeartOutlined, MessageOutlined, EllipsisOutlined, HeartTwoTone } from "@ant-design/icons";
import CommentForm from "./CommentForm";

import PostImages from "./PostImages";
import PostCardContent from "./PostCardContent";
import FollowButton from "./FollowButton";
import { LIKE_POST_REQUEST, REMOVE_POST_REQUEST, UNLIKE_POST_REQUEST, RETWEET_REQUEST } from "../reducers/post";

// antd 기능: Card 컴포넌트 기능 cover
// post 에 Images 가 하나 라도 있다면 이미지 표현

const PostCard = ({ post }) => {
  
  const dispatch = useDispatch();
  const { removePostLoading } = useSelector((state) => state.post);
  // const { me } = useSelector((state) => state.user);
  // const id = me && me.id // 만약 id 가 있는 상태(로그인 상태)면 me 와 me.id 가 있음
  // 줄인 문법: me?.id (optional chaining)
  // me 가 me.id 에 접근하기 전,에 me 자신이 undefined 나 null 이 아닌지 검증한다.
  // => me 가 존재하면 me.id 를 id 에 들어가고 그것이 없으면 undefined
  // 한 번에 쓰는 법:
  const [commentFormOpened, setCommentFormOpened] = useState(false);

  // 로그인 한 유저의 id
  const id = useSelector((state) => state.user.me?.id);

  // // 자신의 게시글을 리트윗하려 할 때
  // useEffect(() => {
  //   console.log('rerender');
  //   if(retweetError) {
  //     alert(retweetError); // 리렌더링이 계속되면 alert 도 계속뜨는 에러가 발생
  //     // 리렌더링이 계속 되면서 alert 가 계속 뜸
  //     // 리렌더링이 8번 뜸 => 게시글도 8번임 => 연관성 o
  //     // 이유: PostCard 8개에서 모두 useEffect 가 실행되버림 
  //     // 해결: 해당 useEffect 를 상위 컴포넌트로 옮김
  //   }
  // }, [retweetError]);

  const onLike = useCallback(() => {
    // front 에서도 로그인 여부를 반드시 확인해줘야함 (권한)
    if(!id) {
      return alert('로그인이 필요합니다.');
    }
    return dispatch({
      type: LIKE_POST_REQUEST,
      data: post.id,
    })
  }, [id])

  const onUnLike = useCallback(() => {
    // front 에서도 로그인 여부를 반드시 확인해줘야함 (권한)
    if(!id) {
      return alert('로그인이 필요합니다.');
    }
    return dispatch({
      type: UNLIKE_POST_REQUEST,
      data: post.id,
    })
  }, [id])

  const onToggleComment = useCallback(() => {
    setCommentFormOpened((prev) => !prev);
  }, [])

  const onRemovePost = useCallback(() => {
    // front 에서도 로그인 여부를 반드시 확인해줘야함 (권한)
    if(!id) {
      return alert('로그인이 필요합니다.');
    }
    return dispatch({
      type: REMOVE_POST_REQUEST,
      data: post.id,
    })
  }, [id])

  const onRetweet = useCallback(() => {
    // front 에서도 로그인 여부를 반드시 확인해줘야함 (권한)
    if(!id) {
      return alert('로그인이 필요합니다.');
    }
    return dispatch({
      type: RETWEET_REQUEST,
      data: post.id,
    })

  }, [id]);

  // 게시글의 [좋아요 누른 사람들 리스트] 중에 로그인한 유저(me)의 id 가 있는지
  const liked = post.Likers.find((v) => v.id === id)
  
  return (
    <div style={{ marginBottom: 20 }}>
      {/* post 에 Images 가 하나 라도 있다면 이미지 표현 */}
      <Card
        cover={post.Images[0] && <PostImages images={post.Images} />}
        // 배열 안에 컴포넌트를 넣을 때 반드시 key 를 넣어주어야 한다.
        actions={[
          <RetweetOutlined key="retweet" onClick={onRetweet} />,
          liked  // 해당 post.Likers 에 있는 요소(UserId)들 중 로그인 한 유저(me)의 id 가 있다면 true 없으면 false
            ? <HeartTwoTone twoToneColor="crimson" key="heart" onClick={onUnLike} /> 
            : <HeartOutlined key="heart" onClick={onLike}  />,
          <MessageOutlined key="comment" onClick={onToggleComment} />,
          <Popover key="more" content={(
            <Button.Group>
              {/* 내가 쓴 글이면 수정/삭제 버튼이 보이게 하고, 남이 쓴 글이면 신고 버튼만 */}
              {
                id && post.User.id === id ? 
                // id 가 있고(로그인이 되었고), 로그인된 me 의 id 와 작성자의 id 가 일치하면
                ( 
                  <>
                    <Button>수정</Button>
                    <Button type="danger" loading={removePostLoading} onClick={onRemovePost}>삭제</Button>
                  </>
                ) : <Button>신고</Button>
              }
            </Button.Group>
          )}>
            <EllipsisOutlined />
          </Popover>,
        ]}
        // 리트윗 게시글이면 누가 리트윗 했는지 표시, 일반 게시글이면 x
        // Card.Meta, Card 두개 다 title 이 존재
        title={post.RetweetId ? `${post.User.nickname} 님이 리트윗 하셨습니다.` : null}
        // 로그인 했을 때만 팔로우 할 수 있는 권한
        extra={id && <FollowButton post={post} />}
      >

      {/* 게시물 틀 안의 메인 내용물 */}
      {/* 리트윗 게시글일 경우, RetweetId 와 Retweet 객체를 가지고 있음 */}
      {post.RetweetId &&  post.Retweet
        ? ( // 리트윗 게시글일 경우 => 아이콘x, 리트윗 원본 게시글의 이미지/내용으로 바꾼다. (Retweet.~)
          <Card 
            cover={post.Retweet.Images[0] && <PostImages images={post.Retweet.Images} />} 
          >
            <Card.Meta 
              avatar={<Avatar>{post.Retweet.User.nickname[0]}</Avatar>}
              title={post.Retweet.User.nickname}
              description={<PostCardContent postData={post.Retweet.content} />}
            />
          </Card>
        )
        : ( // 리트윗 게시글이 아닐 경우
          <Card.Meta 
            avatar={<Avatar>{post.User.nickname[0]}</Avatar>}
            // 그냥 post.User.nickname 의 첫번째 글짜를 아바타로 ex) 구글 프로필에 '조'
            title={post.User.nickname}
            description={<PostCardContent postData={post.content} />}
            // description={post.content} 에서, 해시태그 기능을 위해 아예 컴포넌트로 빼준다.
          />
        )}

      </Card>

      {
        commentFormOpened && (
          <div>
            <CommentForm post={post} />
            {/* 댓글을 쓸 때, 그 댓글은 게시글에 속해있다. (그러므로 어떤 게시글에 댓글이 달릴건지에 대한 정보, 즉 게시글의 id 를 받아야한다. */}
            <List
              header={`${post.Comments.length}개의 댓글`}
              itemLayout="horizantal"
              dataSource={post.Comments}
              renderItem={(item) => (
                <li>
                  <Comment 
                    author={item.User.nickname}
                    avatar={<Avatar>{item.User.nickname[0]}</Avatar>}
                    content={item.content}
                  />
                </li>
              )}
            />
          </div>)
      }
    </div>
  );
};

PostCard.propTypes = {
  // post: PropTypes.object.isRequired 그냥 객체 확인
  // 더 자세하게 객체 확인
  post: PropTypes.shape({
    id: PropTypes.number,
    User: PropTypes.object, // 이 object 도 shape 로 꼼꼼하게 검사할 수 있다.
    content: PropTypes.string,
    createdAt: PropTypes.string,
    Comments: PropTypes.arrayOf(PropTypes.object), // 객체들의 배열
    Images: PropTypes.arrayOf(PropTypes.object),
    Likers: PropTypes.arrayOf(PropTypes.object),
    RetweetId: PropTypes.number,
    Retweet: PropTypes.objectOf(PropTypes.any),
  }).isRequired,
}

export default PostCard;
