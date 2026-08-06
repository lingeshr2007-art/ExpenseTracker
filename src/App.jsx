// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddTransaction from "./pages/AddTransaction.jsx";
import Transactions from "./pages/Transactions.jsx";
import Analytics from "./pages/Analytics.jsx";
import BudgetPage from "./pages/Budget.jsx";
import FriendsDebtsView from "./components/FriendsDebtsView.jsx";
import SavingsPage from "./pages/SavingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Render Error Caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem("apexfinance_data");
    } catch (e) {
      /* ignore */
    }
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#161824",
            color: "#F8FAFC",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              width: "100%",
              backgroundColor: "#23273C",
              borderRadius: "1.25rem",
              padding: "2rem",
              border: "1px solid #2D324B",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚡</div>
            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                marginBottom: "0.5rem",
                color: "#F8FAFC",
              }}
            >
              NidhiTrack Recovery
            </h2>
            <p
              style={{
                fontSize: "0.88rem",
                color: "#C8C7CD",
                marginBottom: "1.5rem",
                lineHeight: 1.5,
              }}
            >
              A temporary render issue was detected. Click below to restore state and continue seamlessly.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: "#3EC3D5",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "9999px",
                padding: "0.75rem 1.5rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              🔄 Reset App State & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Standalone Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Authenticated Dashboard Shell Layout Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/debts" element={<FriendsDebtsView />} />
            <Route path="/savings" element={<SavingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
