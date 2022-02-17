import React from "react";
import { useRouter } from "next/router";
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Menu, Input, Row, Col } from 'antd';
import styled from 'styled-components'; 
import { useSelector } from 'react-redux';
import { createGlobalStyle } from "styled-components";

import UserProfile from '../components/UserProfile';
import LoginForm from '../components/LoginForm';

const Global = createGlobalStyle`
  .ant-row {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }

  .ant-col:first-child {
    padding-left: 0 !important;
  }

  .ant-col:last-child {
    padding-right: 0 !important;
  }
`

// antd 컴포넌트를 커스텀해서 사용
// styled-component 안에 antd 컴포넌트 태그이름을 넣어서 사용(커스텀)
const SearchInput = styled(Input.Search)`
  vertical-align: middle;
`

const AppLayout = ({ children }) => {
  const router = useRouter() // key 에러

  // 더미 데이터 생성
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  // redux 로 부터 데이터를 불러온다.
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn)
  // 아래처럼 구조분해로 해도 됨 (개인취향)
  // const { isLoggedIn } = useSelector((state) => state.user); 

  return (
    <>
    <Global />
      <Menu mode="horizontal" selectedKeys={[router.pathname]}>
        <Menu.Item key="/">
          <Link href="/"><a>노드버드</a></Link>
        </Menu.Item>

        <Menu.Item key="/profile">
        <Link href="/profile"><a>프로필</a></Link>
        </Menu.Item>

        <Menu.Item>
          {/* antd 의 컴포넌트의 경우 styled-component 에 넣어 커스텀해서 사용 */}
        <SearchInput enterButton />
        </Menu.Item>

        <Menu.Item key="/signup">
        <Link href="/signup"><a>회원가입</a></Link>
        </Menu.Item>
      </Menu>

    <Row gutter={30}>
      <Col xs={24} sm={6}>
        {/* 로그인이 된 상태면 유저의 프로필을, 아니면 로그인창을 띄움 */}
        {isLoggedIn ? <UserProfile /> : <LoginForm />}
        {/* {isLoggedIn ? <UserProfile setIsLoggedIn={setIsLoggedIn} /> : <LoginForm setIsLoggedIn={setIsLoggedIn} />} => 이제 데이터를 넘겨주지 않아도 됨 */}
        {/* LoginForm 컴포넌트로 setIsLoggedIn 넘겨주기 */}
      </Col>

      <Col xs={24} sm={12}>
      {children}
      </Col>

      <Col xs={24} sm={6}>
        <a href="https://www.naver.com/" target="_blank" rel="noreferrer noopener">네이버</a>
        {/* 다른 페이지에서 접근하는 target _blank 는 보안상의 위험이 있기 때문에 rel="noreferrer" 를 적어주어야 한다. */}
      </Col>
    </Row>
    </>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AppLayout;
