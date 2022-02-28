import React, { useCallback, useState } from "react";
import AppLayout from "../components/AppLayout";
import Head from "next/head";
import { Button, Checkbox, Form, Input } from "antd";
import useInput from "../hooks/useInput";
import styled from "styled-components";
import { SIGN_UP_REQUEST } from "../reducers/user";
import { useDispatch, useSelector } from "react-redux";

const ErrorMessage = styled.div`
  color: red;
`;

const Signup = () => {
  const dispatch = useDispatch();
  const { signUpLoading } = useSelector((state) => state.user);
  
  // 커스텀 훅으로 중복 제거
  // => 다음과 같이 훅들이 중복되면 커스텀 훅으로 간단하게 사용할 수 있다.
  const [email, onChangeEmail] = useInput("");
  const [nickname, onChangeNickname] = useInput("");
  const [password, onChangePassword] = useInput("");

  // passwordCheck 는 useCallback 에서 다른 부분이 있기 때문에 커스텀 훅 x
  const [passwordCheck, setPasswordCheck] = useState("");
  // '비밀번호'가 '비밀번호 확인'과 일치하는지 체크
  const [passwordError, setPasswordError] = useState(false);
  const onChangePasswordCheck = useCallback(
    (e) => {
      setPasswordCheck(e.target.value); // 이것 하나만 있었다면 커스텀 훅으로 묶음
      setPasswordError(e.target.value !== password); // 비밀번호 비교
    },
    [password]
  );

  // setTerm 역시 다른 부분이 있기 때문에 커스텀 훅 x
  // 약관에 체크안한 상태로 제출버튼 누르면 termError 실행
  const [term, setTerm] = useState("");
  const [termError, setTermError] = useState(false);
  const onChangeTerm = useCallback((e) => {
    setTerm(e.target.checked);
    setTermError(false);
  }, []);

  // 제출 버튼 누를시 에러 한 번더 체크
  // 사용자로부터 받는 input 은 여러 번 체크할 필요성이 있다 
  // onFinish: e.preventDefault() 필요 x
  const onSubmit = useCallback(() => {
    if (password !== passwordCheck) {
      return setPasswordError(true);
    }
    if (!term) {
      return setTermError(true);
    }
    console.log(email, nickname, password);
    dispatch({
      type: SIGN_UP_REQUEST,
      data: { email, nickname, password },
    })
  }, [email, password, passwordCheck, term]);

  return (
    <AppLayout>
      <Head>
        <title>회원 가입 | NodeBird</title>
      </Head>
      <Form onFinish={onSubmit}>
        <div>
          <label htmlFor="user-email">이메일</label>
          <br />
          <Input name="uset-email" type="email" value={email} required onChange={onChangeEmail} />
        </div>
        <div>
          <label htmlFor="user-nick">닉네임</label>
          <br />
          <Input
            name="user-nick"
            value={nickname}
            required
            onChange={onChangeNickname}
          />
        </div>
        <div>
          <label htmlFor="user-password">비밀번호</label>
          <br />
          <Input
            name="user-password"
            type="password"
            value={password}
            required
            onChange={onChangePassword}
          />
        </div>
        <div>
          <label htmlFor="user-password-check">비밀번호 체크</label>
          <br />
          <Input
            name="user-password-check"
            type="password"
            required
            onChange={onChangePasswordCheck}
          />
          {/* passwordError 부분이 true 가 되면 에러 표시 */}
          {passwordError && (
            <ErrorMessage style={{ color: "red" }}>
              * 비밀번호가 일치하지 않습니다.
            </ErrorMessage>
          )}
        </div>
        {/* 약관동의 체크박스 */}
        <div>
          <Checkbox name="user-term" checked={term} onChange={onChangeTerm}>
            제로초 말을 잘 들을 것을 동의합니다.
          </Checkbox>
          {termError && <ErrorMessage>약관에 동의하셔야 합니다.</ErrorMessage>}
        </div>
        {/* 제출 버튼 (primary => 파란색 버튼) */}
        <div style={{ marginTop: 10 }}>
          <Button type="primary" htmlType="submit" loading={signUpLoading}>가입하기</Button>
          {/* htmlFor="submit" 인 상태의 버튼을 누르면 Form 의 onFinish 발동 */}
        </div>
      </Form>
    </AppLayout>
  );
};

export default Signup;
