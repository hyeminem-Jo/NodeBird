// _app.js 에서 모든 페이지들의 공통페이지를 만듦
// _app.js 의 위에 존재하는 것이 _document.js 이다.
// 아직 _document.js 는 훅으로 만드는 법이 없다.
// _app.js 가 document 로 감싸지면서 최상위에 위치한 html, head 등을 바꿀 수 있다.

// 다음의 코드는 그냥 styled-component 공식문서에서 이렇게 하라한 것
import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    // getInitialProps 는 _document 에서만 쓰이지만, 조만간 없어질 수도..?
    // 나머지 대부분은 getStaticProps, getServerSideProps 를 사용
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () => originalRenderPage({
        enhanceApp: App => (props) => sheet.collectStyles(<App {...props} />),
        // enhanceApp 으로 원래 app 기능에 document 기능, styled-component 가 서버사이드렌더링 될 수 있도록 해줌
      });
      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } catch (error) {
      console.error(error)
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          {/* 너무 최신 (최신 문법, 객체들) 라이브러리들이라 ie 에선 안먹히기 때문에 다음의 코드를 넣어준다. */}
            {/* <script src="https://polyfill.io/v3/polyfill.min.js?features=default%2Ces2015%2Ces2016%2Ces2017%2Ces2018%2Ces2019" /> */}
          <NextScript />
        </body>
      </Html>
    );
  }
}






// document 의 기본꼴 (document 를 커스터마이징 하려면 첨에 이렇게 만들어야함)
// import React from "react";
// import Document, { Html, Head, Main, NextScript } from "next/document";

// export default class MyDocument extends Document {
//   static async getInitialProps(ctx) {
//     const initialProps = await Document.getInitialProps(ctx);
//     return {
//       ...initialProps,
//     };
//   }

//   render() {
//     return (
//       <Html>
//         <Head />
//         <body>
//           <Main />
//           <NextScript />
//         </body>
//       </Html>
//     );
//   }
// }