import React, { useCallback, useEffect, useState } from "react";
import { Row, Col, Button } from "antd";
import InputComponent from "../../../../components/InputComponent/InputComponent";
import { useDispatch, useSelector } from "react-redux";
import { setSearchValue } from "../../../../redux/slides/searchSlice";
import "../../StylePage/HeadService.css";
import { useNavigate } from "react-router-dom";
import DropdownSortComponent from "../../../../components/DropdownComponent/DropdownSortComponent";
import ButtonComponent from "../../../../components/ButtonComponent/ButtonComponent";
import PopupModalAdd from "./PopupModalAdd/PopupModalAdd"; // Import PopupModalAdd

const HeadService = () => {
  const dispatch = useDispatch();
  const searchValue = useSelector((state) => state.search.value);
  const navigate = useNavigate();

  //State
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);

  const handleInputChange = useCallback(
    (value) => {
      dispatch(setSearchValue(value));
    },
    [dispatch]
  );

  useEffect(() => {
    navigate("processing");
  }, []);

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const hideAddModal = () => {
    setIsAddModalVisible(false);
  };

  const handleAddSuccess = useCallback(() => {
    // After successful adding, notify the parent component to refresh the service list if need
    console.log("The item has been added");
  }, []);

  return (
    <>
      <div style={{ marginTop: "90px" }}></div>
      <div style={{ marginLeft: "20px" }} className="header-container">
        <div className="green-header">
          <span className="header-title">Quản lý dịch vụ</span>
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
          <DropdownSortComponent defaultLabel="Tên dịch vụ" />
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
          {/*<ButtonComponent
            size="large"
            textButton="Thêm dịch vụ"
            onClick={() => navigate("/service/add")}
            styleButton={{
              backgroundColor: "#3cbe5d",
              width: "120px",
              marginLeft: "70px",
            }} // Prop styleButton
            styleButtonText={{ color: "#fff" }}
          ></ButtonComponent>*/}
          <ButtonComponent
            size="large"
            textButton="Thêm dịch vụ"
            onClick={showAddModal}
            styleButton={{
              backgroundColor: "#28B562",
              width: "120px",
              marginLeft: "70px",
            }} 
            styleButtonText={{ color: "#fff", fontSize: "11px" }}
          >
            Thêm dịch vụ
          </ButtonComponent>
        </Col>
      </Row>
      <PopupModalAdd
        isVisible={isAddModalVisible}
        onClose={hideAddModal}
        onAdd={handleAddSuccess}
        setLoading={setLoading}
        setShowNotification={setShowNotification}
      />
    </>
  );
};

export default HeadService;
