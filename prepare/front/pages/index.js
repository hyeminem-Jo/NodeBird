import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { END } from 'redux-saga';
import axios from "axios";

import AppLayout from "../components/AppLayout";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import { LOAD_POSTS_REQUEST } from "../reducers/post";
import { LOAD_MY_INFO_REQUEST } from "../reducers/user";
import wrapper from '../store/configureStore'

const Home = () => {
  const dispatch = useDispatch();
  const { me } = useSelector((state) => state.user);
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } = useSelector((state) => state.post);

  // 자신의 게시글을 리트윗하려 할 때
  useEffect(() => {
    if(retweetError) {
      alert(retweetError); // 리렌더링이 계속되면 alert 도 계속뜨는 에러가 발생
      // 리렌더링이 계속 되면서 alert 가 계속 뜸
      // 리렌더링이 8번 뜸 => 게시글도 8번임 => 연관성 o
      // 이유: PostCard 8개에서 모두 useEffect 가 실행되버림 
      // 해결: 해당 useEffect 를 상위 컴포넌트로 옮김 (PostCard.js > pages 의 index.js)
      // 또 다른 해결 방법: dependency[] 에 RetweetId 도 같이 넣어 리트윗 게시글에서만 실행 되도록
    }
  }, [retweetError]);


  // 화면이 로딩된 후에 useEffect 에서 사용자 정보, 게시글 정보가 받아와지는데, 이 useEffect 부분 때문에 문제가 발생한다. 화면이 처음 로딩될 때는 사용자, 게시글 데이터가 없다가 나중에야 불러오니까 그 잠깐 사이에 데이터의 공백때문에 로그아웃, 게시글이 없는 것처럼 보인다.
  // 해결: 그렇다면 처음 화면을 받아올 때부터 먼저 데이터를 불러오면 데이터가 채워진 채로 화면이 그려진다. 그렇게 하려면 이 Home 컴포넌트보다 먼저 실행되는 것이 필요한데, next-redux-wrapper 에서 제공하는 ssr 용 메서드(getServerSideProps, getStaticProps) 를 넣어주면 된다.
  // => LOAD_USER_REQUEST, LOAD_POSTS_REQUEST 를 useEffect 가 아닌 context 로 dispatch 함
  // => 데이터를 채운 다음 화면이 렌더링

  // 동시에 게시글들, 사용자 정보 불러오기
  // 메인 페이지에 접근할 때마다 렌더되어 다음이 실행
  // 처음 메인 페이지를 불러올 때, 즉 첫 렌더링 때 dummyPost 들이 차게 한다.
  // 첫 렌더링 때만 실행되도록 하는 componentDidMount 를 구현 => [] 를 비워줌
  // useEffect(() => {
  //   // 새로고침 시 항상 유저 로그인 정보 유지하기 (첫 렌더링: 새로고침)
  //   dispatch({
  //     type: LOAD_USER_REQUEST,
  //   })
  //   dispatch({
  //     type: LOAD_POSTS_REQUEST,
  //   });
  // }, []);

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
          const lastId = mainPosts[mainPosts.length - 1]?.id // 마지막 게시글 id
          // && 대신 optional chaining 활용 
          // => 게시물이 하나도 없을 경우 undefined.id 에러가 발생할 수 있으므로 ?. 로 방지
          dispatch({
            type: LOAD_POSTS_REQUEST, // 스크롤 다 내리면 다음 더미데이터 로딩해라
            lastId, // 마지막 게시글 id
          })
        }
      }
    }
    window.addEventListener("scroll", onScroll);
    // 중요! window 에서 addEventListener 할 때 cleanup 에서 이벤트 제거를 무조건 해주어야 한다. (메모리 누수)
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [hasMorePosts, loadPostsLoading, mainPosts]);

  return (
    <AppLayout>
      {me && <PostForm />}
      {/* 로그인이 된 상태에서만 포스트를 작성할 수 있음 */}
      {mainPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </AppLayout>
    // useSelector로 개별 포스트를 바로 가져올 수 있다면 PostCard 내부에서 해도 되지만 그럴 수 없기 때문에 props로 넘김 (post={post})
  );
};

// next-redux-wrapper 7버전... 버전마다 상이함 유의
// 위의 화면을 그리는 동작을 먼저 실행하기 전에 서버쪽에서 먼저 실행하게 해줌
// 데이터를 채운 다음 화면에 렌더링 (화면이 렌더될 때 그 데이터가 리덕스에 채워진 상태로 처음부터 존재하게됨)
export const getServerSideProps = wrapper.getServerSideProps(
  // 서버쪽에서 실행되면 context.req 라는 것이 존재한다.
(store) => async ({ req }) => {
    // 이 코드가 있어야 서버까지 쿠키가 전달이 됨 (프론트서버 => 백엔드서버)
    // 원래 이전엔 브라우저에서 서버로 요청을 했고, 브라우저는 쿠키를 자동으로 전달해준다.
    // 하지만 ssr 에서는 서버가 주체이며, 프론트서버에서 백서버로 쿠키를 전달하기 때문에 쿠키를 직접 axios 로 전달해줘야 한다.
    // const cookie = context.req ? context.req.headers.cookie : '';
    const cookie = req ? req.headers.cookie : '';
    axios.defaults.headers.Cookie = '';
    if (req && cookie) {
      axios.defaults.headers.Cookie = cookie;
    }

    store.dispatch({
      type: LOAD_MY_INFO_REQUEST,
    });

    store.dispatch({
      type: LOAD_POSTS_REQUEST,
    });

    // 비동기로 처리하지 않으면 REQUEST 상태에서 SUCCESS 받을 틈이 없이 바로 함수가 끝나버린다.
    // REQUEST 가 saga 에서 SUCCESS 될 때까지 기다려준다
    store.dispatch(END);
    await store.sagaTask.toPromise();
    // configureStore.js 의 store.sagaTask
  }
);
// "NEXT_REDUX_WRAPPER_HYDRATE__": getServerSideProps 에서 dispatch 를 하면 store 에 해당 정보가 들어가 변화가 생기는데, 이 정보들이 담긴 것을 reducer > index.js 에서 HYDRATE 액션이 실행되면서 받는다.
// 리덕스 ssr 원리: @@INIT 에서는 그대로 있지만 getServerSideProps 의 액션이 실행되면 그 실행된 결과를 NEXT_REDUX_WRAPPER_HYDRATE__ 로 보내준다. => redux-devtools 확인
// 문제1: HYDRATE 에서 조차 아직 사용자 정보(me[]) 와 게시물 정보(mainPosts[]) 가 안들어있다. (ssr 하는 의미x)
// 문제2: index 안에 index, user, post 가 들어있다. index 그 자체로 덮어씌워야 하는데... (HYDRATE 가 잘못넣어주고 있음) => 해결: reducers > index.js 의 rootReducer 의 루트를 고쳐줘야함

export default Home;

// index 를 key 로 쓰면 안된다. key 에 고유한 값이 들어가도록 id 를 미리 만들어놓음
// 게시글이 지워질 가능성이 있는 경우, 반복되는 것들이 지워질 가능성이 있는 경우, 순서가 달라지거나  중간에 추가될 때도 index 를 key 로 쓰면 안됨

// window.scrollY, // 스크롤 얼마나 내렸는지
// document.documentElement.clientHeight, // 화면 보이는 길이
// document.documentElement.scrollHeight // 스크롤 총 길이