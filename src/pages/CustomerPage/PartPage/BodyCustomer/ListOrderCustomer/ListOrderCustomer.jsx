import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Card, Descriptions, Table, Typography } from "antd";
import "../../../StylePage/styleCustomerDetail.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setDateRange } from "../../../../../redux/slides/dateRangeSlice";
import { WrapperFilterCol } from "../../../../OrderPage/StylePage/indexHead";
import { DatePicker } from "antd";

const { Title } = Typography;

const ListOrderCustomer = () => {
  const location = useLocation();
  const { phone } = location.state || {};
  console.log(phone);
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState();
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();
  const [orderResponseDetail, setOrderResponseDetail] = useState()

  const dispatch = useDispatch();
  const dateRange = useSelector((state) => state.dateRange);

  const handleDateRangeChange = useCallback(
    (dates) => {
      if (dates) {
        dispatch(
          setDateRange({
            startDate: dates[0],
            endDate: dates[1],
          })
        );
      } else {
        dispatch(
          setDateRange({
            startDate: null,
            endDate: null,
          })
        );
      }
    },
    [dispatch]
  );

  

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/customers/requestHistoryList/${phone}`
      );
      console.log("Records:", response.data.records[0]);
      const { data } = response;
      setData(data);

      //   let requestType =
      //     data.request.requestType === "shortTerm" ? "Ngắn hạn" : "Dài hạn";
      //   let statusNow = "";
      //   if (data.request.status === "notDone") {
      //     statusNow = "Chưa tiến hành";
      //   } else if (data.request.status === "assigned") {
      //     statusNow = "Chưa tiến hành (Đã giao việc)";
      //   } else if (data.request.status === "unconfirmed") {
      //     statusNow = "Chờ xác nhận";
      //   } else if (data.request.status === "processing") {
      //     statusNow = "Đang tiến hành";
      //   } else {
      //     statusNow = "Đã hoàn thành";
      //   }

      setOrderData({
        hoTenKhachHang: data.records[0].customerInfo.fullName,
        soDTKhachHang: data.records[0].customerInfo.phone,
        diaChiYeuCau: data.records[0].customerInfo.address,
      });

      const record = data.records[0];
      const orderResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/requests/detail/${record._id}`
      );
      setOrderResponseDetail(orderResponse);
      console.log("orre", orderResponse)
      console.log("cdddsc", orderResponseDetail)
      if (record) {
        setTimeSlots([
          {
            key: record._id,
            ngayDatYeuCau: new Date(record.orderDate).toLocaleDateString(
              "vi-VN",
              {
                weekday: "long",
                year: "numeric",
                month: "numeric",
                day: "numeric",
              }
            ),
            loaiYeuCau: record.requestType,
            diaChi: record.location.district,
            nguoiGiupViec: orderResponse.data.scheduleRequest[0].helperName ,
            trangThai: (() => {
              if (record.status === "notDone") return "Chưa tiến hành";
              else if (record.status === "assigned") return "Đã giao việc";
              else if (record.status === "unconfirmed") return "Chờ xác nhận";
              else if (record.status === "processing") return "Đang tiến hành";
              else if (record.status === "done") return "Đã hoàn thành";
              else if (record.status === "cancelled") return "Đã hủy";
              else return "Không xác định";
            })(),
            tongChiPhi: record.totalCost.toLocaleString("vi-VN") + " đ",
          },
        ]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [phone]);

  const columns = [
    {
      title: "Ngày đặt yêu cầu",
      dataIndex: "ngayDatYeuCau",
      key: "ngayDatYeuCau",
      width: 150,
    },
    {
      title: "Loại yêu cầu",
      dataIndex: "loaiYeuCau",
      key: "loaiYeuCau",
      width: 150,
    },
    {
      title: "Địa chỉ",
      dataIndex: "diaChi",
      key: "diaChi",
      width: 190,
    },
    {
      title: "Người Giúp Việc",
      dataIndex: "nguoiGiupViec",
      key: "nguoiGiupViec",
      width: 160,
    },
    {
      title: "Trạng Thái",
      dataIndex: "trangThai",
      key: "trangThai",
      width: 160,
    },
    {
      title: "Tổng chi phí",
      dataIndex: "tongChiPhi",
      key: "tongChiPhi",
      width: 160,
    },
    {
      title: "Xử Lý",
      key: "xuLy",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "4px", whiteSpace: "nowrap" }}>
          <Button
            type="primary"
            size="small"
            style={{
              backgroundColor: "#3cbe5d",
              marginRight: 8,
            }}
            onClick={() => handleViewDetails(data.records[0]._id)}
          >
            Chi tiết
          </Button>
        </div>
      ),
    },
  ];

  const handleViewDetails = useCallback(
    (recordId) => {
      console.log("Xem chi tiết đơn hàng có ID:", recordId);
      navigate(`/order/history/showDetail`, { state: { id: recordId } });
    },
    [navigate]
  );
  //   const handleViewDetails = useCallback(
  //     (phone) => {
  //       navigate(`/customer/history`, { state: { phone: phone } });
  //     },
  //     [navigate]
  //   );

  return (
    <div style={{ padding: 24 }}>
      <Title className="title-processing-detail" level={5}>
        Danh sách đơn hàng của khách hàng:
      </Title>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Card
            style={{
              position: "relative",
              height: "calc(22vh)",
              display: "flex",
              flexDirection: "column",
            }}
            title="Thông tin khách hàng"
            bodyStyle={{
              flex: 1,
              overflow: "hidden",
            }}
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item
                label="Họ Tên"
                style={{ minWidth: "50px" }}
                contentStyle={{ maxWidth: "400px", width: "400px" }}
              >
                {orderData?.hoTenKhachHang || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Số ĐT">
                {orderData?.soDTKhachHang || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa Chỉ">
                {orderData?.diaChiYeuCau.split(",")[1] || "N/A"}
                {orderData?.diaChiYeuCau.split(",")[2]}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            style={{ position: "relative", marginTop: "30px" }}
            title="Thông tin chi tiết khung giờ của đơn hàng"
          >
            <WrapperFilterCol
              className="filter-col-responsive"
              xl={10}
              lg={9}
              md={12}
              sm={14}
              xs={24}
              style={{ position: "absolute", top: "6px", left: "560px" }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  marginRight: "10px",
                  marginBottom: "4px",
                  width: "100%",
                }}
                className="date-picker-text"
              >
                Lọc theo thời gian:
              </span>
              <DatePicker.RangePicker
                style={{ height: "34px", marginTop: "-2px" }}
                onChange={handleDateRangeChange}
                value={
                  dateRange.startDate && dateRange.endDate
                    ? [dateRange.startDate, dateRange.endDate]
                    : null
                }
              />
            </WrapperFilterCol>
            <Table
              columns={columns}
              dataSource={timeSlots}
              pagination={false}
              scroll={{
                y: "calc(100vh - 500px)",
              }}
              style={{
                height: "100%",
              }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default ListOrderCustomer;
