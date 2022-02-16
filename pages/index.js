import React from "react";
import { useSelector } from "react-redux";
import AppLayout from "../components/AppLayout";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";

const Home = () => {
  const { isLoggedIn } = useSelector((state) => state.user);
  const { mainPosts } = useSelector((state) => state.post)
  return (
    <AppLayout>
      {/* 로그인이 된 상태에서만 포스트를 작성할 수 있음 */}
      {isLoggedIn && <PostForm />} 
      {/* index 를 key 로 쓰면 안된다. key 에 고유한 값이 들어가도록 id 를 미리 만들어놓음 */}
      {/* 게시글이 지워질 가능성이 있는 경우, 반복되는 것들이 지워질 가능성이 있는 경우, 순서가 달라지거나  중간에 추가될 때도 index 를 key 로 쓰면 안됨 */}
      {mainPosts.map((post) => <PostCard key={post.id} post={post} />)}
    </AppLayout>
      // useSelector로 개별 포스트를 바로 가져올 수 있다면 PostCard 내부에서 해도 되지만 그럴 수 없기 때문에 props로 넘김 (post={post})
  );
};

export default Home;
