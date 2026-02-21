import React, { useState, useEffect } from "react";
import { Card, Row, Col, Select, Spin, Statistic, Table } from "antd";
import { Link } from "react-router-dom";
import client from "../../api/client";
import StatusBadge from "../common/StatusBadge";

const VEHICLE_TYPES = ["Truck", "Van", "Bike"];
const STATUSES = ["Available", "On Trip", "In Shop", "Out of Service"];

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ vehicleType: undefined, status: undefined, region: "" });

  const fetchKpis = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
      if (filters.status) params.set("status", filters.status);
      if (filters.region) params.set("region", filters.region);
      const res = await client.get("/api/dashboard/kpis?" + params.toString());
      setKpis(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentTrips = async () => {
    try {
      const res = await client.get("/api/trips");
      setRecentTrips((res.data || []).slice(0, 10));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchKpis(), fetchRecentTrips()]).finally(() => setLoading(false));
  }, [filters.vehicleType, filters.status, filters.region]);

  if (loading && !kpis) return <Spin size="large" style={{ display: "block", margin: "40px auto" }} />;

  const recentColumns = [
    { title: "Vehicle", key: "vehicle", render: (_, r) => r.vehicleId?.name || "—" },
    { title: "Driver", key: "driver", render: (_, r) => r.driverId?.name || "—" },
    { title: "Origin", dataIndex: "origin", key: "origin" },
    { title: "Destination", dataIndex: "destination", key: "destination" },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <StatusBadge status={s} /> },
    { title: "Revenue", dataIndex: "revenue", key: "revenue", width: 100, render: (v) => v != null ? v : "—" },
  ];

  return (
    <div style={{ padding: 0 }}>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col>
          <Select
            placeholder="Vehicle Type (Truck, Van, Bike)"
            allowClear
            style={{ width: 200 }}
            value={filters.vehicleType}
            onChange={(v) => setFilters((f) => ({ ...f, vehicleType: v }))}
          >
            {VEHICLE_TYPES.map((t) => (
              <Select.Option key={t} value={t}>{t}</Select.Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 160 }}
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          >
            {STATUSES.map((s) => (
              <Select.Option key={s} value={s}>{s}</Select.Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Select
            placeholder="Region"
            allowClear
            style={{ width: 160 }}
            value={filters.region || undefined}
            onChange={(v) => setFilters((f) => ({ ...f, region: v || "" }))}
            showSearch
            optionFilterProp="children"
          >
            <Select.Option value="">All</Select.Option>
            <Select.Option value="North">North</Select.Option>
            <Select.Option value="South">South</Select.Option>
            <Select.Option value="East">East</Select.Option>
            <Select.Option value="West">West</Select.Option>
          </Select>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Active Fleet" value={kpis?.activeFleet ?? 0} suffix="on trip" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Maintenance Alerts" value={kpis?.maintenanceAlerts ?? 0} suffix="in shop" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Utilization Rate" value={kpis?.utilizationRate ?? 0} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Pending Cargo" value={kpis?.pendingCargo ?? 0} suffix="draft trips" />
          </Card>
        </Col>
      </Row>
      <Card title="Recent Trips" style={{ marginTop: 24 }}>
        <Table
          rowKey="_id"
          columns={recentColumns}
          dataSource={recentTrips}
          pagination={false}
          size="small"
        />
        <div style={{ marginTop: 12 }}>
          <Link to="/trips">View all trips →</Link>
        </div>
      </Card>
    </div>
  );
}
