import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, message, Popconfirm } from "antd";
import client from "../../api/client";
import StatusBadge from "../common/StatusBadge";
import { VEHICLE_TYPES, VEHICLE_STATUS } from "./constants";

export default function VehicleRegistry() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ vehicleType: undefined, status: undefined });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
      if (filters.status) params.set("status", filters.status);
      const res = await client.get("/api/vehicles?" + params.toString());
      setData(res.data);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [filters.vehicleType, filters.status]);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ status: "Available", vehicleType: "Truck" });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({
      name: record.name,
      model: record.model,
      licensePlate: record.licensePlate,
      vehicleType: record.vehicleType,
      maxLoadCapacity: record.maxLoadCapacity,
      odometer: record.odometer,
      status: record.status,
      region: record.region,
      acquisitionCost: record.acquisitionCost,
    });
    setModalOpen(true);
  };

  const onFinish = async (values) => {
    try {
      if (editingId) {
        await client.put("/api/vehicles/" + editingId, values);
        message.success("Vehicle updated.");
      } else {
        await client.post("/api/vehicles", values);
        message.success("Vehicle added.");
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      message.error(err.response?.data?.message || "Request failed.");
    }
  };

  const setOutOfService = async (id, outOfService) => {
    try {
      await client.put("/api/vehicles/" + id, { outOfService });
      message.success(outOfService ? "Marked out of service." : "Marked available.");
      fetchVehicles();
    } catch (err) {
      message.error(err.response?.data?.message || "Request failed.");
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await client.delete("/api/vehicles/" + id);
      message.success("Vehicle deleted.");
      fetchVehicles();
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed.");
    }
  };

  const columns = [
    { title: "ID", key: "id", width: 90, render: (_, r) => (r._id || "").slice(-8).toUpperCase() },
    { title: "Name / Model", key: "nameModel", render: (_, r) => [r.name, r.model].filter(Boolean).join(" / ") || "—" },
    { title: "License Plate", dataIndex: "licensePlate", key: "licensePlate" },
    { title: "Type", dataIndex: "vehicleType", key: "vehicleType" },
    { title: "Max Load (kg)", dataIndex: "maxLoadCapacity", key: "maxLoadCapacity", width: 110 },
    { title: "Odometer", dataIndex: "odometer", key: "odometer", width: 100 },
    { title: "Acquisition Cost", dataIndex: "acquisitionCost", key: "acquisitionCost", width: 120, render: (v) => v != null ? v : "—" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status} />,
    },
    { title: "Region", dataIndex: "region", key: "region" },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>Edit</Button>
          {record.status === "Out of Service" ? (
            <Button size="small" onClick={() => setOutOfService(record._id, false)}>Set Available</Button>
          ) : (
            <Button size="small" danger onClick={() => setOutOfService(record._id, true)}>Out of Service</Button>
          )}
          <Popconfirm title="Delete this vehicle?" onConfirm={() => deleteVehicle(record._id)}>
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1>Vehicle Registry</h1>
        <Space>
          <Select
            placeholder="Type"
            allowClear
            style={{ width: 100 }}
            value={filters.vehicleType}
            onChange={(v) => setFilters((f) => ({ ...f, vehicleType: v }))}
          >
            {VEHICLE_TYPES.map((t) => <Select.Option key={t} value={t}>{t}</Select.Option>)}
          </Select>
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 130 }}
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          >
            {VEHICLE_STATUS.map((s) => <Select.Option key={s} value={s}>{s}</Select.Option>)}
          </Select>
          <Button type="primary" onClick={openCreate}>Add Vehicle</Button>
        </Space>
      </div>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingId ? "Edit Vehicle" : "Add Vehicle"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Name / Model" rules={[{ required: true }]}>
            <Input placeholder="e.g. Van-05" />
          </Form.Item>
          <Form.Item name="model" label="Model (optional)">
            <Input placeholder="Model name" />
          </Form.Item>
          <Form.Item name="licensePlate" label="License Plate (must be unique)" rules={[{ required: true }]}>
            <Input placeholder="Unique plate" />
          </Form.Item>
          <Form.Item name="vehicleType" label="Vehicle Type" rules={[{ required: true }]}>
            <Select>
              {VEHICLE_TYPES.map((t) => <Select.Option key={t} value={t}>{t}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="maxLoadCapacity" label="Max Load Capacity (kg)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="odometer" label="Odometer">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              {VEHICLE_STATUS.map((s) => <Select.Option key={s} value={s}>{s}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="region" label="Region">
            <Input placeholder="Region" />
          </Form.Item>
          <Form.Item name="acquisitionCost" label="Acquisition Cost">
            <InputNumber min={0} style={{ width: "100%" }} />
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
