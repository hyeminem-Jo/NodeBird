import React, { useCallback, useState } from "react";
import AppLayout from "../components/AppLayout";
import Head from "next/head";
import { Form, Input } from "antd";
import useInput from "../hooks/useInput";
import styled from 'styled-components';

const ErrorMessage = styled.div`
  color: red;
`

const Signup = () => {

  const [id, onChangeId] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, onChangePassword] = useInput('');

  // 이 부분은 useCallback 에서 다른 부분이 있기 때문에 커스텀 훅으로 합치지 x
  const [passwordCheck, setPasswordCheck] = useState('');
  // 비밀번호가 맞는지 체크
  const [passwordError, setPasswordError] = useState(false);
  const onChangePasswordCheck = useCallback((e) => {
    setPasswordCheck(e.target.value);
    setPasswordError(e.target.value !== password) // 비밀번호 비교
  }, [password])

  // onFinish: e.preventDefault() 필요 x
  const onSubmit = useCallback(() => {}, []);

  return (
    <AppLayout>
      <Head>
        <title>회원 가입 | NodeBird</title>
      </Head>
      <Form onFinish={onSubmit}>
        <div>
          <label htmlFor="user-id">아이디</label>
          <br />
          <Input name="uset-id" value={id} required onChange={onChangeId} />
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
          {passwordError && <ErrorMessage style={{color: 'red'}}>* 비밀번호가 일치하지 않습니다.</ErrorMessage>}
        </div>
      </Form>
    </AppLayout>
  );
};

export default Signup;
