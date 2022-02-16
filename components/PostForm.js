import React, { useCallback, useRef, useState } from "react";
import { Form, Input, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { addPost } from "../reducers/post";

const PostForm = () => {
  const { imagePaths } = useSelector((state) => state.post);
  const dispatch = useDispatch();
  const imageInput = useRef(); // 실제 돔에 접근
  const [text, setText] = useState("");

  const onChangeText = useCallback((e) => {
    setText(e.target.value)
  }, [])

  const onSubmit = useCallback(() => {
    dispatch(addPost);
    setText(''); //  post 제출 후 input 창 초기화
  }, [])

  const onClickImageUpload = useCallback(() => {
    imageInput.current.click();
  }, [imageInput.current])

  return (
    <Form
      style={{ margin: "10px 0 20px" }}
      encType="multipart/form-data"
      onFinish={onSubmit}
    >
      <Input.TextArea
        value={text}
        onChange={onChangeText}
        maxLength={140}
        placeholder="어떤 신기한 일이 있었나요?"
      />
      
      <div>
        <input type="file" multiple hidden ref={imageInput} />
        <Button onClick={onClickImageUpload}>이미지 업로드</Button>
        {/* 제출 버튼 */}
        <Button type="primary" style={{ float: 'right' }} htmlType="submit">짹짹</Button>
      </div>

      <div>
        {/* 이미지가 업로드되면 그 이미지들의 경로가 imagePaths 에 저장되는데, 반복문을 돌려 그것을 표시해줌 */}
        {imagePaths.map((v) => (
          <div key={v} style={{ display: 'inline-block' }}>
            <img src={v} style={{ width: '200px' }} alt={v} />
            <div>
              <Button>제거</Button>
            </div>
          </div>
        ))}
      </div>
    </Form>
  );
};

export default PostForm;
