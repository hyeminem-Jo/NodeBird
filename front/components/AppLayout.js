import React, { useCallback } from "react";
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Menu, Input, Row, Col } from 'antd';
import styled from 'styled-components'; 
import { useSelector } from 'react-redux';
import { createGlobalStyle } from "styled-components";
import Router, { useRouter } from "next/router"; 
// Router: 프로그래밍적으로 주소를 옮길 땐 라우터를 씀

import UserProfile from '../components/UserProfile';
import LoginForm from '../components/LoginForm';
import useInput from "../hooks/useInput";

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

  const [searchInput, onChangeSearchInput] = useInput('');
  const onSearch = useCallback(() => {
    Router.push(`/hashtag/${searchInput}`);
    // 프로그래밍적으로 주소를 옮길 땐 라우터를 씀
    // 페이지 이동 시 input 으로 검색한 값으로 이동
  }, [searchInput])
  // 타이핑 된 값 searchInput 에 타이핑을 안치면 변화가 없기 때문에 
  // 리렌더링 될 때 해당 함수인 onSearch 가 쓸데없이 실행되지 않음 (타이핑을 계속 치면 계속 렌더링 됨)

  // redux 로 부터 데이터를 불러온다.
  const { me } = useSelector((state) => state.user); 
  // const loginDone = useSelector((state) => state.user.loginDone)

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
          {/* 검색창을 통해 해시태그 검색 */}
        <SearchInput 
          enterButton 
          value={searchInput} 
          onChange={onChangeSearchInput}  // 타이핑 하면 input 에 글이 쳐짐
          onSearch={onSearch} // Enter 를 누르면 실행
        />
        </Menu.Item>

        {/* <Menu.Item key="/signup">
        <Link href="/signup"><a>회원가입</a></Link>
        </Menu.Item> */}
      </Menu>

    <Row gutter={30}>
      <Col xs={24} sm={6}>
        {/* 로그인이 된 상태면 유저의 프로필을, 아니면 로그인창을 띄움 */}
        {me ? <UserProfile /> : <LoginForm />}
        {/* {loginDone ? <UserProfile setIsLoggedIn={setIsLoggedIn} /> : <LoginForm setIsLoggedIn={setIsLoggedIn} />} => 이제 데이터를 넘겨주지 않아도 됨 */}
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
