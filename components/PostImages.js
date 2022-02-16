import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { PlusOutlined } from '@ant-design/icons';

const PostImages = ({ images }) => {
  const [showImagesZoom, setShowImagesZoom] = useState(false);
  const onZoom = useCallback(() => {
    setShowImagesZoom(true);
  }, []);

  if (images.length === 1) { // 이미지가 하나 일 땐 이미지 비율 100%
    return (
      <>
        <img role="presentation" src={images[0].src} alt={images[0].src} onClick={onZoom} />
        {/* role="presentation" : 시각장애인을 위한 배려() */}
        {/* 스크린리더에서 굳이 클릭할 필요 없는 것일 때 */}
      </>
    );
  }

  if (images.length === 2) { // 이미지가 두 개 일땐 이미지 비율 50 대 50
    return (
      <>
        <img role="presentation" style={{ width: "50%", display: 'inline-block' }} src={images[0].src} alt={images[0].src} onClick={onZoom} />
        <img role="presentation" style={{ width: "50%", display: 'inline-block' }} src={images[1].src} alt={images[1].src} onClick={onZoom} />
        {/* role="presentation" : 시각장애인을 위한 배려() */}
        {/* 스크린리더에서 굳이 클릭할 필요 없는 것일 때 */}
      </>
    );
  }

  // 이미지가 3개 이상일 때: 첫 번째 이미지만 보여주고 그 외 이미지들은 더보기 버튼으로 무조건 확대해서 볼 수 있게 하기
  return (
    <>
      <div>
      <img role="presentation" style={{ width: "50%" }}  src={images[0].src} alt={images[0].src} onClick={onZoom} />
        <div 
          role='presentation'
          style={{ display: 'inline-block', width: '50%', textAlign: 'center', verticalAlign: 'middle' }}  
          onClick={onZoom}
        >
          <PlusOutlined />
          <br />
          { images.length - 1 } 개의 사진 더 보기
        </div>
      </div>
    </>
  )
};

PostImages.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object)
}

export default PostImages;