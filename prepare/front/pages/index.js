import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppLayout from "../components/AppLayout";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import { LOAD_POSTS_REQUEST } from "../reducers/post";

const Home = () => {
  const dispatch = useDispatch();
  const { me } = useSelector((state) => state.user);
  const { mainPosts, hasMorePosts, loadPostsLoading } = useSelector((state) => state.post);

  // 처음 메인 페이지를 불러올 때, 즉 첫 렌더링 때 dummyPost 들이 차게 한다.
  // 첫 렌더링 때만 실행되도록 하는 componentDidMount 를 구현 => [] 를 비워줌
  useEffect(() => {
    dispatch({
      type: LOAD_POSTS_REQUEST,
    });
  }, []);

  // 처음 렌더링 시 10개 더미포스터가 나오고, 스크롤이 끝에 닿으면 다시 10개 포스터가 로딩되어 생성되게끔
  // 스크롤이 끝까지 내려갔을 때 다시 로딩되어 나오게 하기
  // 너무 끝으로 설정하면 로딩되는 걸 기다려야하기 때문에 끝에 닿기 전 300px 지점에서 미리 로딩이 되게끔 한다.
  useEffect(() => {
    // 현재 어느 스크롤 위치에 있는지 판단
    function onScroll() {
      if (
        window.scrollY + document.documentElement.clientHeight >
        document.documentElement.scrollHeight - 300
      ) {
        if (hasMorePosts && !loadPostsLoading) { 
          // 로딩이 되고 있을 동안 loadPostsLoading 은 true 이므로 해당 코드 실행되지 x
          // 로딩이 끝나고 나서 loadPostsLoading 가 false 가 되면 그때 실행
          dispatch({
            type: LOAD_POSTS_REQUEST, // 스크롤 다 내리면 다음 더미데이터 로딩해라
          })
        }
      }
    }
    window.addEventListener("scroll", onScroll);
    // 중요! window 에서 addEventListener 할 때 cleanup 에서 이벤트 제거를 무조건 해주어야 한다. (메모리 누수)
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [hasMorePosts, loadPostsLoading]);

  return (
    <AppLayout>
      {me && <PostForm />}{" "}
      {/* 로그인이 된 상태에서만 포스트를 작성할 수 있음 */}
      {mainPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </AppLayout>
    // useSelector로 개별 포스트를 바로 가져올 수 있다면 PostCard 내부에서 해도 되지만 그럴 수 없기 때문에 props로 넘김 (post={post})
  );
};

export default Home;

// index 를 key 로 쓰면 안된다. key 에 고유한 값이 들어가도록 id 를 미리 만들어놓음
// 게시글이 지워질 가능성이 있는 경우, 반복되는 것들이 지워질 가능성이 있는 경우, 순서가 달라지거나  중간에 추가될 때도 index 를 key 로 쓰면 안됨

// window.scrollY, // 스크롤 얼마나 내렸는지
// document.documentElement.clientHeight, // 화면 보이는 길이
// document.documentElement.scrollHeight // 스크롤 총 길이