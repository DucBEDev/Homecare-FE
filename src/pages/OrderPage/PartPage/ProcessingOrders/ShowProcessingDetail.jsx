import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Descriptions, Table, Button, Typography, Modal } from "antd";
import "../../StylePage/styleProcessingDetail.css";
import axios from "axios";
import PopupModalDetail from "./PopupModalDetail/PopupModalDetail";
import PopupModalEdit from "./PopupModalEdit/PopupModalEdit";
import PopupModalDelete from "./PopupModalDelete/PopupModalDelete";

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

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedDeleteRecord, setSelectedDeleteRecord] = useState(null);

  const showModal = (record) => {
    setSelectedRecord({
      ...record,
      mainOrderId: id, // Thêm id của đơn hàng lớn vào record
    });
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setSelectedEditRecord({
      ...record,
      mainOrderId: id,
    });
    setIsEditModalVisible(true);
  };

  // Thêm hàm show modal xóa
  const showDeleteModal = (record) => {
    setSelectedDeleteRecord({
      ...record,
      mainOrderId: id,
    });
    setIsDeleteModalVisible(true);
  };

  // Thêm hàm xử lý cho giao việc dài hạn
  const handleLongTermAssignment = () => {
    // Tạo một record mới cho giao việc dài hạn
    const longTermRecord = {
      mainOrderId: id,
      scheduleId: id,
      ngayLam: orderData?.ngayDatYeuCau,
      gioBatDau: timeSlots[0]?.gioBatDau, // Lấy giờ bắt đầu từ slot đầu tiên
      gioKetThuc: timeSlots[0]?.gioKetThuc, // Lấy giờ kết thúc từ slot đầu tiên
      nguoiGiupViec: "Chưa có",
      isLongTerm: true, // Thêm flag để đánh dấu là giao việc dài hạn cho nhiều đơn
    };

    setSelectedRecord(longTermRecord);
    setIsModalVisible(true);
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
    { title: "Ngày Làm", dataIndex: "ngayLam", key: "ngayLam", width: 190 },
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
      render: (_, record) => (
        <div style={{ display: "flex", gap: "4px", whiteSpace: "nowrap" }}>
          <Button
            type="primary"
            size="small"
            style={{ marginRight: 8 }}
            onClick={() => showEditModal(record)}
          >
            Sửa
          </Button>

          {record.trangThai === "Hoạt động" ? (
            <>
              <Button
                size="small"
                style={{ marginRight: 8 }}
                onClick={() => showModal(record)}
              >
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

          <Button danger size="small" onClick={() => showDeleteModal(record)}>
            Xóa
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
      console.log("detailresponse", response);
      const { data } = response;
      const helperData = data.helpers.map((helper) => ({
        id: helper._id,
        fullName: helper.fullName,
        phone: helper.phone,
        dateOfBirth: helper.birthDate,
        address: helper.address,
        baseFactor: helper.baseFactor,
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
        data.scheduleRequest.map((schedule, index) => {
          // Map helpers với key duy nhất
          const helpersList = data.helpers.map((helper) => ({
            key: `helper_${helper.id}`, // Sửa helper._id thành helper.id
            helperId: helper.id,
            helperName: helper.fullName,
            haveHelper: true,
          }));

          const coefficientOtherList = data.coefficientOtherLists.map((item) => ({
            value: item.value,
            title: item.title,
          }));

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
            nguoiGiupViec:
              schedule.helper_id === "notAvailable"
                ? "Chưa có"
                : data.helpers.find((h) => h.id === schedule.helper_id)
                    ?.fullName || "Chưa có",
            trangThai:
              schedule.status === "notDone" ? "Chưa hoạt động" : "Hoạt động",

            scheduleId: schedule._id,
            helpers: helpersList,
            currentHelperId: schedule.helper_id,
            coefficient_service: data.request.service.coefficient_service,
            coefficient_other: data.request.service.coefficient_other,
            isLongTerm: false,
            coefficientOtherList: coefficientOtherList,
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
        Chi tiết đơn hàng chưa hoàn thành:
      </Title>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Card
            style={{
              position: "relative",
              height: "calc(100vh - 460px)", // Chiều cao động dựa theo viewport
              display: "flex",
              flexDirection: "column",
            }}
            title="Thông tin chi tiết khung giờ của đơn hàng"
            bodyStyle={{
              flex: 1,
              overflow: "hidden", // Ngăn scroll của Card
            }}
          >
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
              onClick={handleLongTermAssignment}
            >
              Giao việc dài hạn
            </Button>
            <Table
              columns={columns}
              dataSource={timeSlots}
              pagination={false}
              scroll={{
                y: "calc(100vh - 500px)", // Chiều cao scroll của table
              }}
              style={{
                height: "100%",
              }}
            />
            <PopupModalDetail
              isVisible={isModalVisible}
              onClose={() => setIsModalVisible(false)}
              record={selectedRecord}
              orderData={orderData}
              allHelpers={allHelpers}
            />
            <PopupModalEdit
              isVisible={isEditModalVisible}
              onClose={() => setIsEditModalVisible(false)}
              record={selectedEditRecord}
              orderData={orderData}
              onEdit={() => {
                fetchData(); // Refresh data sau khi edit
                setIsEditModalVisible(false);
              }}
            />
            <PopupModalDelete
              isVisible={isDeleteModalVisible}
              onClose={() => setIsDeleteModalVisible(false)}
              record={selectedDeleteRecord}
              orderData={orderData}
              onDelete={() => {
                fetchData(); // Refresh data sau khi xóa
                setIsDeleteModalVisible(false);
              }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default ShowProcessingDetail;
