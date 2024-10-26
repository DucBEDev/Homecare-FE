import { useEffect } from "react";
import { notification } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"; // Import biểu tượng
import "./NotificationComponent.css";

const NotificationComponent = ({ status, message, description }) => {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = () => {
    if (status === "success") {
        api.open({
            icon:<span><CheckCircleOutlined style={{ color: '#51da8c',marginLeft: '-6px', marginTop: '12px', fontSize: '30px' }} /></span>,
          message: message || "Thông báo mới",
          description:
            description ||
            "Đây là nội dung của thông báo. Bạn có thể tùy chỉnh nội dung này.",
          className: "custom-notification success-notification",
          duration: 100000,
          placement: "topRight",
        });
    }
    else if (status === "error") {
        api.open({
            icon:<span><CloseCircleOutlined style={{ color: '#f18a8c',marginLeft: '-6px', marginTop: '12px', fontSize: '30px' }} /></span>,
          message: message || "Thông báo mới",
          description:
            description ||
            "Đây là nội dung của thông báo. Bạn có thể tùy chỉnh nội dung này.",
          className: "custom-notification error-notification",
          duration: 100000,
          placement: "topRight",
        });
    }
  };

  useEffect(() => {
    openNotification();
  }, []);

  return contextHolder;
};

export default NotificationComponent;
