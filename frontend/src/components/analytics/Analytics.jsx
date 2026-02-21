import React, { useState, useEffect } from "react";
import { Card, Table, Button, Space, Spin, message, Modal } from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import client from "../../api/client";

export default function Analytics() {
  const [fuelEfficiency, setFuelEfficiency] = useState([]);
  const [vehicleRoi, setVehicleRoi] = useState([]);
  const [costPerKm, setCostPerKm] = useState([]);
  const [operationalCost, setOperationalCost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailVehicle, setDetailVehicle] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [fe, roi, cpk, op] = await Promise.all([
        client.get("/api/analytics/fuel-efficiency"),
        client.get("/api/analytics/vehicle-roi"),
        client.get("/api/analytics/cost-per-km"),
        client.get("/api/analytics/operational-cost"),
      ]);
      setFuelEfficiency(fe.data || []);
      setVehicleRoi(roi.data || []);
      setCostPerKm(cpk.data || []);
      setOperationalCost(op.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const exportCsv = async (type) => {
    try {
      const res = await client.get("/api/analytics/export/csv?type=" + type, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", "fleetflow-" + type + "-" + Date.now() + ".csv");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success("CSV downloaded.");
    } catch (err) {
      message.error("Export failed.");
    }
  };

  const exportPdf = async (type) => {
    try {
      const res = await client.get("/api/analytics/export/pdf?type=" + type, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", "fleetflow-" + type + "-" + Date.now() + ".pdf");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success("PDF downloaded.");
    } catch (err) {
      message.error("Export failed.");
    }
  };

  const fuelTrendData = fuelEfficiency
    .filter((v) => v.kmPerLiter != null)
    .map((v) => ({ name: (v.vehicleName || v.licensePlate || "").slice(0, 12), kmPerLiter: v.kmPerLiter }));

  const costDistributionData = operationalCost.map((v) => ({
    name: (v.vehicleName || v.licensePlate || "").slice(0, 10),
    fuel: v.totalFuelCost || 0,
    maintenance: v.totalMaintenanceCost || 0,
  }));

  const summaryData = costPerKm.map((v) => {
    const fe = fuelEfficiency.find((f) => f.vehicleId === v.vehicleId);
    const roi = vehicleRoi.find((r) => r.vehicleId === v.vehicleId);
    return {
      vehicleId: v.vehicleId,
      vehicle: v.vehicleName,
      licensePlate: v.licensePlate,
      fuelEff: fe?.kmPerLiter ?? "—",
      roi: roi?.roi ?? "—",
      costPerKm: v.costPerKm ?? "—",
    };
  });

  if (loading) return <Spin size="large" style={{ display: "block", margin: "40px auto" }} />;

  return (
    <div style={{ padding: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1>Analytics & Reports</h1>
        <Space>
          <Button onClick={() => exportCsv("vehicles")}>Export to CSV</Button>
          <Button onClick={() => exportPdf("vehicles")}>Export to PDF</Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Key metrics</h3>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li><strong>Fuel Efficiency:</strong> km / liters</li>
          <li><strong>Vehicle ROI:</strong> (Revenue - (Maintenance + Fuel)) / Acquisition Cost</li>
          <li><strong>Cost per KM:</strong> Total Operational Cost / Total Distance</li>
        </ul>
      </Card>

      {fuelTrendData.length > 0 && (
        <Card title="Fuel Efficiency Trend" style={{ marginBottom: 24 }}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={fuelTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="kmPerLiter" name="Km per Liter" stroke="#1890ff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {costDistributionData.length > 0 && (
        <Card title="Cost Distribution" style={{ marginBottom: 24 }}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={costDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="fuel" name="Fuel Cost" fill="#1890ff" stackId="a" />
              <Bar dataKey="maintenance" name="Maintenance Cost" fill="#52c41a" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card title="Vehicle Performance Summary" style={{ marginBottom: 24 }}>
        <Table
          rowKey="vehicleId"
          size="small"
          columns={[
            { title: "Vehicle", dataIndex: "vehicle" },
            { title: "License", dataIndex: "licensePlate" },
            { title: "Fuel Eff.", dataIndex: "fuelEff" },
            { title: "ROI", dataIndex: "roi" },
            { title: "Cost/KM", dataIndex: "costPerKm" },
            {
              title: "Action",
              key: "action",
              width: 200,
              render: (_, record) => (
                <Space>
                  <Button size="small" onClick={() => setDetailVehicle(record)}>View Detail</Button>
                  <Button size="small" onClick={() => exportCsv("analytics")}>Export CSV</Button>
                  <Button size="small" onClick={() => exportPdf("analytics")}>Export PDF</Button>
                </Space>
              ),
            },
          ]}
          dataSource={summaryData}
          pagination={false}
        />
      </Card>

      <Card title="Fuel Efficiency (km / liters)" style={{ marginBottom: 24 }}>
        <Table
          rowKey="vehicleId"
          size="small"
          columns={[
            { title: "Vehicle", dataIndex: "vehicleName" },
            { title: "License", dataIndex: "licensePlate" },
            { title: "Total Liters", dataIndex: "totalLiters" },
            { title: "Total Km", dataIndex: "totalKm" },
            { title: "Km per Liter", dataIndex: "kmPerLiter" },
          ]}
          dataSource={fuelEfficiency}
          pagination={false}
        />
      </Card>

      <Card title="Vehicle ROI" style={{ marginBottom: 24 }}>
        <Table
          rowKey="vehicleId"
          size="small"
          columns={[
            { title: "Vehicle", dataIndex: "vehicleName" },
            { title: "License", dataIndex: "licensePlate" },
            { title: "Revenue", dataIndex: "revenue" },
            { title: "Total Operational Cost", dataIndex: "totalOperationalCost" },
            { title: "Acquisition Cost", dataIndex: "acquisitionCost" },
            { title: "ROI", dataIndex: "roi" },
          ]}
          dataSource={vehicleRoi}
          pagination={false}
        />
      </Card>

      <Card title="Cost per KM">
        <Table
          rowKey="vehicleId"
          size="small"
          columns={[
            { title: "Vehicle", dataIndex: "vehicleName" },
            { title: "License", dataIndex: "licensePlate" },
            { title: "Total Distance (km)", dataIndex: "totalDistance" },
            { title: "Total Operational Cost", dataIndex: "totalOperationalCost" },
            { title: "Cost per KM", dataIndex: "costPerKm" },
          ]}
          dataSource={costPerKm}
          pagination={false}
        />
      </Card>

      <Modal
        title="Vehicle detail"
        open={!!detailVehicle}
        onCancel={() => setDetailVehicle(null)}
        footer={<Button onClick={() => setDetailVehicle(null)}>Close</Button>}
      >
        {detailVehicle && (
          <div style={{ display: "grid", gap: 8 }}>
            <p><strong>Vehicle:</strong> {detailVehicle.vehicle}</p>
            <p><strong>License:</strong> {detailVehicle.licensePlate}</p>
            <p><strong>Fuel Efficiency (km/L):</strong> {detailVehicle.fuelEff}</p>
            <p><strong>ROI:</strong> {detailVehicle.roi}</p>
            <p><strong>Cost per KM:</strong> {detailVehicle.costPerKm}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
