import styled, { createGlobalStyle } from 'styled-components';
import { CloseOutlined } from '@ant-design/icons';

// position: fixed 인 요소를 화면에 꽉 채우는 방법
export const Overlay = styled.div`
  position: fixed;
  z-index: 5000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`
export const Header = styled.header`
  header: 44px;
  background: white;
  position: relative;
  padding: 0;
  text-align: center;

  & h1 {
    margin: 0;
    font-size: 17px;
    color: #333;
    line-height: 44px;
  }
`

export const CloseBtn = styled(CloseOutlined)`
  position: absolute;
  right: 0;
  top: 0;
  padding: 15px;
  line-height: 12px;
  cursor: pointer;
  font-size: 18px;
`

export const SlickWrapper = styled.div`
  height: calc(100% - 44px);
  background: #090909;
`
export const ImgWrapper = styled.div`
  padding: 32px 0;
  text-align: center;

  & img {
    margin: 0 auto;
    max-height: 750px;
  }
`

export const Indicator = styled.div`
  text-align: center;

  & > div {
    width: 75px;
    height: 30px;
    line-height: 30px;
    border-radius: 15px;
    background: #313131;
    display: inline-block;
    text-align: center;
    color: white;
    font-size: 15px;
  }
`

export const Global = createGlobalStyle`
  .slick-slide {
    display: inline-block;
    position: relative;
  }

  .antd-card-cover {
    transform: none !important;
  }

  .slick-arrow {
    border: none;
    background-color: transparent;
    color: #fff;
    cursor: pointer;
    width: 110px;
    position: absolute;
    font-size: 0;
    height: 50px;
    top: 50%
  }

  .slick-prev {
    z-index: 1000;

    &:after {
      content: "<";
      width: 50%;
      height: 100%;
      position: absolute;
      right: 0;
      top: 0;
      color: #fff;
      font-size: 60px;
      line-height: 50px;
    }
  }

  .slick-next {
    right: 0;

    &:after {
      content: ">";
      width: 50%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      color: #fff;
      font-size: 60px;
      line-height: 50px;
    }
  }
`
