import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, DatePicker } from "antd";
import client from "../../api/client";
import StatusBadge from "../common/StatusBadge";
import { VEHICLE_TYPES } from "../vehicles/constants";
import dayjs from "dayjs";

const DRIVER_STATUS = ["On Duty", "Off Duty", "Suspended"];

export default function DriverManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await client.get("/api/drivers");
      setData(res.data);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load drivers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ status: "Off Duty", allowedVehicleType: ["Truck"] });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({
      name: record.name,
      licenseNumber: record.licenseNumber,
      licenseExpiryDate: record.licenseExpiryDate ? dayjs(record.licenseExpiryDate) : null,
      allowedVehicleType: record.allowedVehicleType || [],
      status: record.status,
      safetyScore: record.safetyScore,
      email: record.email,
      phone: record.phone,
    });
    setModalOpen(true);
  };

  const onFinish = async (values) => {
    try {
      const payload = {
        ...values,
        licenseExpiryDate: values.licenseExpiryDate ? values.licenseExpiryDate.toISOString() : undefined,
      };
      if (editingId) {
        await client.put("/api/drivers/" + editingId, payload);
        message.success("Driver updated.");
      } else {
        await client.post("/api/drivers", payload);
        message.success("Driver added.");
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) {
      message.error(err.response?.data?.message || "Request failed.");
    }
  };

  const deleteDriver = async (id) => {
    try {
      await client.delete("/api/drivers/" + id);
      message.success("Driver deleted.");
      fetchDrivers();
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed.");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "License #", dataIndex: "licenseNumber", key: "licenseNumber" },
    {
      title: "License Expiry",
      dataIndex: "licenseExpiryDate",
      key: "licenseExpiryDate",
      render: (d) => d ? dayjs(d).format("YYYY-MM-DD") : "—",
    },
    {
      title: "Allowed Types",
      dataIndex: "allowedVehicleType",
      key: "allowedVehicleType",
      render: (arr) => (Array.isArray(arr) ? arr.join(", ") : "—"),
    },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <StatusBadge status={s} /> },
    { title: "Safety Score", dataIndex: "safetyScore", key: "safetyScore", width: 100 },
    { title: "Trips Done", dataIndex: "tripsCompleted", key: "tripsCompleted", width: 90 },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm title="Delete this driver?" onConfirm={() => deleteDriver(record._id)}>
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1>Driver Management</h1>
        <Button type="primary" onClick={openCreate}>Add Driver</Button>
      </div>
      <Table rowKey="_id" columns={columns} dataSource={data} loading={loading} pagination={{ pageSize: 10 }} />
      <Modal title={editingId ? "Edit Driver" : "Add Driver"} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={520}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="licenseNumber" label="License Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="licenseExpiryDate" label="License Expiry" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="allowedVehicleType" label="Allowed Vehicle Type(s)" rules={[{ required: true }]}>
            <Select mode="multiple" options={VEHICLE_TYPES.map((t) => ({ value: t, label: t }))} />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={DRIVER_STATUS.map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item name="safetyScore" label="Safety Score (0-100)">
            <Input type="number" min={0} max={100} />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Save</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setModalOpen(false)}>Cancel</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
