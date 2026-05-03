import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Dashboard",
      description: "View your task stats, overdue tasks and project progress",
      icon: "📊",
      color: "#3b82f6",
      path: "/dashboard"
    },
    {
      title: "Projects",
      description: "Create and manage your projects, assign team members",
      icon: "📁",
      color: "#8b5cf6",
      path: "/projects"
    },
    {
      title: "My Tasks",
      description: "View all tasks assigned to you across all projects",
      icon: "✅",
      color: "#10b981",
      path: "/projects"
    }
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9", padding: "40px 24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#1e293b", margin: 0 }}>
            Welcome back 👋
          </h1>
          <p style={{ color: "#64748b", marginTop: "8px", fontSize: "16px" }}>
            What would you like to do today?
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "32px 24px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                borderTop: "4px solid " + card.color
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>{card.icon}</div>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#1e293b", margin: "0 0 8px 0" }}>
                {card.title}
              </h2>
              <p style={{ color: "#64748b", margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
                {card.description}
              </p>
              <div style={{ marginTop: "20px", color: card.color, fontWeight: "bold", fontSize: "14px" }}>
                Go to {card.title} →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
