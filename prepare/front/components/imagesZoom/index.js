// ImagesZoom > index.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Slick from 'react-slick';

import { Overlay, Global, Header, CloseBtn, ImgWrapper, Indicator, SlickWrapper } from './styles';

const ImagesZoom = ({ images, onClose }) => {
  // react-slick
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <Overlay>
      <Global />
      <Header>
        <h1>상세 이미지</h1>
        <CloseBtn onClick={onClose}>X</CloseBtn>
      </Header>
      <SlickWrapper>
        <div>
          {/* react-slick */}
          <Slick
            initialSlide={0} // 이미지 0, 1, 2 순서중 0 번째 부터 하겠다는 뜻
            afterChange={(slide) => setCurrentSlide(slide)} 
            // 0, 1, 2.. 처럼 슬라이드에 번호를 준다.
            // 현재 슬라이드가 몇 인지 state 로 저장해야된다. (useState(0))
            // afterChange: 클릭 후 슬라이드가 넘어간 이후에야 실행
            // beforeChange: 클릭하자마자 (슬라이드가 넘어가기 전에 빨리) 실행
            // 슬라이드 이미지가 완전히 넘어간 후에야 현재 이미지 번호가 뜨는데, 클릭하자마자 페이지 번호가 바뀌길 바란다면 beforeChange 로 바꾸면 된다.
            // beforeChange={(slide, newSlide) => setCurrentSlide(newSlide)} 
            
            infinite // 슬라이드 무한 반복 (끝 => 첫번째)
            // arrows={false} // 화살표 표시 유무
            slidesToShow={1} // 슬라이드를 넘길 때 한 번에 하나씩 보여줌
            slidesToScroll={1} // 슬라이드가 하나씩 넘겨짐
          >
            {images.map((v) => (
              <ImgWrapper key={v.src}>
                <img src={`http://localhost:3065/${v.src}`} alt={v.src} />
              </ImgWrapper>
            ))}
          </Slick>
          {/* 이미지 몇 장 중 몇 번째 페이지인지 알려주는 요소 */}
          <Indicator>
            <div>
              {currentSlide + 1}
              {' '}
              /
              {' '}
              {images.length}
            </div>
          </Indicator>
        </div>
      </SlickWrapper>
    </Overlay>
  );
};

ImagesZoom.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
}

export default ImagesZoom;