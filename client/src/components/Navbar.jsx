import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 24px",
      backgroundColor: "#1e293b",
      color: "white",
      marginBottom: "24px"
    }}>
      <div style={{ display: "flex", gap: "24px" }}>
        <Link to="/home" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Home</Link>
        <Link to="/dashboard" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Dashboard</Link>
        <Link to="/projects" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Projects</Link>
      </div>
      <button onClick={handleLogout} style={{
        backgroundColor: "#ef4444",
        color: "white",
        border: "none",
        padding: "8px 16px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold"
      }}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
