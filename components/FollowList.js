import React from "react";
import { List, Button, Card } from "antd";
import { StopOutlined } from "@ant-design/icons";
import Proptypes from "prop-types";

const FollowList = ({ header, data }) => {
  return (
    <>
    {/* 다음과 같이 객체로 적어놓은 것들을 리렌더링을 일으키기 때문에 모두 최적화 해야한다. */}
      <List
        style={{ marginBottom: "20px" }}
        grid={{ gutter: 4, xs: 2, md: 3 }}
        size="small"
        header={<div>{header}</div>}
        loadMore={
          <div style={{ textAlign: "center", margin: "10px 0" }}>
            <Button>더 보기</Button>
          </div>
        }
        bordered
        dataSource={data}
        renderItem={(item) => (
          <List.Item style={{ marginTop: "20px" }}>
            <Card actions={[<StopOutlined key="stop" />]}>
              <Card.Meta description={item.nickname} />
            </Card>
          </List.Item>
        )}
      />
      
    </>
  );
};

FollowList.propTypes = {
  header: Proptypes.string.isRequired,
  data: Proptypes.array.isRequired,
};

export default FollowList;
