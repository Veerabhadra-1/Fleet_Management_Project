import React from "react";
import { Tag } from "antd";

const statusColors = {
  Available: "green",
  "On Trip": "blue",
  "In Shop": "orange",
  "Out of Service": "red",
  Draft: "default",
  Dispatched: "processing",
  Completed: "success",
  Cancelled: "red",
  "On Duty": "blue",
  "Off Duty": "default",
  Suspended: "red",
};

export default function StatusBadge({ status }) {
  const color = statusColors[status] || "default";
  return <Tag color={color}>{status || "—"}</Tag>;
}
