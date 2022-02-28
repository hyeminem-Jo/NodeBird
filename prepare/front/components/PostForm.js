import React, { useCallback, useEffect, useRef } from "react";
import { Form, Input, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { addPost } from "../reducers/post";
import useInput from "../hooks/useInput";

const PostForm = () => {
  const { imagePaths, addPostDone } = useSelector((state) => state.post);
  const dispatch = useDispatch();
  const [text, onChangeText, setText] = useInput("");
  
  // 서버 요청을 받고 난 후에 여부가 결정나기 때문에 비동기 처리를 위해선 useEffect 를 쓰는 것으로 추측 (signup 에서는 컴포넌트가 처리되기 전에 그 자리에서 if 문이 실시되는 것으로 추측)
  useEffect(() => {
    if (addPostDone) {
      setText('')
    }
  }, [addPostDone])

  const onSubmit = useCallback(() => {
    dispatch(addPost(text));
    // setText(''); //  post 제출 후 input 창 초기화
    // 서버에 요청을 한 후 바로 내용을 삭제를 했는데, 서버 요청이 실패해 버리면 이미 삭제된 내용이 문제가 되어버린다.
  }, [text])

  const imageInput = useRef(); // 실제 돔에 접근
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
