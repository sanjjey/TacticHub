import React from "react";
import { User } from "../types";
import { 
  Trophy, 
  Users, 
  Compass, 
  Award, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  LogIn,
  Activity
} from "lucide-react";

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenSettings,
  onLogout,
}) => {
  return (
    <header style={{
      borderBottom: "1px solid var(--border-subtle)",
      background: "rgba(11, 15, 25, 0.8)",
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      padding: "14px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }}>
      {/* Brand Logo */}
      <div 
        onClick={() => setActiveTab("tactics")}
        style={{
          display: "flex", 
          alignItems: "center", 
          gap: "12px", 
          cursor: "pointer",
          userSelect: "none"
        }}
      >
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #9333ea, #3b82f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 20px rgba(147, 51, 234, 0.4)"
        }}>
          <Activity size={22} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em", color: "#fff" }}>
            TACTIC<span style={{ color: "#a855f7" }}>HUB</span>
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Sports Collab & AI Verification
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <nav style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          onClick={() => setActiveTab("tactics")}
          style={{
            background: activeTab === "tactics" ? "rgba(147, 51, 234, 0.2)" : "transparent",
            color: activeTab === "tactics" ? "#c084fc" : "#94a3b8",
            border: activeTab === "tactics" ? "1px solid rgba(147, 51, 234, 0.4)" : "1px solid transparent",
            borderRadius: "10px",
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          <Trophy size={16} /> Tactics
        </button>

        <button
          onClick={() => setActiveTab("matches")}
          style={{
            background: activeTab === "matches" ? "rgba(59, 130, 246, 0.2)" : "transparent",
            color: activeTab === "matches" ? "#60a5fa" : "#94a3b8",
            border: activeTab === "matches" ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid transparent",
            borderRadius: "10px",
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          <Users size={16} /> Match LFG
        </button>

        <button
          onClick={() => setActiveTab("scouting")}
          style={{
            background: activeTab === "scouting" ? "rgba(16, 185, 129, 0.2)" : "transparent",
            color: activeTab === "scouting" ? "#34d399" : "#94a3b8",
            border: activeTab === "scouting" ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid transparent",
            borderRadius: "10px",
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          <Compass size={16} /> Scouting
        </button>

        <button
          onClick={() => setActiveTab("certificates")}
          style={{
            background: activeTab === "certificates" ? "rgba(245, 158, 11, 0.2)" : "transparent",
            color: activeTab === "certificates" ? "#fbbf24" : "#94a3b8",
            border: activeTab === "certificates" ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid transparent",
            borderRadius: "10px",
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          <Award size={16} /> Certificates
        </button>

        {user?.role === "COACH" && (
          <button
            onClick={() => setActiveTab("verification")}
            style={{
              background: activeTab === "verification" ? "rgba(236, 72, 153, 0.2)" : "transparent",
              color: activeTab === "verification" ? "#f472b6" : "#94a3b8",
              border: activeTab === "verification" ? "1px solid rgba(236, 72, 153, 0.4)" : "1px solid transparent",
              borderRadius: "10px",
              padding: "8px 16px",
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <ShieldCheck size={16} /> AI Verification
          </button>
        )}
      </nav>

      {/* User Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {user ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={`badge ${user.role === "COACH" ? "badge-coach" : "badge-player"}`}>
                {user.role}
              </span>
              {user.role === "COACH" && user.verification_status === "VERIFIED" && (
                <span className="badge badge-verified" title="Credential Verified by CV AI">
                  ✓ VERIFIED
                </span>
              )}
              <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e2e8f0" }}>
                @{user.username}
              </span>
            </div>

            <button 
              onClick={onOpenSettings}
              className="btn-secondary"
              style={{ padding: "8px 12px" }}
              title="Settings & Privacy"
            >
              <Settings size={16} />
            </button>

            <button 
              onClick={onLogout}
              className="btn-secondary"
              style={{ padding: "8px 12px", color: "#f87171" }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <button onClick={onOpenAuth} className="btn-primary">
            <LogIn size={16} /> Get Started
          </button>
        )}
      </div>
    </header>
  );
};
