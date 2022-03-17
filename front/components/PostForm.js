import React, { useCallback, useEffect, useRef } from "react";
import { Form, Input, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { UPLOAD_IMAGES_REQUEST, REMOVE_IMAGE, ADD_POST_REQUEST } from "../reducers/post";
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
    // setText(''); //  post 제출 후 input 창 초기화
    // 서버에 요청을 한 후 바로 내용을 삭제를 했는데, 서버 요청이 실패해 버리면 이미 삭제된 내용이 문제가 되어버린다.
  }, [addPostDone])

  // 콜백같은 hooks 를 쓰면 action creater 보단 여기서 액션 객체를 직접 만들어주는게 편함
  const onSubmit = useCallback(() => {
    if (!text || !text.trim()) { // 공백인 상태일 때 (띄어쓰기 포함)
      return alert('게시글을 작성하세요.');
    }
    const formData = new FormData();
    // form 데이터에 이미지 삽입
    imagePaths.forEach((p) => { // p: 이미지 경로 이름
      formData.append('image', p); // 미리보기로 올려진 이미지의 경로 
    })
    // form 데이터에 컨텐츠(내용) 삽입
    formData.append('content', text);
    // return 은 함수의 어떤 곳에서도 위치할 수 있는데, return 이 실행되는 즉시 그 함수는 무조건 실행이 종료됩니다. => 즉, 현재의 함수에서 빠져 나가라는 의미
    return dispatch({
      type: ADD_POST_REQUEST,
      data: formData, // form 데이터 전달
    });
  }, [text, imagePaths])

  // 항상 백과 프론트 사이에서 데이터를 주고 받을 땐 key 를 잘봐야 함
  // key 가 'image', 'content' 등일 땐 req.body.image, req.body.content 가 된다.
  // multer 역시 파일인 경우 req.file(single) 혹은 req.files(array) 가 되고 그 외 이미지나 파일이 아닌, 텍스트(content, image(이미지 경로 이름)) 일 경우 req.body 에 넣어준다. (req.body.image, req.body.content)

  // 굳이 image 가 없다면 formData 에 담아 보낼 필요없이 json 형태로 보내도 됨
  // dispatch({
  //   type: ADD_POST_REQUEST,
  //   data: {
  //     imagePaths,
  //     content: text,
  //   }
  // })


  const onChangeImages = useCallback((e) => {
    console.log('images', e.target.files); 
    // e.target.files: 우리가 선택한 이미지에 대한 정보가 담김
    const imageFormData = new FormData(); 
    // 위의 정보를 FormData() 로 하면 multipart 형식으로 서버로 보낼 수 있음 
    // 무조건 multipart 형식으로 보내야 multer 가 실행됨

    // e.target.files 가 배열이 아니기 때문에(유사배열, forEach() 메서드가 없음) 
    // 배열의 forEach() 메서드를 빌려씀
    [].forEach.call(e.target.files, (f) => { // 이미지 요소(f)를 반복문 돌려서 값으로 넣음
      imageFormData.append('image', f); // key, value(값)
      // 이미지의 key 를 넣는다. 
      // post 라우터에서 upload.array('image')의 'image' 가 key 값
    });
    dispatch({
      type: UPLOAD_IMAGES_REQUEST,
      data: imageFormData,
    })
  }, []);

  // 이미지 업로드  
  const imageInput = useRef(); // 실제 돔에 접근
  const onClickImageUpload = useCallback(() => {
    imageInput.current.click();
  }, [imageInput.current])

  // 업로드 전 이미지 제거 => 비동기
  const onRemoveImage = useCallback((index) => () => {
    dispatch({
      type: REMOVE_IMAGE,
      data: index,
    })
  });

  return (
    <Form
      style={{ margin: "10px 0 20px" }}
      encType="multipart/form-data"
      // 보통 파일이나 이미지, 동영상은 multipart 로 데이터가 올라감
      // 백엔드에서는 multipart 데이터를 못받음 (현재 일반 form 으로만 받게 설정)
      // => app.js 에서 확인
      // 백엔드에서 multipart 데이터를 받으려면 multer 라는 미들웨어가 필요
      // npm i multer 설치
      onFinish={onSubmit}
    >
      <Input.TextArea
        value={text}
        onChange={onChangeText}
        maxLength={140}
        placeholder="어떤 신기한 일이 있었나요?"
      />
      
      <div>
        {/* image input 에 올라간 이미지가 post images 라우터로 전달됨 */}
        <input type="file" name="image" multiple hidden ref={imageInput} onChange={onChangeImages} />
        {/* onChange: 이미지 업로드 창이 뜨고 이미지를 선택 후 확인을 누르면 실행 */}
        {/* <input type="file" name="image2" multiple hidden ref={imageInput} /> */}
        {/* 하나 이상의 input 을 통해 라우터로 갈 때, fills('image') */}
        <Button onClick={onClickImageUpload}>이미지 업로드</Button>
        {/* 제출 버튼 */}
        <Button type="primary" style={{ float: 'right' }} htmlType="submit">짹짹</Button>
      </div>

      <div>
        {/* 이미지가 업로드되면 그 이미지들의 경로가 imagePaths 에 저장되는데, 반복문을 돌려 그것을 표시해줌 */}
        {imagePaths.map((v, i) => (
          <div key={v} style={{ display: 'inline-block' }}>
            {/* 이미지가 잘 안뜨고 있는데 그 이유는, 현재 경로가 3060 이고 백엔드 서버는 3065 이기 때문이다.1. 이미지이름 + 3060(주소) ⇒ 이미지 이름 + 3065(주소) 로 바꿔줘야 한다. 
            2. uploads 폴더를 프론트에 제공할 수 있도록 설정해줘야 한다. => app.js  */}
            <img src={`http://localhost:3065/${v}`} style={{ width: '200px' }} alt={v} />
            <div>
              <Button onClick={onRemoveImage(i)}>제거</Button> 
              {/* index 넣어주기 (고차함수) */}
              {/* map 안에 콜백함수를 넣고 싶을 때 데이터를 넣어줌(고차함수) */}
            </div>
          </div>
        ))}
      </div>
    </Form>
  );
};

export default PostForm;
