import {
  WrapperHeaderText,
  WrapperActionRow,
  WrapperFilterRow,
  WrapperFilterCol,
  WrapperActionCol,
} from "../../StylePage/indexHead";
import DropdownComponent from "../../../../components/DropdownComponent/DropdownComponent";
import ButtonComponent from "../../../../components/ButtonComponent/ButtonComponent";
import { FileExcelOutlined } from "@ant-design/icons";
import DropdownSortComponent from "../../../../components/DropdownComponent/DropdownSortComponent";
import DatePickerComponent from "../../../../components/DatePickerComponent/DatePickerComponent";
import "../../StylePage/styleHead.css";
import InputComponent from "../../../../components/InputComponent/InputComponent";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchValue } from "../../../../redux/slides/searchSlice";
import { setDateRange } from "../../../../redux/slides/dateRangeSlice";
import { useNavigate} from 'react-router-dom'

const HeadOrderPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchValue = useSelector((state) => state.search.value);
  const dateRange = useSelector((state) => state.dateRange);

  const handleInputChange = useCallback((value) => {
    dispatch(setSearchValue(value));
  }, [dispatch]);

  const handleDateRangeChange = useCallback(
    (dates) => {
      dispatch(
        setDateRange({
          startDate: dates[0]?.format("DD-MM-YYYY"),
          endDate: dates[1]?.format("DD-MM-YYYY"),
        })
      );
    },
    [dispatch]
  );

  return (
    <>
      <div style={{ marginTop: "90px" }}></div>
      <WrapperHeaderText span={24}>Quản lý đơn hàng</WrapperHeaderText>

      <WrapperActionRow
        style={{
          marginLeft: "24px",
          marginTop: "-14px",
          marginBottom: "-4px",
          display: "flex",
          justifyContent: "left",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "700",
            marginBottom: "4px",
            marginLeft: "4px",
            width: "100%",
          }}
        >
          Phân loại:
        </div>
        <WrapperActionCol xl={6} lg={8} md={12} sm={14} xs={24}>
          <DropdownComponent></DropdownComponent>
        </WrapperActionCol>

        <WrapperActionCol xl={4} lg={5} md={8} sm={9} xs={16}>
          <ButtonComponent
            size="large"
            textButton="Thêm đơn hàng"
            onClick={() => navigate('/order/add')}
            styleButton={{
              backgroundColor: "#3cbe5d",
              width: "120px",
              // marginLeft: "-10px",
            }} // Prop styleButton
            styleButtonText={{ color: "#fff" }}
          >
            <FileExcelOutlined />
          </ButtonComponent>
        </WrapperActionCol>

        <WrapperActionCol xl={12} lg={4} md={2} sm={1} xs={8}>
          <ButtonComponent
            size="large"
            textButton="Xuất Excel"
            styleButton={{
              backgroundColor: "#3cbe5d",
              width: "120px",
              marginLeft: "-20px",
            }} // Prop styleButton
            styleButtonText={{ color: "#fff" }} // Prop styleButtonText
          >
            <FileExcelOutlined />
          </ButtonComponent>
        </WrapperActionCol>
      </WrapperActionRow>

      <WrapperFilterRow
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "700",
            marginLeft: "4px",
            marginBottom: "2px",
            width: "100%",
          }}
        >
          Tìm kiếm theo:
        </div>
        <WrapperFilterCol xl={6} lg={8} md={24} sm={24} xs={24}>
          <DropdownSortComponent />
        </WrapperFilterCol>

        <WrapperFilterCol
          className="ButtonInputSearch"
          style={{ marginTop: "-2px" }}
          xl={7}
          lg={8}
          md={12}
          sm={14}
          xs={24}
        >
          <InputComponent
            // style={{marginLeft: "-10px"}}
            size="large"
            placeholder="Tìm kiếm"
            textButton="Enter"
            bordered={true}
            onChange={handleInputChange}
            value={searchValue}
          ></InputComponent>
        </WrapperFilterCol>

        <WrapperFilterCol
          className="filter-col-responsive"
          xl={10}
          lg={9}
          md={12}
          sm={14}
          xs={24}
        >
          <DatePickerComponent
            title="time"
            onChange={handleDateRangeChange}
            value={[dateRange.startDate, dateRange.endDate]}
          />
        </WrapperFilterCol>
      </WrapperFilterRow>
    </>
  );
};
export default HeadOrderPage;
