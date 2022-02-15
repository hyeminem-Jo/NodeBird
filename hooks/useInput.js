import { useState, useCallback } from "react"

export default (initialValue = null) => {
  const [value, setValue] = useState(initialValue);
  const handler = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  // useState 뿐만 아닌, useCallback 에 대한 값까지 두 개의 값이 합쳐져서 return
  // 원래 useState 는 value 와 setValue 를 return 하지만, 여기선 useState, useCallback 을 합쳤기 때문에 return 두번째 자리에 setValue 대신 handler 을 return (handler 안에서 setValue() 값을 다루기 때문에 가능)
  return [value, handler];
}