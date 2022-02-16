import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Card, Button, Popover, Avatar, List, Comment } from "antd";
import { RetweetOutlined, HeartOutlined, MessageOutlined, EllipsisOutlined, HeartTwoTone } from "@ant-design/icons";
import CommentForm from "./CommentForm";

import PostImages from "./PostImages";

// antd 기능: Card 컴포넌트 기능 cover
// post 에 Images 가 하나 라도 있다면 이미지 표현

const PostCard = ({ post }) => {
  
  const { me } = useSelector((state) => state.user);
  const id = me && me.id // 만약 id 가 있는 상태(로그인 상태)면 me 와 me.id 가 있음
  // 줄인 문법: me?.id (optional chaining)
  // me 가 me.id 에 접근하기 전,에 me 자신이 undefined 나 null 이 아닌지 검증한다.
  // => me 가 존재하면 me.id 를 id 에 들어가고 그것이 없으면 undefined
  // 한 번에 쓰는 법:
  // const id = useSelector((state) => state.user.me?.id);
  
  const [liked, setLiked] = useState(false);
  const [commentFormOpened, setCommentFormOpened] = useState(false);

  const onToggleLike = useCallback(() => {
    // 토글 기능의 경우
    // 이전 값의 반대 값을 반환
    setLiked((prev) => !prev);
    // 항상 false 는 true 로, true 는 false 로 바뀜
  }, [])

  const onToggleComment = useCallback(() => {
    setCommentFormOpened((prev) => !prev);
  }, [])

  
  return (
    <div style={{ marginBottom: 20 }}>
      {/* post 에 Images 가 하나 라도 있다면 이미지 표현 */}
      <Card
        cover={post.Images[0] && <PostImages images={post.Images} />}
        // 배열 안에 컴포넌트를 넣을 때 반드시 key 를 넣어주어야 한다.
        actions={[
          <RetweetOutlined key="retweet" />,
          liked 
            ? <HeartTwoTone twoToneColor="crimson" key="heart" onClick={onToggleLike} /> 
            : <HeartOutlined key="heart" onClick={onToggleLike}  />,
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
                    <Button type="danger">삭제</Button>
                  </>
                ) : <Button>신고</Button>
              }
            </Button.Group>
          )}>
            <EllipsisOutlined />
          </Popover>,
        ]}
      >
        {/* 그냥 post.User.nickname 의 첫번째 글짜를 아바타로 ex) 구글 프로필에 '조' */} 
        <Card.Meta 
          avatar={<Avatar>{post.User.nickname[0]}</Avatar>}
          title={post.User.nickname}
          description={post.content}
        />

        {/* <Image />
        <Content /> */}
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
    createdAt: PropTypes.object,
    Comments: PropTypes.arrayOf(PropTypes.object), // 객체들의 배열
    Images: PropTypes.arrayOf(PropTypes.object)
  }).isRequired,
}

export default PostCard;
