// post/[id].js => id 부분이 바뀜 (post/1, post/2, post/3, ...)
import React from 'react';
import { useRouter } from 'next/router';
import axios from "axios";
import { END } from 'redux-saga';
import wrapper from '../../store/configureStore';
import AppLayout from '../../components/AppLayout';
import PostCard from '../../components/PostCard';
import Head from "next/head";

import { LOAD_MY_INFO_REQUEST } from "../../reducers/user";
import { LOAD_POST_REQUEST } from "../../reducers/post";
import { useSelector } from 'react-redux';

const Post = () => {
  const router = useRouter();
  const { id } = router.query;
  // 1번 게시글일 때 router.query.id의 id 가 1번이됨
  const { singlePost } = useSelector((state) => state.post);

  return (
    <AppLayout>
      <Head>
        <title>
          {singlePost.User.nickname} 님의 글
        </title>
        <meta name="description" content={singlePost.content} />
        {/* og: 카톡이나 페북, 트위터 등에 공유하면 미리보기로 뜨는 것 */}
        <meta property='og:title' content={`${singlePost.User.nickname} 님의 게시글`} />
        <meta property='og:description' content={singlePost.content} />
        <meta property='og:image' content={singlePost.Images[0] ? singlePost.Images[0].src : 'https://nodebird.com/favicon.ico'} />
        <meta property='og:url' content={`https://nodebird.com/post/${id}`} />
        {/* favicon 이 안뜨면 강력 새로고침 commend + shft + r 을 해보자 */}
      </Head>
      <PostCard post={singlePost} />
    </AppLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async ({ req, params }) => {
  // 서버쪽에서 실행되면 req 라는 것이 존재한다.
  const cookie = req ? req.headers.cookie : '';
  axios.defaults.headers.Cookie = ''; 
  if (req && cookie) { 
    axios.defaults.headers.Cookie = cookie;
  }
  
  store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  
  // 단일 포스트를 가져오는 액션 생성
  store.dispatch({
    type: LOAD_POST_REQUEST,
    data: params.id, 
    // getServerSideProps 나 getStaticProps 의 안에선 params.id 또는 query.id 하면 useRouter 에 똑같이 접근할 수 있다.
    // 이 부분
    // const router = useRouter();
    // const { id } = router.query;
  });
  
  store.dispatch(END);
  await store.sagaTask.toPromise();
});

export default Post;