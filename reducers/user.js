// user.js

export const initialState = {
  isLoggedIn: false,
  user: null,
  signUpData: {},
  loginData: {},
};

// 로그인 하는 action
export const loginAction = (data) => {
  return {
    type: "LOG_IN",
    data,
  };
};

// 로그아웃 하는 action
export const logoutAction = () => {
  return {
    type: "LOG_OUT",
  };
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOG_IN":
      return {
        ...state,
        isLoggedIn: true,
        user: action.data, // 객체 user 말고
      };
    case "LOG_OUT":
      return {
        ...state,
        isLoggedIn: false,
        user: null, // 객체 user 말고
      };
    default:
      return state;
  }
};

export default reducer;
