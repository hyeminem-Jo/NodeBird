// user.js

export const initialState = {
  isLoggingIn: false, // 로그인 시도 중
  isLoggingOut: false, // 로그아웃 시도 중
  isLoggedIn: false,
  me: null,
  signUpData: {},
  loginData: {},
};

// REQUEST (요청) 액션인 경우, 보통 현재진행형(ing) true 인 상태
// SUCCESS, FAILURE 실패든 성공이든 요청이 끝났으면 false 인 상태

// 로그인 요청하는 action
export const loginRequestAction = (data) => {
  return {
    type: "LOG_IN_REQUEST",
    data, // { id, password }
  };
};

// SUCCESS, FAILURE 액션은 saga 에서 알아서 put 으로 호출해주기 때문에 굳이 생성할 필요가 없다.

// // 로그인 성공하는 action
// export const loginSuccessAction = (data) => {
//   return {
//     type: "LOG_IN_SUCCESS",
//     data, 
//   };
// };
// // 로그인 실패하는 action
// export const loginFailureAction = (data) => {
//   return {
//     type: "LOG_IN_FAILURE",
//     data, 
//   };
// };

// 로그아웃 요청하는 action
export const logoutRequestAction = () => {
  return {
    type: "LOG_OUT_REQUEST",
  };
};

// // 로그아웃 성공하는 action
// export const logoutSuccessAction = () => {
//   return {
//     type: "LOG_OUT_SUCCESS",
//   };
// };

// // 로그아웃 실패하는 action
// export const logoutFailureAction = () => {
//   return {
//     type: "LOG_OUT_FAILURE",
//   };
// };

const reducer = (state = initialState, action) => {
  switch (action.type) {
    // 로그인 액션 처리
    case "LOG_IN_REQUEST":
      console.log('login action - reducer')
      return {
        ...state,
        isLoggingIn: true,
      };
    case "LOG_IN_SUCCESS":
      return {
        ...state,
        isLoggingIn: false,
        isLoggedIn: true,
        me: { ...action.data, nickname: 'jinny' }, // nickname 은 로그인할 때 기입하지 않기 때문에 일단 고정
      };
    case "LOG_IN_FAILURE":
      return {
        ...state,
        isLoggingIn: false,
        isLoggedIn: false, // 바뀌지 않은 false 니까 없어도 되지않나
      };

    // 로그아웃 액션 처리
    case "LOG_OUT_REQUEST":
      return {
        ...state,
        isLoggingOut: true, 
      };

    case "LOG_OUT_SUCCESS":
      return {
        ...state,
        isLoggingOut: false,
        isLoggedIn: false,
        me: null, // 객체 me 말고
      };

    case "LOG_OUT_FAILURE":
      return {
        ...state,
        isLoggingOut: false,
      };
    default:
      return state;
  }
};

export default reducer;
