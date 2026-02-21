import "./App.css";
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./components/dashboard/Dashboard";
import VehicleRegistry from "./components/vehicles/VehicleRegistry";
import TripDispatcher from "./components/trips/TripDispatcher";
import DriverManagement from "./components/drivers/DriverManagement";
import ServiceLogs from "./components/maintenance/ServiceLogs";
import FuelLogs from "./components/fuel/FuelLogs";
import Analytics from "./components/analytics/Analytics";
import Account from "./components/account/Account";
import Home from "./component/listpage/list";

const roles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        element={
          <ProtectedRoute roles={roles}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="vehicles" element={<VehicleRegistry />} />
        <Route path="trips" element={<TripDispatcher />} />
        <Route path="drivers" element={<DriverManagement />} />
        <Route path="maintenance" element={<ServiceLogs />} />
        <Route path="fuel" element={<FuelLogs />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="account" element={<Account />} />
      </Route>
      <Route path="/legacy" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  );
}

export default App;
