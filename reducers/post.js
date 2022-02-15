// post.js

export const initialState = {
  mainPosts: [],
}

// [이전 state] 와 [action]을 받아 다음 state 를 돌려줌
const reducer = (state = initialState, action) => {
  switch (action.type) {

    default :
    return state;
  }
}

export default reducer;