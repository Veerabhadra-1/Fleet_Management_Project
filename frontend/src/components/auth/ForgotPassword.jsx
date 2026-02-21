import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { Link } from "react-router-dom";
import client from "../../api/client";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await client.post("/api/auth/forgot-password", { email: values.email });
      setSent(true);
      message.success("If an account exists, a reset link has been sent.");
    } catch (err) {
      message.error(err.response?.data?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
        <Card title="Check your email">
          <p>If an account exists for that email, we sent a password reset link.</p>
          <Link to="/login">Back to login</Link>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <Card title="FleetFlow – Forgot password">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: "email" }]}>
            <Input placeholder="you@company.com" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Send Reset Link
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            <Link to="/login">Back to login</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
