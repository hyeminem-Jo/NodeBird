import { HYDRATE } from "next-redux-wrapper";

// 리덕스에는 리듀서를 합쳐주는 메서드가 있다.
// combineReducers 가 필요한 이유:
// 객체 등을 합치는 것은 쉬우나 reducer 는 함수이고, 함수를 합치기는 쉽지 않다.
import { combineReducers } from "redux";

import user from "./user";
import post from "./post";

// 3. dispatch 된 action 을 전달 받아 실행
const rootReducer = combineReducers({ // post 리듀서와 user 리듀서를 합쳐줌
  // 리덕스 서버사이드렌더링을 위해 HYDRATE 를 넣어주어야 하며, 
  // 이 HYDRATE 를 위해 index 리듀서를 넣어준다.
  index: (state = {}, action) => {
    switch (action.type) {
      case HYDRATE:
        console.log('HYDRATE', action);
        return { ...state, ...action.payload };

      default:
        return state;
    }
  },
  user,
  post
});

export default rootReducer;
