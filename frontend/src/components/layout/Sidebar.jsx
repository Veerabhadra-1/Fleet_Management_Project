import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import {
  DashboardOutlined,
  CarOutlined,
  SendOutlined,
  ToolOutlined,
  FuelOutlined,
  TeamOutlined,
  BarChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const { Sider } = Layout;

const menuItems = [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/vehicles", icon: <CarOutlined />, label: "Vehicle Registry" },
  { key: "/trips", icon: <SendOutlined />, label: "Trip Dispatcher" },
  { key: "/maintenance", icon: <ToolOutlined />, label: "Maintenance & Service" },
  { key: "/fuel", icon: <FuelOutlined />, label: "Fuel & Expense" },
  { key: "/drivers", icon: <TeamOutlined />, label: "Driver Management" },
  { key: "/analytics", icon: <BarChartOutlined />, label: "Analytics & Reports" },
  { key: "/account", icon: <UserOutlined />, label: "Account" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sider theme="dark" width={240} className="fleetflow-sidebar">
      <div className="sidebar-logo">FleetFlow</div>
      <Menu
        theme="dark"
        selectedKeys={[location.pathname]}
        mode="inline"
        items={menuItems.map((item) => ({
          ...item,
          label: <Link to={item.key}>{item.label}</Link>,
        }))}
        style={{ flex: 1 }}
      />
      <div className="sidebar-footer">
        <span className="sidebar-role">{user?.role}</span>
        <Button type="link" onClick={handleLogout} className="sidebar-logout">
          Sign Out
        </Button>
      </div>
    </Sider>
  );
}
