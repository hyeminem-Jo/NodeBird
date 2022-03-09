import React from "react";
import { List, Button, Card } from "antd";
import { StopOutlined } from "@ant-design/icons";
import Proptypes from "prop-types";
import { useDispatch } from "react-redux";
import { REMOVE_FOLLOWER_REQUEST, UNFOLLOW_REQUEST } from "../reducers/user";

const FollowList = ({ header, data }) => {
  const dispatch = useDispatch();

  // 내가 팔로잉하던 사람 언팔하기(팔로잉 제거) & 내 팔로워 차단하기(팔로워 제거)
  // Followings = [ { id, nickname, email }, {}... ]
  // item: { id( = 내가 팔로잉하는 유저 id ), nickname, email } (Followers 의 요소)
  // 버튼을 클릭하면 해당 item(Follow 의 요소의 ) 의 id 를 받아
  const onCancel = (id) => () => {
// const onCancel = useCallback((id) => () => {
    if (header === '팔로잉') { // 팔로잉 제거(언팔)
      dispatch({
        type: UNFOLLOW_REQUEST, 
        data: id, // item 의 id 를 받음 (삭제하려는 팔로잉 id)
      })
    } else {
      dispatch({ // 팔로워 제거(차단)
        type: REMOVE_FOLLOWER_REQUEST,
        data: id,
      })
    }
  }

  // data = me.Followings/Followers
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
        dataSource={data} // me.Followings[]/Followers[]
        renderItem={(item) => ( // me.Followings[ {id: 1} ... ] / Followers[] 요소
          <List.Item style={{ marginTop: "20px" }}>
            <Card actions={[<StopOutlined key="stop" onClick={onCancel(item.id)} />]}>
              {/* onClick 고차함수 : 반복문 안에서 onClick 같은 것이 있으면 그 "반복문에 대한 데이터" 를 onClick 에 넘겨주어야 함 */}
              {/* 반복문 안에 콜백함수를 넣고 싶을 때 데이터를 넣어줌(고차함수) */}
              {/* 고차함수는 받은 데이터를 함수에 넘겨줄 수 있다. => 반복문 안에서 유용하게 쓰인다. */}
              <Card.Meta description={item.nickname} /> 
              {/* 팔로잉, 팔로워 정보: Followers[], Followings[] 는 프로필에서 갯수 표현만 하기 위해 DB 에서 attribute 를 통해 id 만 가지고 왔었는데,  그 팔로잉, 팔로워 리스트에서 유저들의 세부 정보를 표현 */}
              {/* { nickname: 제로초 } */}
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
