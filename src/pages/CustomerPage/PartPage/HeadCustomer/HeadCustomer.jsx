import React, { useCallback, useEffect } from "react";
import { Row, Col } from "antd";
import InputComponent from "../../../../components/InputComponent/InputComponent";
import { useDispatch, useSelector } from "react-redux";
import { setSearchValue } from "../../../../redux/slides/searchSlice";
import "../../StylePage/HeadCustomer.css";
import { useNavigate } from "react-router-dom";
import DropdownSortComponent from "../../../../components/DropdownComponent/DropdownSortComponent";

const HeadCustomer = () => {
  const dispatch = useDispatch();
  const searchValue = useSelector((state) => state.search.value);
  const navigate = useNavigate();

  const handleInputChange = useCallback(
    (value) => {
      dispatch(setSearchValue(value));
    },
    [dispatch]
  );

  useEffect(() => {
    navigate("processing");
  }, [])

  return (
    <>
      <div style={{ marginTop: "90px" }}></div>
      <h1 span={24}>Quản lý người giúp việc</h1>
      <Row style={{ marginTop: "-30px", padding: "20px" }}>
        <Col span={24}>
          <div
            style={{ fontSize: "14px", fontWeight: "700", marginBottom: "8px" }}
          >
            Tìm kiếm theo:
          </div>
        </Col>
        <Col
          xl={6}
          lg={8}
          md={12}
          sm={24}
          xs={24}
          style={{ marginRight: "20px" }}
        >
          <DropdownSortComponent defaultLabel="Số ĐT người giúp việc"/>
        </Col>
        <Col xl={6} lg={8} md={12} sm={24} xs={24}>
          <InputComponent
            size="large"
            placeholder="Tìm kiếm"
            bordered={true}
            onChange={handleInputChange}
            value={searchValue}
          />
        </Col>
      </Row>
    </>
  );
};

export default HeadCustomer;
