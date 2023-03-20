import React, { useCallback, useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import Head from "next/head";
import { Button, Checkbox, Form, Input } from "antd";
import useInput from "../hooks/useInput";
import styled from "styled-components";
import { LOAD_MY_INFO_REQUEST, SIGN_UP_REQUEST } from "../reducers/user";
import { useDispatch, useSelector } from "react-redux";
import Router from "next/router";

import axios from "axios";
import { END } from 'redux-saga';
import wrapper from "../store/configureStore";

const ErrorMessage = styled.div`
  color: red;
`;

const Signup = () => {
  const dispatch = useDispatch();
  const { signUpLoading, signUpDone, signUpError, me } = useSelector((state) => state.user);

  // 로그인이 성공하면 회원가입 페이지에서 메인페이지로 이동
  // 로그인 하면 me 가 생성되기 때문에 me 를 썼지만 logInDone 으로 써도 됨
  useEffect(() => {
    if (me && me.id) {
      Router.replace('/'); 
      // replace(): 현재 페이지(회원가입) 기록이 아예 사라져서 뒤로 가기를 눌러도 이전페이지로 돌아가지 않음
      // push(): push 는 뒤로가기를 누르면 다시 이전페이지로 돌아가버림
    }
  }, [me && me.id]) // me.id 

  // 회원가입 완료되면 메인페이지로 이동하기
  useEffect(() => {
    if (signUpDone) {
      Router.replace('/');
    }
  }, [signUpDone])
  
  // 사용중인 아이디 입력하면 에러나기
  useEffect(() => {
    if (signUpError) {
      alert(signUpError);
    }
  }, [signUpError])
  
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

// 회원가입 페이지 역시 나의 로그인 여부에 따라 화면이 '바뀜' - getServerSideProps 필요
// 내가 로그인 되어있으면 회원가입페이지가 안보이거나 해야함
export const getServerSideProps = wrapper.getServerSideProps((store) => async ({ req }) => {
  // 서버쪽에서 실행되면 req 라는 것이 존재한다.
  console.log('getServerSideProps start');
  console.log(req.headers);
  const cookie = req ? req.headers.cookie : '';
  axios.defaults.headers.Cookie = ''; 
  if (req && cookie) { 
    axios.defaults.headers.Cookie = cookie;
  }
  
  store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  
  store.dispatch(END);
  console.log('getServerSideProps end');
  await store.sagaTask.toPromise();
});

export default Signup;
