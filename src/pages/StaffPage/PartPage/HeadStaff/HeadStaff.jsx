import React, { useCallback, useEffect } from "react";
import { Row, Col } from "antd";
import InputComponent from "../../../../components/InputComponent/InputComponent";
import { useDispatch, useSelector } from "react-redux";
import { setSearchValue } from "../../../../redux/slides/searchSlice";
import "../../StylePage/HeadStaff.css";
import { useNavigate } from "react-router-dom";
import DropdownSortComponent from "../../../../components/DropdownComponent/DropdownSortComponent";
import ButtonComponent from "../../../../components/ButtonComponent/ButtonComponent";

const HeadStaff = () => {
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
  }, []);

  return (
    <>
      <div style={{ marginTop: "90px" }}></div>
      <div style={{ marginLeft: "20px" }} className="header-container">
        <div className="green-header">
          <span className="header-title">Quản lý nhân viên</span>
        </div>
      </div>
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
          <DropdownSortComponent defaultLabel="Số ĐT nhân viên" />
        </Col>
        <Col
          xl={6}
          lg={8}
          md={12}
          sm={24}
          xs={24}
          style={{ marginLeft: "-50px" }}
        >
          <InputComponent
            size="large"
            placeholder="Tìm kiếm"
            bordered={true}
            onChange={handleInputChange}
            value={searchValue}
          />
        </Col>
        <Col>
          <ButtonComponent
            size="large"
            textButton="Thêm nhân viên"
            onClick={() => navigate("/staff/add")}
            styleButton={{
              background: "linear-gradient(135deg, #07BF73 0%,#17CF73 50%, #17CF83 100%)",
              width: "120px",
              marginLeft: "70px",
            }} // Prop styleButton
            styleButtonText={{ color: "#fff" }}
          ></ButtonComponent>
        </Col>
      </Row>
    </>
  );
};

export default HeadStaff;
