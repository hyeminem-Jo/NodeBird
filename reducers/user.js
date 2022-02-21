// reducers > user.js

export const initialState = {
  logInLoading: false, // 로그인 시도중
  logInDone: false,
  logInError: null,

  logOutLoading: false, // 로그아웃 시도중
  logOutDone: false,
  logOutError: null,

  signUpLoading: false, // 회원가입 시도중
  signUpDone: false,
  signUpError: null,

  me: null,
  signUpData: {},
  loginData: {},
};

// saga 에서도 action 을 써야하기 때문에 export 해주기
export const LOG_IN_REQUEST = "LOG_IN_REQUEST";
export const LOG_IN_SUCCESS = "LOG_IN_SUCCESS";
export const LOG_IN_FAILURE = "LOG_IN_FAILURE";

export const LOG_OUT_REQUEST = "LOG_OUT_REQUEST";
export const LOG_OUT_SUCCESS = "LOG_OUT_SUCCESS";
export const LOG_OUT_FAILURE = "LOG_OUT_FAILURE";

export const SIGN_UP_REQUEST = "SIGN_UP_REQUEST";
export const SIGN_UP_SUCCESS = "SIGN_UP_SUCCESS";
export const SIGN_UP_FAILURE = "SIGN_UP_FAILURE";

export const FOLLOW_REQUEST = "FOLLOW_REQUEST";
export const FOLLOW_SUCCESS = "FOLLOW_SUCCESS";
export const FOLLOW_FAILURE = "FOLLOW_FAILURE";

export const UNFOLLOW_REQUEST = "UNFOLLOW_REQUEST";
export const UNFOLLOW_SUCCESS = "UNFOLLOW_SUCCESS";
export const UNFOLLOW_FAILURE = "UNFOLLOW_FAILURE";

// 가짜 유저 데이터의 id, nickname 을 post.js 의 기존 가짜 게시물 데이터(dummyPost) 의 id 와 nickname 을 같게 해서 수정, 삭제 기능을 테스트해보려는 듯??
const dummyUser = (data) => ({
  ...data,  // { email, password }
  nickname: '제로초',
  id: 1,
  Posts: [],
  Followings: [],
  Followers: [],
})

// 로그인 요청하는 action
export const loginRequestAction = (data) => {
  return {
    type: LOG_IN_REQUEST,
    data, // { email, password }
  };
};

// 로그아웃 요청하는 action
export const logoutRequestAction = () => {
  return {
    type: LOG_OUT_REQUEST,
  };
};

// // 회원가입 요청하는 action
// export const signupRequestAction = (data) => {
//   return {
//     type: SIGN_UP_REQUEST,
//     data, // { email, nickname, password }
//   };
// };

const reducer = (state = initialState, action) => {
  switch (action.type) {
    // 로그인 액션 처리
    case LOG_IN_REQUEST:
      // console.log('login action - reducer')
      return {
        ...state,
        logInLoading: true,
        logInError: null,
        logInDone: false, // 초기화
      };
    case LOG_IN_SUCCESS:
      return {
        ...state,
        logInLoading: false,
        logInDone: true,
        me: dummyUser(action.data),
        // me: { ...action.data, nickname: 'jinny' },
        // me 는 현재 더미데이터이며, action.data 를 받는 함수로 빼자
      };
    case LOG_IN_FAILURE:
      return {
        ...state,
        logInLoading: false,
        logInError: action.error, 
      };

    // 로그아웃 액션 처리
    case LOG_OUT_REQUEST:
      return {
        ...state,
        logOutLoading: true, 
        logOutError: null,
        logOutDone: false, // 초기화
      };

    case LOG_OUT_SUCCESS:
      return {
        ...state,
        logOutLoading: false,
        logOutDone: true,
        me: null, // 객체 me 말고
      };

    case LOG_OUT_FAILURE:
      return {
        ...state,
        logOutLoading: false,
        logOutError: action.error,
      };

    // 회원가입 액션 처리
    case SIGN_UP_REQUEST:
      return {
        ...state,
        signUpLoading: true, 
        signUpError: null,
        signUpDone: false, // 초기화
      };

    case SIGN_UP_SUCCESS:
      return {
        ...state,
        signUpLoading: false,
        signUpDone: true,
      };

    case SIGN_UP_FAILURE:
      return {
        ...state,
        signUpLoading: false,
        signUpError: action.error,
      };
    default:
      return state;
  }
};

export default reducer;


// REQUEST (요청) 액션인 경우, 보통 현재진행형(ing) true 인 상태
// SUCCESS, FAILURE 실패든 성공이든 요청이 끝났으면 false 인 상태

// 요청(시도중), 완료, 실패 의 상태를 state 로 만들 때 변수 명을 직관적으로 이해할 수 있게 지으면 좋다. (ex. isLoggedIn => loginDone) 