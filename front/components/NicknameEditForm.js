import { Form, Input } from "antd";
import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import useInput from "../hooks/useInput";
import { CHANGE_NICKNAME_REQUEST } from "../reducers/user";

const NicknameEditForm = () => {
  const { me } = useSelector((state) => state.user);
  const [nickname, onChangeNickname] = useInput(me?.nickname || '');
  // 수정하기 전인 원래 닉네임이 placeholder 처럼 초기값으로 지정
  // me?.nickname 이 true 면 me?.nickname 실행, 없으면 '' 실행
  const dispatch = useDispatch();

  const onSubmit = useCallback(() => {
    dispatch({
      type: CHANGE_NICKNAME_REQUEST,
      data: nickname,
    })
  }, [nickname]);

  // 인라인 스타일링을 했을 경우, 앱이 렌더링 될 때 매번 style 객체가 생성되고 생성될 때 객체의 메모리 주소값은 항상 다르기 때문에 변화로 인지하고 불필요하게 리렌더링이 발생
  // 이를 방지하기 위해 useMemo 적용 (렌더링 될 때, style 객체는 요지 부동(렌더링x))
  const style = useMemo(() => ({ marginBottom: "20px", border: '1px solid #d9d9d9', padding: "30px" }), []);

  return (
    <Form style={style}>
      {/* addonBefore 등 props 들은 모두 antd 공식 문서 참고 */}

      {/* 닉네임 수정하는 Form */}
      <Input.Search 
      value={nickname}
      onChange={onChangeNickname}
      addonBefore="닉네임" 
      enterButton="수정" 
      onSearch={onSubmit} // Input.Search 는 antd 문서... 
      // <Form onFinish={onSubmit}> 이 아님
      />
    </Form>
  );
};

export default NicknameEditForm;
