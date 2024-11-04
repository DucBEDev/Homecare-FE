import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Descriptions, Table, Button, Typography, Modal } from "antd";
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
    setSelectedRecord({
      ...record,
      mainOrderId: id, // Thêm id của đơn hàng lớn vào record
      scheduleIds: record.scheduleIds,
    });
    setIsModalVisible(true);
  };

  const handleAssign = () => {
    console.log("selectedRecord", { selectedRecord });
    if (selectedRecord) {
      const assignInfo = {
        mainOrderId: selectedRecord.mainOrderId,
        detailOrderId: selectedRecord.scheduleIds[selectedRecord.key]._id,
        helperId: selectedRecord.helperId,
      };
      console.log("aa", { assignInfo });

      Modal.confirm({
        title: "Xác nhận giao việc",
        content: "Bạn có chắc chắn muốn giao việc cho người giúp việc này?",
        okText: "Giao việc",
        styles: {
          content: {
            fontSize: "14px",
          },
        },
        onOk() {
          axios
            .post(
              `${process.env.REACT_APP_API_URL}admin/requests/assign`,
              assignInfo
            )
            .then((response) => {
              console.log("Giao việc thành công:", response.data);

              // cap nhat timeslot
              setTimeSlots((prevTimeSlots) =>
                prevTimeSlots.map((slot) =>
                  slot.key === selectedRecord.key
                    ? {
                        ...slot,
                        nguoiGiupViec: response.data.helperName,
                        trangThai: "Hoạt động",
                      }
                    : slot
                )
              );

              fetchData(); // load lại data
            })
            .catch((error) => {
              console.error("Lỗi khi giao việc:", error);
            });
        },
        onCancel() {
        },
      });
    }
    setIsModalVisible(false);
  };

  const showEditModal = (record) => {
    setSelectedEditRecord(record);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = (editedRecord) => {
    // Update the timeSlots state with the edited record
    setTimeSlots((prevTimeSlots) =>
      prevTimeSlots.map((slot) =>
        slot.key === editedRecord.key ? editedRecord : slot
      )
    );
    setIsEditModalVisible(false);
  };

  const handleDelete = (record) => {
    console.log({ record });
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa mục này?",
      okText: "Xóa",
      styles: {
        content: {
          fontSize: "14px",
        },
      },
      onOk() {
        const deleteInfo = {
          mainOrderId: id, // id của đơn hàng lớn
          detailOrderId: record.scheduleIds[record.key]._id, // id của chi tiết đơn hàng
        };
        console.log("bb", { deleteInfo });

        axios
          .delete(
            `${process.env.REACT_APP_API_URL}admin/requests/delete`,
            { data: deleteInfo }
          )
          .then((response) => {
            console.log("Xóa thành công:", response.data);

            setTimeSlots((prevTimeSlots) =>
              prevTimeSlots.filter((slot) => slot.key !== record.key)
            );

            fetchData();
          })
          .catch((error) => {
            console.error("Lỗi khi xóa:", error);
          });
      },
      onCancel() {},
    });
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
        // console.log("âsssasssssssssssssss"),
        // console.log({ record }),
        <>
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

          <Button danger size="small" onClick={() => handleDelete(record)}>
            Xóa
          </Button>
        </>
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

          scheduleIds: data.request.scheduleIds,
        }))
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
