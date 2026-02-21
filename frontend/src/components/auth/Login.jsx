import React, { useState } from "react";
import { Form, Input, Button, Card, message, Checkbox } from "antd";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();
  if (user) return <Navigate to="/" replace />;

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password, values.remember === true);
      message.success("Logged in successfully.");
      navigate("/", { replace: true });
    } catch (err) {
      message.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <Card title="FleetFlow – Sign in" bordered={false}>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ remember: true }}>
          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: "email" }]}>
            <Input placeholder="you@company.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember Me</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Sign In
            </Button>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="link" htmlType="button" block style={{ padding: 0 }}>
              <Link to="/forgot-password">Forgot Password</Link>
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
