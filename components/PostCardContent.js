import React from 'react';
import PropTypes from 'prop-types'
import Link from 'next/link';

const PostCardContent = ({ postData }) => { 
  // 첫 번째 게시글 #해시태그 #익스프레스
  // 위의 문장에서 어떤 부분이 해시태그이고 아닌지를 구분해주어야 한다.
  // 이때 정규표현식을 사용하면 좋다.
  return (
    <div>
      {postData.split(/(#[^\s#]+)/g).map((v, i) => {
        // ['첫 번째 게시글 ', '#해시태그', ' ', '#익스프레스', '']
        if (v.match(/(#[^\s#]+)/g)) {
          // 해시태그 모양인 애들은 Link 태그로 감싸서 반환
          return <Link href={`/hashtag/${v.slice(1)}`} key={i}><a>{v}</a></Link>
          // slice(1): '#해시태그' 에서 '#' 을 뗀 것
          // key={} 에 v 를 못넣는 이유: key 는 고유의 값을 가져야 하는데, 만약 똑같은 해시태그
          // (ex. #해시태그 #해시태그) 를 올릴 경우 key 안의 v 값이 다른 Link 와 겹칠 수 있기 때문이다.
          // 이때 index 를 넣어도 되는 것이, 사용자가 직접 postData 를 바꿀일이 없기 때문이다.
          // index 를 key 로 써도 되는 경우: 우연히 자잘하게 바뀌는 경우가 아닌 의도적으로 데이터를 바꾸는 큰 동작일 때
        }
        return v; // 일반적인 요소들은 그대로 반환, 해시태그 부분만 링크로 감싸서 반환
      })}
      {/* split 에서는 // 사이에 () 를 넣어주어야 한다. */}
    </div>
  );
};

PostCardContent.propTypes = {
  postData: PropTypes.string.isRequired,
}

export default PostCardContent;