import React from "react";
import { useParams } from "react-router-dom";

const ShowProcessingDetail = () => {
    const { id } = useParams();
    return (
        <div>
            <h2>Chi tiết đơn hàng</h2>
            <p>ID đơn hàng: {id}</p>
            {/* Thêm các thông tin chi tiết khác ở đây */}
        </div>
    )
}

export default ShowProcessingDetail;