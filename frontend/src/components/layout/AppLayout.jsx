import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./AppLayout.css";

const { Content } = Layout;

export default function AppLayout() {
  return (
    <Layout className="app-layout">
      <Sidebar />
      <Layout>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
