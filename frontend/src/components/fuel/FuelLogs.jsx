import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, InputNumber, Select, message, DatePicker, Space, Popconfirm } from "antd";
import client from "../../api/client";
import dayjs from "dayjs";

export default function FuelLogs() {
  const [data, setData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchLogs = async () => {
    try {
      const res = await client.get("/api/fuel-logs");
      setData(res.data);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load logs.");
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await client.get("/api/vehicles");
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchLogs(), fetchVehicles()]).finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ date: dayjs() });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({
      liters: record.liters,
      cost: record.cost,
      date: record.date ? dayjs(record.date) : dayjs(),
    });
    setModalOpen(true);
  };

  const onFinish = async (values) => {
    try {
      if (editingId) {
        await client.put("/api/fuel-logs/" + editingId, {
          liters: values.liters,
          cost: values.cost,
          date: values.date ? values.date.toISOString() : new Date().toISOString(),
        });
        message.success("Fuel log updated.");
      } else {
        await client.post("/api/fuel-logs", {
          vehicleId: values.vehicleId,
          liters: values.liters,
          cost: values.cost,
          date: values.date ? values.date.toISOString() : new Date().toISOString(),
        });
        message.success("Fuel log added.");
      }
      setModalOpen(false);
      fetchLogs();
    } catch (err) {
      message.error(err.response?.data?.message || "Request failed.");
    }
  };

  const deleteLog = async (id) => {
    try {
      await client.delete("/api/fuel-logs/" + id);
      message.success("Fuel log deleted.");
      fetchLogs();
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed.");
    }
  };

  const columns = [
    { title: "Log ID", key: "id", width: 90, render: (_, r) => (r._id || "").slice(-8).toUpperCase() },
    { title: "Vehicle", key: "vehicle", render: (_, r) => r.vehicleId?.name + " (" + (r.vehicleId?.licensePlate || "") + ")" },
    { title: "Liters", dataIndex: "liters", key: "liters", width: 90 },
    { title: "Cost", dataIndex: "cost", key: "cost", width: 90 },
    { title: "Date", dataIndex: "date", key: "date", render: (d) => d ? dayjs(d).format("YYYY-MM-DD") : "—", width: 110 },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm title="Delete this log?" onConfirm={() => deleteLog(record._id)}>
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1>Expense & Fuel Logging</h1>
        <Button type="primary" onClick={openCreate}>Add Fuel Log</Button>
      </div>
      <Table rowKey="_id" columns={columns} dataSource={data} loading={loading} pagination={{ pageSize: 10 }} />
      <Modal title={editingId ? "Edit Fuel Log" : "Add Fuel Log"} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={480}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {!editingId && (
            <Form.Item name="vehicleId" label="Vehicle" rules={[{ required: true }]}>
              <Select
                placeholder="Select vehicle"
                showSearch
                optionFilterProp="label"
                options={vehicles.map((v) => ({ value: v._id, label: v.name + " (" + v.licensePlate + ")" }))}
              />
            </Form.Item>
          )}
          <Form.Item name="liters" label="Liters" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="cost" label="Cost" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="date" label="Date">
            <DatePicker style={{ width: "100%" }} />
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
