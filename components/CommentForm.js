import { Form, Input, Button } from 'antd';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import useInput from '../hooks/useInput';

const CommentForm = ({ post }) => {
  // 내가 로그인을 하지 않는다면 me 는 null, 없는 상태이기 때문에 
  // 항상 null 이나 undefined 인지 체크해준다.
  const id = useSelector((state) => state.user.me?.id)
  const [commentText, onChangeCommentText] = useInput('');
  const onSubmit = useCallback(() => {
    console.log(post.id, commentText)
  }, [commentText])
  return (
    <Form onFinish={onSubmit} style={{ position: 'relative', margin: '0' }}>
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