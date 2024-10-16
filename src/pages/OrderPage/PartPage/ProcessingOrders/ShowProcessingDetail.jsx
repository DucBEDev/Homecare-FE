import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Descriptions, Table, Button, Typography } from "antd";
import "../../StylePage/styleProcessingDetail.css";
import axios from "axios";
import PopupModalDetail from "./PopupModalDetail/PopupModalDetail";
import PopupModalEdit from "./PopupModalEdit/PopupModalEdit";

const { Title } = Typography;

const ShowProcessingDetail = () => {
  const location = useLocation();
  const { id } = location.state || {};
  const [orderData, setOrderData] = useState();
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allHelpers, setAllHelpers] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedEditRecord, setSelectedEditRecord] = useState(null);

  const showModal = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const handleAssign = () => {
    // Xử lý logic giao việc ở đây
    console.log("Giao việc cho:", selectedRecord);
    setIsModalVisible(false);
  };



  const showEditModal = (record) => {
    setSelectedEditRecord(record);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = (editedRecord) => {
    // Update the timeSlots state with the edited record
    setTimeSlots(prevTimeSlots =>
      prevTimeSlots.map(slot =>
        slot.key === editedRecord.key ? editedRecord : slot
      )
    );
    setIsEditModalVisible(false);
  };

  const columns = [
    { title: "Giờ Bắt Đầu", dataIndex: "gioBatDau", key: "gioBatDau" },
    { title: "Giờ Kết Thúc", dataIndex: "gioKetThuc", key: "gioKetThuc" },
    { title: "Ngày Làm", dataIndex: "ngayLam", key: "ngayLam" },
    {
      title: "Người Giúp Việc",
      dataIndex: "nguoiGiupViec",
      key: "nguoiGiupViec",
    },
    { title: "Trạng Thái", dataIndex: "trangThai", key: "trangThai" },
    {
      title: "Xử Lý",
      key: "xuLy",
      render: (_, record) => (
        console.log({ record }),
        (
          <>
            <Button type="primary" size="small" style={{ marginRight: 8 }} onClick={() => showEditModal(record)}>
              Sửa
            </Button>

            {record.trangThai === "Hoạt động" ? (
              <>
                <Button size="small" style={{ marginRight: 8 }} onClick={() => showModal(record)}>
                  Đổi NGV
                </Button>
                <Button type="primary" size="small" style={{ marginRight: 8 }}>
                  Hoàn Thành
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                size="small"
                style={{ marginRight: 8, background: "#10ce80" }}
                onClick={() => showModal(record)}
              >
                Giao việc
              </Button> 
            )}

            <Button danger size="small">
              Xóa
            </Button>
          </>
        )
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/requests/detail/${id}`
        );
        console.log(response);
        const { data } = response;

        const helperData = data.helpers.map((helper) => ({
          id: helper.helper_id,
          fullName: helper.fullName,
          phone: helper.phone,
          dateOfBirth: helper.birthDate,
          age: helper.age,
          address: helper.address,
          // Add any other relevant helper information
        }));
        setAllHelpers(helperData);

        let requestType =
          data.request.requestType === "shortTerm" ? "Ngắn hạn" : "Dài hạn";
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
          data.helpers.map((helper, index) => ({
            key: index.toString(),
            gioBatDau: new Date(data.request.startTime).toLocaleTimeString(
              "vi-VN",
              { hour: "2-digit", minute: "2-digit" }
            ),
            gioKetThuc: new Date(data.request.endTime).toLocaleTimeString(
              "vi-VN",
              { hour: "2-digit", minute: "2-digit" }
            ),
            ngayLam: new Date(data.request.startTime).toLocaleDateString(
              "vi-VN",
              {
                weekday: "long",
                year: "numeric",
                month: "numeric",
                day: "numeric",
              }
            ),
            nguoiGiupViec: helper.fullName, // Assuming this is the helper's ID

            trangThai:
              helper.status === "active" ? "Hoạt động" : "Chưa hoạt động",

            //truyền thêm dữ liệu để check đk cho column là đã có ngv hay chưa
            helperId: helper.helper_id,  
            haveHelper: helper.fullName ? true : false,

          }))
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div style={{ padding: 24 }}>
      <Title className="title-processing-detail" level={5}>
        Chi tiết đơn hàng chưa hoàn thành:
      </Title>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Card title="Thông tin đơn hàng:" style={{ marginBottom: 24 }}>
            <Descriptions bordered>
              <Descriptions.Item label="Loại Yêu Cầu">
                {orderData?.loaiYeuCau || "N/A"}{" "}
                {/* Fallback to "N/A" if undefined */}
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
            <Button
              style={{
                position: "absolute",
                top: "2px",
                left: "75%",
                background: "#10ce80",
              }}
              type="primary"
              size="normal"
            >
              Giao việc dài hạn
            </Button>
            <Table
              columns={columns}
              dataSource={timeSlots}
              pagination={false}
            />
            <PopupModalDetail
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAssign={handleAssign}
        record={selectedRecord}
        orderData={orderData}
        allHelpers={allHelpers}
      />
      <PopupModalEdit
      isVisible={isEditModalVisible}
      onClose={() => setIsEditModalVisible(false)}
      onSave={handleSaveEdit}
      record={selectedEditRecord}
      orderData={orderData}
    />
          </Card>
        </>
      )}
    </div>
  );
};

export default ShowProcessingDetail;