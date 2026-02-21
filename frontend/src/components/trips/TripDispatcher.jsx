import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, message } from "antd";
import client from "../../api/client";
import StatusBadge from "../common/StatusBadge";

export default function TripDispatcher() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewTrip, setViewTrip] = useState(null);
  const [form] = Form.useForm();
  const selectedVehicleId = Form.useWatch("vehicleId", form);

  const fetchTrips = async () => {
    try {
      const res = await client.get("/api/trips");
      setTrips(res.data);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load trips.");
    }
  };

  const fetchAvailable = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        client.get("/api/vehicles/available"),
        client.get("/api/drivers/available"),
      ]);
      setVehicles(vRes.data);
      setDrivers(dRes.data);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load options.");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchTrips(), fetchAvailable()]).finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ status: "Draft" });
    setModalOpen(true);
    fetchAvailable();
  };

  const onFinish = async (values) => {
    try {
      await client.post("/api/trips", {
        vehicleId: values.vehicleId,
        driverId: values.driverId,
        cargoWeight: values.cargoWeight,
        origin: values.origin,
        destination: values.destination,
        revenue: values.revenue || 0,
        distance: values.distance || 0,
      });
      message.success("Trip created. You can dispatch it from the table.");
      setModalOpen(false);
      fetchTrips();
      fetchAvailable();
    } catch (err) {
      message.error(err.response?.data?.message || "Trip creation failed.");
    }
  };

  const updateStatus = async (tripId, status) => {
    try {
      await client.patch("/api/trips/" + tripId + "/status", { status });
      message.success("Status updated.");
      fetchTrips();
      fetchAvailable();
    } catch (err) {
      message.error(err.response?.data?.message || "Update failed.");
    }
  };

  const driversForVehicle = (vehicleId) => {
    const vehicle = vehicles.find((v) => v._id === vehicleId);
    if (!vehicle) return drivers;
    return drivers.filter((d) => d.allowedVehicleType && d.allowedVehicleType.includes(vehicle.vehicleType));
  };

  const columns = [
    { title: "Trip ID", key: "tripId", width: 90, render: (_, r) => (r._id || "").slice(-8).toUpperCase() },
    { title: "Vehicle", key: "vehicle", render: (_, r) => r.vehicleId?.name + " (" + (r.vehicleId?.licensePlate || "") + ")" },
    { title: "Driver", key: "driver", render: (_, r) => r.driverId?.name },
    { title: "Origin", dataIndex: "origin", key: "origin" },
    { title: "Destination", dataIndex: "destination", key: "destination" },
    { title: "Cargo (kg)", dataIndex: "cargoWeight", key: "cargoWeight", width: 90 },
    { title: "Revenue", dataIndex: "revenue", key: "revenue", width: 90 },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <StatusBadge status={s} /> },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" onClick={() => setViewTrip(record)}>View</Button>
          {record.status === "Draft" && (
            <Button size="small" type="primary" onClick={() => updateStatus(record._id, "Dispatched")}>
              Dispatch
            </Button>
          )}
          {record.status === "Dispatched" && (
            <Button size="small" type="primary" onClick={() => updateStatus(record._id, "Completed")}>
              Complete
            </Button>
          )}
          {(record.status === "Draft" || record.status === "Dispatched") && (
            <Button size="small" onClick={() => updateStatus(record._id, "Cancelled")}>Cancel</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1>Trip Dispatcher</h1>
        <Button type="primary" onClick={openCreate}>Create Trip</Button>
      </div>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={trips}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title="Create Trip"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="vehicleId" label="Vehicle" rules={[{ required: true }]}>
            <Select
              placeholder="Available only (excludes In Shop / Out of Service)"
              showSearch
              optionFilterProp="label"
              options={vehicles.map((v) => ({ value: v._id, label: `${v.name} (${v.licensePlate}) – ${v.maxLoadCapacity} kg max` }))}
            />
          </Form.Item>
          <Form.Item name="driverId" label="Driver" rules={[{ required: true }]}>
            <Select
              placeholder="Available drivers (filtered by vehicle type)"
              showSearch
              optionFilterProp="label"
              options={(selectedVehicleId ? driversForVehicle(selectedVehicleId) : drivers).map((d) => ({ value: d._id, label: d.name + (d.licenseExpiryDate ? " (Lic: " + new Date(d.licenseExpiryDate).toLocaleDateString() + ")" : "") }))}
            />
          </Form.Item>
          <Form.Item name="cargoWeight" label="Cargo Weight (kg)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} placeholder="Must not exceed vehicle max load" />
          </Form.Item>
          <Form.Item name="origin" label="Origin" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="destination" label="Destination" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="revenue" label="Revenue">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="distance" label="Distance (km)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Create Trip</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setModalOpen(false)}>Cancel</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Trip Details"
        open={!!viewTrip}
        onCancel={() => setViewTrip(null)}
        footer={<Button onClick={() => setViewTrip(null)}>Close</Button>}
        width={480}
      >
        {viewTrip && (
          <div style={{ display: "grid", gap: 8 }}>
            <p><strong>Trip ID:</strong> {(viewTrip._id || "").slice(-8).toUpperCase()}</p>
            <p><strong>Vehicle:</strong> {viewTrip.vehicleId?.name} ({viewTrip.vehicleId?.licensePlate})</p>
            <p><strong>Driver:</strong> {viewTrip.driverId?.name}</p>
            <p><strong>Origin:</strong> {viewTrip.origin}</p>
            <p><strong>Destination:</strong> {viewTrip.destination}</p>
            <p><strong>Cargo (kg):</strong> {viewTrip.cargoWeight}</p>
            <p><strong>Revenue:</strong> {viewTrip.revenue ?? "—"}</p>
            <p><strong>Distance (km):</strong> {viewTrip.distance ?? "—"}</p>
            <p><strong>Status:</strong> <StatusBadge status={viewTrip.status} /></p>
          </div>
        )}
      </Modal>
    </div>
  );
}
