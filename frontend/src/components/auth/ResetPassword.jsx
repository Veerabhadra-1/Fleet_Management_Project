import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import client from "../../api/client";

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setToken(searchParams.get("token") || "");
  }, [searchParams]);

  const onFinish = async (values) => {
    if (!token) {
      message.error("Invalid reset link.");
      return;
    }
    setLoading(true);
    try {
      await client.post("/api/auth/reset-password", { token, newPassword: values.newPassword });
      message.success("Password reset. You can log in now.");
      window.location.href = "/login";
    } catch (err) {
      message.error(err.response?.data?.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
        <Card title="Invalid link">
          <p>This reset link is invalid or expired.</p>
          <Link to="/forgot-password">Request a new link</Link>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <Card title="FleetFlow – Set new password">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="newPassword"
            label="New password"
            rules={[{ required: true }, { min: 6 }]}
          >
            <Input.Password placeholder="Min 6 characters" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Confirm password"
            dependencies={["newPassword"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                  return Promise.reject(new Error("Passwords do not match."));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Reset password
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
