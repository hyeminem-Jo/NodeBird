// immer 익스플로러에서 작동하게 하기
import { produce, enableES5 } from "immer";

export default (...args) => {
  enableES5();
  return produce(...args);
}