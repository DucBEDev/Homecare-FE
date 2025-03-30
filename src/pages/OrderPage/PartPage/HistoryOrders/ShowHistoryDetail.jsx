import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Card, Descriptions, Table, Typography } from "antd";
import "../../StylePage/styleProcessingDetail.css";
import PopupModalDetail from "../HistoryOrders/PopupModalDetail/PopupModalDetail";
import axios from "axios";

const { Title } = Typography;

const ShowHistoryDetail = () => {
  const location = useLocation();
  const { id } = location.state || {};
  const [orderData, setOrderData] = useState();
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allHelpers, setAllHelpers] = useState([]);

  const [isFinishModalVisible, setIsFinishModalVisible] = useState(false);
  const [selectedFinishRecord, setSelectedFinishRecord] = useState(null);

  const showModalDetail = (record) => {
    console.log("cca", record);
    const helper = allHelpers.find((h) => h.id === record.currentHelperId);
    const updatedRecord = {
      ...record,
      phoneHelper: helper?.phone || "",
    };
    setSelectedFinishRecord(updatedRecord);
    setIsFinishModalVisible(true);
  };

  const handleSuccess = () => {
    // Refresh lại data sau khi giao việc thành công
    fetchData();
    // Đóng modal
    // setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Giờ Bắt Đầu",
      dataIndex: "gioBatDau",
      key: "gioBatDau",
      width: 150,
    },
    {
      title: "Giờ Kết Thúc",
      dataIndex: "gioKetThuc",
      key: "gioKetThuc",
      width: 150,
    },
    {
      title: "Ngày Làm",
      dataIndex: "ngayLam",
      key: "ngayLam",
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
            onClick={() => showModalDetail(record)}
          >
            Chi tiết
          </Button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/requests/detail/${id}`
      );
      console.log("cafas", id)
      console.log("re1", response);
      const { data } = response;
      const helperData = data.helpers.map((helper) => ({
        id: helper._id,
        fullName: helper.fullName,
        phone: helper.phone,
        dateOfBirth: helper.birthDate,
        address: helper.address,
        baseFactor: helper.baseFactor,
      }));
      setAllHelpers(helperData);

      let requestType =
        data.request.requestType === "Ngắn hạn" ? "Ngắn hạn" : "Dài hạn";
      let statusNow = "";
      if (data.request.status === "notDone") {
        statusNow = "Chưa tiến hành";
      } else if (data.request.status === "assigned") {
        statusNow = "Chưa tiến hành (Đã giao việc)";
      } else if (data.request.status === "unconfirmed") {
        statusNow = "Chờ xác nhận";
      } else if (data.request.status === "processing") {
        statusNow = "Đang tiến hành";
      } else {
        statusNow = "Đã hoàn thành";
      }

      setOrderData({
        loaiYeuCau: requestType,
        hoTenKhachHang: data.request.customerInfo.fullName,
        soDTKhachHang: data.request.customerInfo.phone,
        loaiDichVu: [data.request.service.title],
        diaChiYeuCau: `${data.request.location.province}, ${data.request.location.district}`,
        ngayDatYeuCau: new Date(data.request.orderDate).toLocaleDateString(
          "vi-VN"
        ),
        trangThai: statusNow,
        tongChiPhi: `${data.request.totalCost.toLocaleString()} VND`,
      });

      setTimeSlots(
        data.scheduleRequest.map((schedule, index) => {
          // Tìm helper info từ danh sách helpers
          const currentHelper = data.helpers.find(
            (h) => h._id === schedule.helper_id
          );
          // Map helpers với key duy nhất
          const helpersList = data.helpers.map((helper) => ({
            key: helper._id, // Sửa helper._id thành helper.id
            helperId: helper._id,
            helperName: helper.fullName,
            haveHelper: true,
            baseFactor: helper.baseFactor,
          }));

          const coefficientOtherList = data.coefficientOtherLists.map(
            (item) => ({
              value: item.value,
              title: item.title,
            })
          );

          return {
            key: `schedule_${schedule._id}`,
            gioBatDau: schedule.startTime || "NaN", // Lấy trực tiếp từ API
            gioKetThuc: schedule.endTime || "NaN", // Lấy trực tiếp từ API
            ngayLam: new Date(schedule.workingDate).toLocaleDateString(
              // Sửa thành workingDate
              "vi-VN",
              {
                weekday: "long",
                year: "numeric",
                month: "numeric",
                day: "numeric",
              }
            ),
            nguoiGiupViec: currentHelper ? currentHelper.fullName : "Chưa có",
            trangThai: (() => {
              if (schedule.status === "notDone") return "Chưa tiến hành";
              else if (schedule.status === "assigned") return "Đã giao việc";
              else if (schedule.status === "unconfirmed") return "Chờ xác nhận";
              else if (schedule.status === "processing")
                return "Đang tiến hành";
              else if (schedule.status === "done") return "Đã hoàn thành";
              else if (schedule.status === "cancelled") return "Đã hủy";
              else return "Không xác định";
            })(),
            scheduleId: schedule._id,
            helpers: helpersList,
            currentHelperId: schedule.helper_id,
            coefficient_service: data.request.service.coefficient_service,
            coefficient_other: data.request.service.coefficient_other,
            isLongTerm: false,
            coefficientOtherList: coefficientOtherList,
            scheduleIds: timeSlots.map((slot) => slot.scheduleId),
          };
        })
      );

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return (
    <div style={{ padding: 24 }}>
      <Title className="title-processing-detail" level={5}>
        Chi tiết đơn hàng đã hoàn thành:
      </Title>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Card
            style={{
              position: "relative",
              height: "calc(100vh - 460px)",
              display: "flex",
              flexDirection: "column",
            }}
            title="Thông tin chi tiết đơn hàng"
            bodyStyle={{
              flex: 1,
              overflow: "hidden",
            }}
          >
            <Descriptions bordered>
              <Descriptions.Item label="Loại Yêu Cầu">
                {orderData?.loaiYeuCau || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Họ Tên Khách Hàng">
                {orderData?.hoTenKhachHang || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Số ĐT Khách Hàng">
                {orderData?.soDTKhachHang || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Loại Dịch Vụ">
                {orderData?.loaiDichVu.join(", ") || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa Chỉ Yêu Cầu">
                {orderData?.diaChiYeuCau || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Đặt Yêu Cầu">
                {orderData?.ngayDatYeuCau || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái">
                {orderData?.trangThai || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng Chi Phí">
                {orderData?.tongChiPhi || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card
            style={{ position: "relative" }}
            title="Thông tin chi tiết khung giờ của đơn hàng"
          >
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
          <PopupModalDetail
            isVisible={isFinishModalVisible}
            onClose={() => setIsFinishModalVisible(false)}
            record={selectedFinishRecord}
            orderData={orderData}
            onFinish={handleSuccess}
          />
        </>
      )}
    </div>
  );
};

export default ShowHistoryDetail;
