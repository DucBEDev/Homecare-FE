import React, { useCallback, useEffect, useState } from "react";
import { Pagination, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ButtonComponent from "../../../../components/ButtonComponent/ButtonComponent";
import axios from "axios";
import { Modal, Form, Input, InputNumber } from "antd";
import NotificationComponent from "../../../../components/NotificationComponent/NotificationComponent";

import PopupModalDelete from "./PopupModalDelete/PopupModalDelete"; // Import the PopupModalDelete component

const BodyServiceTable = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const searchValue = useSelector((state) => state.search.value);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);
    const [pageSize, setPageSize] = useState(5);
    const [services, setServices] = useState([]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [form] = Form.useForm();

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [showNotification, setShowNotification] = useState(null);

    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            render: (text, record, index) =>
                (currentPage - 1) * pageSize + index + 1, // Correct STT calculation
        },
        {
            title: "Dịch vụ",
            dataIndex: "title",
            key: "title",
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: "Giá cơ bản (VND/Giờ)",
            dataIndex: "basicPrice",
            key: "basicPrice",
            sorter: (a, b) => a.basicPrice - b.basicPrice,
        },
        {
            title: "Phụ phí",
            dataIndex: "phuPhi",
            key: "phuPhi",
            sorter: (a, b) => (a.phuPhi || 0) - (b.phuPhi || 0), // Default to 0 if null
            render: (text) => text || "N/A", // Display "N/A" if null
        },
        {
            title: "Phí Ngoài Giờ (KH)",
            dataIndex: "phiNgoaiGioKH",
            key: "phiNgoaiGioKH",
            sorter: (a, b) => (a.phiNgoaiGioKH || 0) - (b.phiNgoaiGioKH || 0), // Default to 0 if null
            render: (text) => text || "N/A", // Display "N/A" if null
        },
        {
            title: "Phí Ngoài Giờ (NGV)",
            dataIndex: "phiNgoaiGioNGV",
            key: "phiNgoaiGioNGV",
            sorter: (a, b) => (a.phiNgoaiGioNGV || 0) - (b.phiNgoaiGioNGV || 0), // Default to 0 if null
            render: (text) => text || "N/A", // Display "N/A" if null
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            sorter: (a, b) => a.status.localeCompare(b.status),
        },
        {
            title: "Lựa chọn",
            key: "action",
            render: (_, record) => (
                <span className="column-with-icon action-icon">
                    <ButtonComponent
                        size="large"
                        textButton="Sửa"
                        styleButton={{
                            backgroundColor: "#3cbe5d",
                            width: "40px",
                            height: "40px",
                            border: "1px",
                            borderRadius: "12px",
                            marginRight: "2px",
                        }}
                        styleButtonText={{ color: "#fff" }}
                        onClick={() => handleEdit(record.key)}
                    />
                    <ButtonComponent
                        size="large"
                        textButton="Xóa"
                        styleButton={{
                            backgroundColor: "#d22d2d",
                            width: "40px",
                            height: "40px",
                            border: "1px",
                            borderRadius: "12px",
                        }}
                        styleButtonText={{ color: "#fff" }}
                        onClick={() => showDeleteConfirm(record.key)}
                    />
                </span>
            ),
        },
    ];

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}admin/services`
            );
            const transformedData = response.data.services.map((service, index) => ({
                key: service._id,
                stt: index + 1,
                title: service.title,
                basicPrice: service.basicPrice,
                phuPhi: service.phuPhi,
                phiNgoaiGioKH: service.phiNgoaiGioKH,
                phiNgoaiGioNGV: service.phiNgoaiGioNGV,
                status: service.status === "active" ? "Hoạt động" : "Không hoạt động",
            }));
            setServices(transformedData);
            setFilteredData(transformedData);
        } catch (error) {
            console.error("Error fetching services:", error);
            setShowNotification({
                status: "error",
                message: "Lỗi",
                description: `Lỗi khi tải dữ liệu dịch vụ: ${error.message}`,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        let filtered = services;

        if (searchValue) {
            filtered = filtered.filter((item) => item.title.includes(searchValue));
        }

        setFilteredData(filtered);
    }, [searchValue, services]);

    const getCurrentPageData = useCallback(() => {
        if (!filteredData) return [];

        const startIndex = (currentPage - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [currentPage, filteredData, pageSize]);

    const handleEdit = (recordId) => {
        const selected = services.find((service) => service.key === recordId);
        setSelectedService(selected);
        form.setFieldsValue({
            title: selected.title,
            basicPrice: selected.basicPrice,
            phuPhi: selected.phuPhi,
            phiNgoaiGioKH: selected.phiNgoaiGioKH,
            phiNgoaiGioNGV: selected.phiNgoaiGioNGV,
            status: selected.status,
        });
        setIsEditModalVisible(true);
    };

    const showDeleteConfirm = (recordId) => {
        const service = services.find((s) => s.key === recordId);
        setSelectedService(service);
        setServiceToDelete(recordId);
        setIsDeleteModalVisible(true);
    };

    const hideDeleteConfirm = () => {
        setIsDeleteModalVisible(false);
        setServiceToDelete(null);
        setSelectedService(null);
    };

    const handleDeleteSuccess = useCallback((deletedService) => {
        setServices((prevServices) =>
            prevServices.filter((service) => service.key !== deletedService.key)
        );
        setFilteredData((prevFilteredData) =>
            prevFilteredData.filter((service) => service.key !== deletedService.key)
        );
    }, []);

    const handleOk = () => {
        form.submit();
    };

    const handleCancel = () => {
        setIsEditModalVisible(false);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await axios.patch(
                `${process.env.REACT_APP_API_URL}admin/services/edit/${selectedService.key}`,
                values
            );
            if (response.data.success) {
                const updatedServices = services.map((service) =>
                    service.key === selectedService.key ? { ...service, ...values } : service
                );
                setServices(updatedServices);
                setFilteredData(updatedServices);
                setShowNotification({
                    status: "success",
                    message: "Thành công",
                    description: "Cập nhật thông tin dịch vụ thành công!",
                });
            } else {
                setShowNotification({
                    status: "error",
                    message: "Thất bại",
                    description: response.data.msg,
                });
            }
        } catch (error) {
            console.error("Error updating service:", error);
            setShowNotification({
                status: "error",
                message: "Thất bại",
                description: "Cập nhật thông tin dịch vụ thất bại!",
            });
        } finally {
            setLoading(false);
            setIsEditModalVisible(false);
            setTimeout(() => setShowNotification(null), 3000);
        }
    };

    return (
        <div className="processing-maids-container">
            <Table
                columns={columns}
                dataSource={getCurrentPageData()}
                loading={loading}
                rowKey="key"
                scroll={{ x: 1000 }}
                pagination={false}
            />
            <div className="pagination-container">
                <Pagination
                    align="center"
                    current={currentPage}
                    total={filteredData.length}
                    pageSize={pageSize}
                    onChange={setCurrentPage}
                    hideOnSinglePage={true}
                    showLessItems={true}
                    style={{
                        fontSize: "26px",
                        transform: "translateX(-20px)",
                        marginTop: "10px",
                        position: "fixed",
                        bottom: "20px",
                        left: "50%",
                        zIndex: 1000,
                    }}
                />
            </div>

            <Modal
                title="Chỉnh sửa thông tin dịch vụ"
                open={isEditModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={loading}
                className="custom-modal"
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Dịch vụ"
                        name="title"
                        rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}
                    >
                        <Input
                            style={{
                                width: "100%",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: "10px",
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Giá cơ bản (VND/Giờ)"
                        name="basicPrice"
                        rules={[{ required: true, message: "Vui lòng nhập giá cơ bản!" }]}
                    >
                        <InputNumber
                            step={1000}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                            }
                            parser={(value) => value.replace(/\./g, "")}
                            style={{
                                width: "100%",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: "10px",
                                fontSize: "22px",
                            }}
                        />
                    </Form.Item>
                    <Form.Item label="Phụ phí" name="phuPhi">
                        <InputNumber
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                            }
                            parser={(value) => value.replace(/\./g, "")}
                            style={{
                                width: "100%",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: "10px",
                                fontSize: "22px",
                            }}
                        />
                    </Form.Item>
                    <Form.Item label="Phí Ngoài Giờ (KH)" name="phiNgoaiGioKH">
                        <InputNumber
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                            }
                            parser={(value) => value.replace(/\./g, "")}
                            style={{
                                width: "100%",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: "10px",
                                fontSize: "22px",
                            }}
                        />
                    </Form.Item>
                    <Form.Item label="Phí Ngoài Giờ (NGV)" name="phiNgoaiGioNGV">
                        <InputNumber
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                            }
                            parser={(value) => value.replace(/\./g, "")}
                            style={{
                                width: "100%",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: "10px",
                                fontSize: "22px",
                            }}
                        />
                    </Form.Item>
                    <Form.Item label="Trạng thái" name="status">
                        <Input
                            style={{
                                width: "100%",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: "10px",
                            }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            {showNotification && (
                <NotificationComponent
                    status={showNotification.status}
                    message={showNotification.message}
                    description={showNotification.description}
                />
            )}
            <PopupModalDelete
                isVisible={isDeleteModalVisible}
                onClose={hideDeleteConfirm}
                onDelete={handleDeleteSuccess}
                record={selectedService}
                setLoading={setLoading}
                setShowNotification={setShowNotification}
                serviceToDelete={serviceToDelete}
            />
        </div>
    );
};

export default BodyServiceTable;