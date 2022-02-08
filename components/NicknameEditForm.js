import { Form, Input } from "antd";
import React, { useMemo } from "react";

const NicknameEditForm = () => {
  const style = useMemo(() => ({ marginBottom: "20px", border: '1px solid #d9d9d9', padding: "30px" }));

  return (
    <Form style={style}>
      {/* addonBefore 등 props 들은 모두 antd 공식 문서 참고 */}
      <Input.Search addonBefore="닉네임" enterButton="수정" />
    </Form>
  );
};

export default NicknameEditForm;
