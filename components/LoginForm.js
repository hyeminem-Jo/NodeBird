import React, { useState } from "react";
import { Form } from "antd";

// 리액트 form 은 따로 라이브러리를 써보는 것이 좋다.

const LoginForm = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Form>
      <div>
        <label htmlFor="user-id">아이디</label>
        <br />
        <input name="user-id" value={id} onChange={onChangeId} required></input>
      </div>
      <div>
        <label htmlFor="user-password">비밀번호</label>
        <input
          name="user-password"
          type="password"
          value={password}
          onChange={onChangePassword}
          required
        ></input>
      </div>
      <div></div>
      <div></div>
    </Form>
  );
};

export default LoginForm;
