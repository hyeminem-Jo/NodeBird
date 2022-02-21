import React, { useCallback } from "react";
import { Form, Input, Button } from "antd";
import Link from "next/link";
import styled from "styled-components";
import useInput from "../hooks/useInput";

import { useDispatch, useSelector } from "react-redux";
import { loginRequestAction } from "../reducers/user";

const ButtonWrapper = styled.div`
  margin-top: 10px;
`;

const FormWrapper = styled(Form)`
  padding: 12px;
`;

const LoginForm = () => {
  const dispatch = useDispatch();

  const { logInLoading } = useSelector((state) => state.user);

  // 커스텀 훅으로 중복 제거 후
  const [email, onChangeEmail] = useInput("");
  const [password, onChangePassword] = useInput("");

  // antd 컴포넌트 에서는 e.preventDefault() 사용 x (onFinish 에 이미 적용되어있음)
  const onSubmitForm = useCallback(() => {
    // e.preventDefault(); x => antd 의 Form 태그의 onFinish 가 자동으로 수행
    console.log(email, password);
    dispatch(loginRequestAction({ email, password }));
  }, [email, password]);

  return (
    <FormWrapper onFinish={onSubmitForm}>
      <div>
        {/* label: input의 이름을 적는 태그로 htmlFor에 input의 아이디나 네임을 적어 인풋과 연결함 */}
        <label htmlFor="user-email">이메일</label>
        <br />
        <Input name="user-email" type="email" value={email} onChange={onChangeEmail} required></Input>
      </div>
      <div>
        <label htmlFor="user-password">비밀번호</label>
        <br />
        <Input
          name="user-password"
          type="password"
          value={password}
          onChange={onChangePassword}
          required
        ></Input>
      </div>

      <ButtonWrapper>
        <Button type="primary" htmlType="submit" loading={logInLoading}>
          {/* primary 는 메인 컬러를 담당 */}
          로그인
        </Button>
        <Link href="/signup">
          <a>
            <Button>회원가입</Button>
          </a>
        </Link>{" "}
        {/* href 는 a 가 아닌 Link 에 넣는 것이 좋음 */}
      </ButtonWrapper>
    </FormWrapper>
  );
};

export default LoginForm;
