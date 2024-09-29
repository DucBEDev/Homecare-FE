import React, { useState } from "react";
import { Input, Button, DatePicker, Space } from "antd";
import DropdownSortComponent from "../DropdownComponent/DropdownSortComponent";

const SearchComponent = ({ onSearch }) => {
  const [searchType, setSearchType] = useState("0");
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState([]);

  const handleSearch = () => {
    onSearch(searchType, dateRange, keyword);
  };

  return (
    <Space>
      <DropdownSortComponent onSelect={setSearchType} />
      <Input 
        placeholder="Nhập từ khóa" 
        value={keyword} 
        onChange={(e) => setKeyword(e.target.value)}
        style={{ width: 200 }}
      />
      <DatePicker.RangePicker onChange={setDateRange} />
      <Button type="primary" onClick={handleSearch}>
        Tìm kiếm
      </Button>
    </Space>
  );
};

export default SearchComponent;