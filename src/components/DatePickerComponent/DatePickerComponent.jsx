import React, { useState } from "react";
import { DatePicker, Space, ConfigProvider } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/vi";
import locale from "antd/locale/vi_VN";
import "./style.css";

dayjs.extend(customParseFormat);
dayjs.locale("vi"); // Thiết lập Day.js locale nếu cần

const { RangePicker } = DatePicker;

const dateFormat = "YYYY/MM/DD";

const DatePickerComponent = () => {
  const [startEndDate, setStartEndDate] = useState([]);

  // Hàm xử lý khi chọn ngày bắt đầu và kết thúc
  const onDateChange = (dates, dateStrings) => {
    setStartEndDate(dateStrings); // dateStrings chứa ngày bắt đầu và kết thúc
    console.log("Ngày bắt đầu:", dateStrings[0]);
    console.log("Ngày kết thúc:", dateStrings[1]);
  };

  // Lấy ngày hôm nay
  const today = dayjs();

  return (
    <>
      <div
        className="date-picker-text"
        style={{
          fontSize: "14px",
          fontWeight: "700",
          marginBottom: "4px",
          marginTop:"-20px",
          marginLeft: "4px",
          width: "100%",
        }}
      >
        Thời gian: 
      </div>
      <ConfigProvider locale={locale}>
        <Space direction="vertical" size={12}>
          <RangePicker
            style={{ color: "#000" }}
            defaultValue={[today.startOf("day"), null]} // Ngày hôm nay từ đầu đến cuối         today.startOf("day")
            format={dateFormat}
            onChange={onDateChange} // Hàm được gọi khi chọn ngày
          />
        </Space>
      </ConfigProvider>
    </>
  );
};

export default DatePickerComponent;
