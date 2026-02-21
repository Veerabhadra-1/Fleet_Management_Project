import React from "react";
import { Card, Descriptions, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ marginBottom: 24 }}>Account</h1>
      <Card title="Profile">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Name">{user.name || "—"}</Descriptions.Item>
          <Descriptions.Item label="Role">{user.role}</Descriptions.Item>
        </Descriptions>
        <div style={{ marginTop: 16 }}>
          <Button type="primary" danger onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
