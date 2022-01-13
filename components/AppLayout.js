import React from "react";
import { useRouter } from "next/router";
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Menu } from 'antd';

const AppLayout = ({ children }) => {
  const router = useRouter()
  return (
    <div>
      <div>
        <Menu mode="horizontal" selectedKeys={[router.pathname]}>
          <Menu.Item key="/">
            <Link href="/"><a>노드버드</a></Link>
          </Menu.Item>
          <Menu.Item key="/profile">
          <Link href="/profile"><a>프로필</a></Link>
          </Menu.Item>
          <Menu.Item key="/signup">
          <Link href="/signup"><a>회원가입</a></Link>
          </Menu.Item>
        </Menu>
      </div>
      {children}
    </div>
  );
};

// props 로 넘기는 것들은 propTypes 로 타입을 검사해주면 좋다.
// children 은 리액트의 노드로, 화면에 그릴 수 있는 모든 것들(return 안의 모든 것)이 node 다.
AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AppLayout;
