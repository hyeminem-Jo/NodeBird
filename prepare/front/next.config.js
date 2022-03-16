// next.config.js 는 next 나 next build 명령어를 칠 때 실행된다.

// compression-webpack-plugin : 압축된 파일을 만들어줌
// ** compression-webpack-plugin 은 내장돼서 이제 더 이상 이렇게 설치할 필요 없게됨

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
// bundle-analyzer 는 ANALYZE 라는 환경변수가 true 여야 실행됨
// process.env 설정 방법 => 방법(1): dotenv 사용
// 방법(2): next.config.js 는 next 나 next build 명령어를 칠 때 실행되며, 해당 명령어를 쳤을 때 process.env 를 설정(ANALYZE, NODE_ENV 설정)하고 싶다면 package.json 에서 설정해준다.
// => "build": "ANALYZE=true NODE_ENV=production next build" 
// 하지만 위의 방법(2) 는 맥이나 리눅스에서만 되고 윈도우에서는 안된다.
// 그러므로 cross-env 를 설치하여 사용해준다.

module.exports = withBundleAnalyzer ({
  compress: true, // compression 플러그인 대체
  webpack(config, { webpack }) {
    const prod = process.env.NODE_ENV === 'production';
    return {
      ...config, // 불변성을 지켜주면서 config 를 변경해주어야 함
      // immer 를 사용해도됨 => 리듀서 뿐만 아니라 불변성을 지키는 상황에선 모두 써도됨
      mode: prod ? 'production' : 'development', // 배포 / 개발
      devtool: prod ? 'hidden-source-map' : 'eval',
      // 배포: hidden-source-map 을 하지 않으면 배포환경에서 소스코드가 전부 노출되어 버림
      // 개발: 개발할 땐 빠르게 eval 사용
      plugins: [
        ...config.plugins,
        // moment 의 용량이 너무 많아 한국어 외의 언어 제외 
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /^\.\/ko$/),
      ],
    };
  },
})

// 웹팩은 이미 next 에 기본 설정이 있기 때문에 다른 리액트 같은 곳에서 따로 웹팩을 설정하듯 하는 것이 아니라 config 를 통해서 기본 설정을 바꿔주는 식으로 해야한다.