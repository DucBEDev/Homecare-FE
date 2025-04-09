import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Descriptions, Table, Button, Typography, Modal } from "antd";
import "../../StylePage/styleProcessingDetail.css";
import axios from "axios";
import PopupModalDetail from "./PopupModalDetail/PopupModalDetail";
import PopupModalEdit from "./PopupModalEdit/PopupModalEdit";
import PopupModalDelete from "./PopupModalDelete/PopupModalDelete";
import PopupModalFinish from "./PopupModalFinish/PopupModalFinish";
import { CheckCircleOutlined } from "@ant-design/icons";
import NotificationComponent from "../../../../components/NotificationComponent/NotificationComponent";

const { Title } = Typography;

const ShowProcessingDetail = () => {
  const location = useLocation();
  const { id } = location.state || {};
  const navigate = useNavigate();
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

  const [isFinishModalVisible, setIsFinishModalVisible] = useState(false);
  const [selectedFinishRecord, setSelectedFinishRecord] = useState(null);

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const [showNotification, setShowNotification] = useState(null);
  
  // Thêm state cho modal chờ thanh toán của đơn nhỏ
  const [isDetailWaitPaymentModalVisible, setIsDetailWaitPaymentModalVisible] = useState(false);
  const [selectedDetailForWaitPayment, setSelectedDetailForWaitPayment] = useState(null);

  // Thêm state mới cho modal xác nhận tiến hành của đơn nhỏ
  const [isDetailProcessingModalVisible, setIsDetailProcessingModalVisible] = useState(false);
  const [selectedDetailForProcessing, setSelectedDetailForProcessing] = useState(null);

  const showModal = (record) => {
    setSelectedRecord({
      ...record,
      mainOrderId: id,
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

  const showDeleteModal = (record) => {
    setSelectedDeleteRecord({
      ...record,
      mainOrderId: id,
    });
    setIsDeleteModalVisible(true);
  };

  const showFinishModal = (record) => {
    const helper = allHelpers.find((h) => h.id === record.currentHelperId);
    const updatedRecord = {
      ...record,
      phoneHelper: helper?.phone || "",
    };
    setSelectedFinishRecord(updatedRecord);
    setIsFinishModalVisible(true);
  };
  
  // Hàm hiển thị modal xác nhận chuyển trạng thái sang chờ thanh toán
  const showDetailWaitPaymentModal = (record) => {
    setSelectedDetailForWaitPayment(record);
    setIsDetailWaitPaymentModalVisible(true);
  };

  // Hàm hiển thị modal xác nhận chuyển trạng thái sang đang tiến hành
  const showDetailProcessingModal = (record) => {
    setSelectedDetailForProcessing(record);
    setIsDetailProcessingModalVisible(true);
  };

  const handleSuccess = (helperCosts = null, detailCosts = null) => {
    if (helperCosts) {
      // Cập nhật chi phí NGV trong timeSlots
      const updatedTimeSlots = timeSlots.map(slot => {
        if (helperCosts[slot.scheduleId]) {
          return {
            ...slot,
            chiPhiNGV: helperCosts[slot.scheduleId].toLocaleString() + " VND"
          };
        }
        return slot;
      });
      setTimeSlots(updatedTimeSlots);
    }

    if (detailCosts) {
      // Cập nhật detailCost trong timeSlots
      const updatedTimeSlots = timeSlots.map(slot => {
        if (detailCosts[slot.scheduleId]) {
          return {
            ...slot,
            detailCost: detailCosts[slot.scheduleId]
          };
        }
        return slot;
      });
      setTimeSlots(updatedTimeSlots);
    }
    
    // Gọi API để lấy dữ liệu mới
    fetchData();
    
    // Đóng các modal
    setIsModalVisible(false);
    setIsEditModalVisible(false);
    setIsDeleteModalVisible(false);
    setIsFinishModalVisible(false);
  };

  // Thêm hàm xử lý cho giao việc dài hạn
  const handleLongTermAssignment = () => {
    const longTermRecord = {
      mainOrderId: id,
      ngayLam: orderData?.ngayDatYeuCau,
      gioBatDau: timeSlots[0]?.gioBatDau,
      gioKetThuc: timeSlots[0]?.gioKetThuc,
      nguoiGiupViec: "Chưa có",
      isLongTerm: true,
      coefficientOtherList: timeSlots[0]?.coefficientOtherList || [],
      coefficient_service: timeSlots[0]?.coefficient_service,
      coefficient_other: timeSlots[0]?.coefficient_other,
      coefficient_ot: timeSlots[0]?.coefficient_ot,
      scheduleIds: timeSlots.map((slot) => slot.scheduleId),
    };

    setSelectedRecord(longTermRecord);
    setIsModalVisible(true);
  };

  const handleCompleteClick = () => {
    setIsConfirmModalVisible(true);
  };

  const handleCompleteConfirm = async () => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/requests/updateRequestDone/${id}`
      );

      setShowNotification({
        status: "success",
        message: "Thành công",
        description: "Hoàn thành đơn hàng thành công!",
      });

      fetchData();

      setTimeout(() => {
        setIsConfirmModalVisible(false);
        setShowNotification(null);
      }, 700);

      setTimeout(() => {
        navigate("/order");
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể hoàn thành đơn hàng. Vui lòng thử lại.";

      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: errorMessage,
      });

      setTimeout(() => {
        setIsConfirmModalVisible(false);
        setShowNotification(null);
      }, 1500);
    }
  };
  
  // Hàm xử lý khi xác nhận chuyển sang chờ thanh toán cho đơn nhỏ
  const handleDetailWaitPaymentConfirm = () => {
    if (!selectedDetailForWaitPayment) return;
    
    axios.patch(
      `${process.env.REACT_APP_API_URL}admin/requests/updateDetailWaitPayment/${selectedDetailForWaitPayment.scheduleId}`
    )
    .then(response => {
      if (response && response.data && response.data.success) {
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Đã chuyển trạng thái sang chờ thanh toán!",
        });
        
        fetchData();
        
        setTimeout(() => {
          setIsDetailWaitPaymentModalVisible(false);
          setShowNotification(null);
        }, 1500);
      }
    })
    .catch(error => {
      console.error("Error:", error);
      
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Không thể chuyển trạng thái. Vui lòng thử lại.",
      });
      
      setTimeout(() => {
        setIsDetailWaitPaymentModalVisible(false);
        setShowNotification(null);
      }, 1500);
    });
  };

  // Hàm xử lý khi xác nhận chuyển sang đang tiến hành cho đơn nhỏ
  const handleDetailProcessingConfirm = () => {
    if (!selectedDetailForProcessing) return;
    
    axios.patch(
      `${process.env.REACT_APP_API_URL}admin/requests/updateRequestProcessing/${selectedDetailForProcessing.scheduleId}`
    )
    .then(response => {
      if (response && response.data && response.data.success) {
        
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Đã chuyển trạng thái sang đang tiến hành!",
        });
        
        fetchData();
        
        setTimeout(() => {
          setIsDetailProcessingModalVisible(false);
          setShowNotification(null);
        }, 1500);
      }
    })
    .catch(error => {
      console.error("Error:", error);
      
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Không thể chuyển trạng thái. Vui lòng thử lại.",
      });
      
      setTimeout(() => {
        setIsDetailProcessingModalVisible(false);
        setShowNotification(null);
      }, 1500);
    });
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
      title: "Chi Phí NGV",
      dataIndex: "chiPhiNGV",
      key: "chiPhiNGV",
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
          {/* 1. Khi trạng thái "Chưa tiến hành" (notDone) */}
          {record.trangThai === "Chưa tiến hành" && (
            <>
              <Button
                type="primary"
                size="small"
                style={{ marginRight: 8 }}
                onClick={() => showEditModal(record)}
              >
                Sửa
              </Button>
              
              {record.nguoiGiupViec === "Chưa có" ? (
                <Button
                  type="primary"
                  size="small"
                  style={{ marginRight: 8, background: "#10ce80" }}
                  onClick={() => showModal(record)}
                >
                  Giao việc
                </Button>
              ) : (
                <Button
                  size="small"
                  style={{ marginRight: 8 }}
                  onClick={() => showModal(record)}
                >
                  Đổi NGV
                </Button>
              )}
              
              <Button
                danger
                size="small"
                onClick={() => showDeleteModal(record)}
              >
                Hủy
              </Button>
            </>
          )}
          
          {/* 2. Khi trạng thái "Đã giao việc" (assigned) - THÊM NÚT "TIẾN HÀNH" */}
          {record.trangThai === "Đã giao việc" && (
            <>
              <Button
                type="primary"
                size="small"
                style={{ marginRight: 8 }}
                onClick={() => showEditModal(record)}
              >
                Sửa
              </Button>
              
              <Button
                size="small"
                style={{ marginRight: 8 }}
                onClick={() => showModal(record)}
              >
                Đổi NGV
              </Button>
              
              <Button
                type="primary"
                size="small"
                style={{ marginRight: 8, background: "#fdc41a" }}
                onClick={() => showDetailProcessingModal(record)}
              >
                Tiến hành
              </Button>
              
              <Button
                danger
                size="small"
                onClick={() => showDeleteModal(record)}
              >
                Hủy
              </Button>
            </>
          )}
          
          {/* 3. Khi trạng thái "Đang tiến hành" (processing) */}
          {record.trangThai === "Đang tiến hành" && (
            <Button
              type="primary"
              size="small"
              style={{ marginRight: 8, background: "#fa8c16" }}
              onClick={() => showDetailWaitPaymentModal(record)}
            >
              Chờ thanh toán
            </Button>
          )}
          
          {/* 4. Khi trạng thái "Chờ thanh toán" (waitPayment) */}
          {record.trangThai === "Chờ thanh toán" && (
            <Button
              type="primary"
              size="small"
              style={{ marginRight: 8, background: "#4096FF" }}
              onClick={() => showFinishModal(record)}
            >
              Hoàn thành
            </Button>
          )}
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/requests/detail/${id}`
      );
      const { data } = response;
      console.log("detailllllllllllllllllllllll", data);
      
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
      } else if (data.request.status === "waitPayment") {
        statusNow = "Chờ thanh toán";
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
        chiPhiNGV: `${data.request.profit.toLocaleString()} VND`,
        tongChiPhi: `${data.request.totalCost.toLocaleString()} VND`,
      });

      setTimeSlots(
        data.scheduleRequest.map((schedule) => {
          const currentHelper = data.helpers.find(
            (h) => h._id === schedule.helper_id
          );
          const helpersList = data.helpers.map((helper) => ({
            key: helper._id,
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
            gioBatDau: schedule.startTime || "NaN",
            gioKetThuc: schedule.endTime || "NaN",
            ngayLam: new Date(schedule.workingDate).toLocaleDateString(
              "vi-VN",
              {
                weekday: "long",
                year: "numeric",
                month: "numeric",
                day: "numeric",
              }
            ),
            workingDate: schedule.workingDate,
            nguoiGiupViec: currentHelper ? currentHelper.fullName : "Chưa có",
            chiPhiNGV: schedule.helper_cost ? 
              schedule.helper_cost.toLocaleString() + " VND" : 
              "0 VND",
            trangThai: (() => {
              if (schedule.status === "notDone") return "Chưa tiến hành";
              else if (schedule.status === "assigned") return "Đã giao việc";
              else if (schedule.status === "processing")
                return "Đang tiến hành";
              else if (schedule.status === "waitPayment") return "Chờ thanh toán"
              else if (schedule.status === "done") return "Đã hoàn thành";
              else if (schedule.status === "cancelled") return "Đã hủy";
              else return "Không xác định";
            })(),
            scheduleId: schedule._id,
            helpers: helpersList,
            currentHelperId: schedule.helper_id,
            coefficient_service: data.request.service.coefficient_service,
            coefficient_other: data.request.service.coefficient_other,
            coefficient_ot: data.request.service.coefficient_ot,
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
        Chi tiết đơn hàng chưa hoàn thành:
      </Title>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Card
            style={{
              position: "relative",
              height: "calc(32vh)",
              minHeight: "300px",
              display: "flex",
              flexDirection: "column",
            }}
            title="Thông tin chi tiết khung giờ của đơn hàng"
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
              <Descriptions.Item label="Lợi nhuận (Hiện tại)">
                {orderData?.chiPhiNGV || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card
            style={{ position: "relative" }}
            title="Thông tin chi tiết khung giờ của đơn hàng"
          >
            {/* Nút giao việc dài hạn cho đơn lớn */}
            <Button
              style={{
                position: "absolute",
                top: "2px",
                left: "20%",
                background: "#10ce80",
                maxWidth: "120px",
                marginLeft: "90px",
              }}
              type="primary"
              size="normal"
              onClick={handleLongTermAssignment}
              onAssignLong={handleSuccess}
            >
              Giao việc dài hạn
            </Button>

            {/* Nút hoàn thành cho đơn lớn */}
            <Button
              style={{
                position: "absolute",
                top: "2px",
                left: "20%",
                background: "#4096FF",
                maxWidth: "120px",
                marginLeft: "220px",
              }}
              type="primary"
              size="normal"
              onClick={handleCompleteClick}
            >
              Hoàn thành
            </Button>

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
            
            {/* Modal hiện tại */}
            <PopupModalDetail
              isVisible={isModalVisible}
              onClose={() => setIsModalVisible(false)}
              record={selectedRecord}
              orderData={orderData}
              allHelpers={allHelpers}
              onAssign={handleSuccess}
              timeSlots={timeSlots}
            />
            <PopupModalEdit
              isVisible={isEditModalVisible}
              record={selectedEditRecord}
              orderData={orderData}
              onClose={() => setIsEditModalVisible(false)}
              onEdit={handleSuccess}
            />
            <PopupModalDelete
              isVisible={isDeleteModalVisible}
              onClose={() => setIsDeleteModalVisible(false)}
              record={selectedDeleteRecord}
              orderData={orderData}
              onDelete={handleSuccess}
            />
            <PopupModalFinish
              isVisible={isFinishModalVisible}
              onClose={() => setIsFinishModalVisible(false)}
              record={selectedFinishRecord}
              orderData={orderData}
              onFinish={handleSuccess}
            />
            
            {/* Modal xác nhận hoàn thành đơn lớn */}
            <Modal
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "24px",
                  }}
                >
                  <CheckCircleOutlined
                    style={{ color: "#4096FF", fontSize: "24px" }}
                  />
                  <span style={{ fontWeight: "600" }}>Xác nhận</span>
                </div>
              }
              open={isConfirmModalVisible}
              onOk={handleCompleteConfirm}
              onCancel={() => setIsConfirmModalVisible(false)}
              okText="Hoàn thành"
              cancelText="Hủy"
              className="custom-modal"
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              wrapClassName="custom-modal-wrap"
              footer={[
                <Button
                  key="ok"
                  type="primary"
                  className="done-button"
                  onClick={handleCompleteConfirm}
                  style={{ background: "#4096FF" }}
                >
                  Hoàn thành
                </Button>,
                <Button
                  key="cancel"
                  danger
                  className="cancel-button"
                  onClick={() => setIsConfirmModalVisible(false)}
                  style={{ background: "#ff4d4f", color: "#fff" }}
                >
                  Hủy
                </Button>,
              ]}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  marginTop: "20px",
                }}
              >
                Bạn có chắc chắn muốn hoàn thành đơn hàng này?
              </p>
            </Modal>
            
            {/* Modal xác nhận chờ thanh toán cho đơn nhỏ */}
            <Modal
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "24px",
                  }}
                >
                  <CheckCircleOutlined
                    style={{ color: "#fa8c16", fontSize: "24px" }}
                  />
                  <span style={{ fontWeight: "600" }}>Xác nhận</span>
                </div>
              }
              open={isDetailWaitPaymentModalVisible}
              onOk={handleDetailWaitPaymentConfirm}
              onCancel={() => setIsDetailWaitPaymentModalVisible(false)}
              okText="Xác nhận"
              cancelText="Hủy"
              className="custom-modal"
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              wrapClassName="custom-modal-wrap"
              footer={[
                <Button
                  key="ok"
                  type="primary"
                  onClick={handleDetailWaitPaymentConfirm}
                  style={{ background: "#fa8c16" }}
                >
                  Xác nhận
                </Button>,
                <Button
                  key="cancel"
                  danger
                  onClick={() => setIsDetailWaitPaymentModalVisible(false)}
                  style={{ background: "#ff4d4f", color: "#fff" }}
                >
                  Hủy
                </Button>,
              ]}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  marginTop: "20px",
                }}
              >
                Bạn có chắc chắn muốn chuyển đơn nhỏ này sang trạng thái chờ thanh toán?
              </p>
            </Modal>
            
            {/* Modal xác nhận tiến hành cho đơn nhỏ */}
            <Modal
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "24px",
                  }}
                >
                  <CheckCircleOutlined
                    style={{ color: "#fdc41a", fontSize: "24px" }}
                  />
                  <span style={{ fontWeight: "600" }}>Xác nhận</span>
                </div>
              }
              open={isDetailProcessingModalVisible}
              onOk={handleDetailProcessingConfirm}
              onCancel={() => setIsDetailProcessingModalVisible(false)}
              okText="Xác nhận"
              cancelText="Hủy"
              className="custom-modal"
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              wrapClassName="custom-modal-wrap"
              footer={[
                <Button
                  key="ok"
                  type="primary"
                  onClick={handleDetailProcessingConfirm}
                  style={{ background: "#fdc41a" }}
                >
                  Xác nhận
                </Button>,
                <Button
                  key="cancel"
                  danger
                  onClick={() => setIsDetailProcessingModalVisible(false)}
                  style={{ background: "#ff4d4f", color: "#fff" }}
                >
                  Hủy
                </Button>,
              ]}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  marginTop: "20px",
                }}
              >
                Bạn có chắc chắn muốn chuyển đơn nhỏ này sang trạng thái đang tiến hành?
              </p>
            </Modal>
          </Card>
          
          {/* Component thông báo */}
          {showNotification && (
            <NotificationComponent
              status={showNotification.status}
              message={showNotification.message}
              description={showNotification.description}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ShowProcessingDetail;
