import { Form, Input, Button } from 'antd';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useInput from '../hooks/useInput';
import { ADD_COMMENT_REQUEST } from '../reducers/post';

const CommentForm = ({ post }) => {
  const dispatch = useDispatch();
  
  // 내가 로그인을 하지 않는다면 me 는 null, 없는 상태이기 때문에 
  // 항상 null 이나 undefined 인지 체크해준다.
  const id = useSelector((state) => state.user.me?.id)
  const { addCommentDone } = useSelector((state) => state.post)
  const [commentText, onChangeCommentText, setCommentText] = useInput('');

  useEffect(() => {
    if (addCommentDone) {
      setCommentText('');
    }
  }, [addCommentDone])

  const onSubmitComment = useCallback(() => {
    // console.log(post.id, commentText);

    // 동적 action creator 로 만들지, 아니면 다음과 같이 변수를 사용하여 action 을 create 할 것인지 개인의 자유다.
    // 재사용 할때는 동적으로 하는 것이 좋은데, 해당 컴포넌트에서만 쓰이는 거면 그냥 action 객체로 dispatch 해도 된다.
    dispatch({
      type: ADD_COMMENT_REQUEST,
      data: { content: commentText, postId: post.id, userId: id },
    })
  }, [commentText, id]);

  return (
    <Form onFinish={onSubmitComment} style={{ position: 'relative', margin: '0' }}>
      <Form.Item>
        <Input.TextArea value={commentText} onChange={onChangeCommentText} row={4} />
        <Button style={{ position: 'absolute', right: 0, bottom: -40 }} type="primary" htmlType="submit">삐약</Button>
      </Form.Item>
    </Form>
  );
};

CommentForm.propTypes = {
  post: PropTypes.object.isRequired,
}

export default CommentForm;