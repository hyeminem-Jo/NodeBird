import React from "react";
import { useRouter } from "next/router";
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Menu, Input, Row, Col } from 'antd';

// import UserProfile from '../components/UserProfile';
// import LoginForm from '../components/LoginForm';

const AppLayout = ({ children }) => {
  const router = useRouter() // key 에러

  // 더미 데이터 생성
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
      <Menu mode="horizontal" selectedKeys={[router.pathname]}>
        <Menu.Item key="/">
          <Link href="/"><a>노드버드</a></Link>
        </Menu.Item>

        <Menu.Item key="/profile">
        <Link href="/profile"><a>프로필</a></Link>
        </Menu.Item>

        <Menu.Item>
        <Input.Search enterButton style={{verticalAlign: 'middle'}} />
        </Menu.Item>

        <Menu.Item key="/signup">
        <Link href="/signup"><a>회원가입</a></Link>
        </Menu.Item>
      </Menu>

    <Row gutter={30}>
      <Col xs={24} sm={6}>
        {/* 로그인이 된 상태면 유저의 프로필을, 아니면 로그인창을 띄움 */}
        {/* {isLoggedIn ? <UserProfile /> : <LoginForm />} */}
      </Col>

      <Col xs={24} sm={12}>
      {children}
      </Col>

      <Col xs={24} sm={6}>
        <a href="https://www.naver.com/" target="_blank" rel="noreferrer noopener">네이버</a>
        {/* 다른 페이지에서 접근하는 target _blank 는 보안상의 위험이 있기 때문에 rel="noreferrer" 를 적어주어야 한다. */}
      </Col>
    </Row>
    </div>
  );
};

// props 로 넘기는 것들은 propTypes 로 타입을 검사해주면 좋다.
// children 은 리액트의 노드로, 화면에 그릴 수 있는 모든 것들(return 안의 모든 것)이 node 다.
AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AppLayout;
