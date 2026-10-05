import React, { useState, useEffect } from "react";
import { api } from "./api";
import { User } from "./types";
import { Navbar } from "./components/Navbar";
import { TacticsFeed } from "./components/TacticsFeed";
import { AddTacticModal } from "./components/AddTacticModal";
import { MatchmakingBoard } from "./components/MatchmakingBoard";
import { CreateMatchModal } from "./components/CreateMatchModal";
import { ScoutingPortal } from "./components/ScoutingPortal";
import { CertificatesPortal } from "./components/CertificatesPortal";
import { CoachVerification } from "./components/CoachVerification";
import { AuthModal } from "./components/AuthModal";
import { SettingsModal } from "./components/SettingsModal";
import { Activity, ShieldCheck, Users, Trophy } from "lucide-react";

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("tactics");
  const [loadingUser, setLoadingUser] = useState(true);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddTacticOpen, setIsAddTacticOpen] = useState(false);
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("tactichub_token");
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }
    try {
      const u = await api.getMe();
      setUser(u);
    } catch (err) {
      console.error("Token invalid or expired", err);
      localStorage.removeItem("tactichub_token");
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tactichub_token");
    setUser(null);
    setActiveTab("tactics");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Hero Welcome Banner (Visible if user not signed in or at top of tactics) */}
      {!user && activeTab === "tactics" && (
        <section
          style={{
            textAlign: "center",
            padding: "60px 20px 40px",
            background: "linear-gradient(180deg, rgba(147, 51, 234, 0.08) 0%, transparent 100%)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", background: "rgba(147, 51, 234, 0.15)", border: "1px solid rgba(147, 51, 234, 0.3)", color: "#c084fc", fontSize: "0.82rem", fontWeight: 700, marginBottom: "16px" }}>
              <ShieldCheck size={16} /> NEXT-GEN SPORTS COLLABORATION & MATCHMAKING
            </div>
            <h1 style={{ fontSize: "2.6rem", fontWeight: 800, color: "#fff", lineHeight: "1.2", letterSpacing: "-0.03em", marginBottom: "16px" }}>
              Where Tactics Meet Talent & Verified Coaching
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "28px" }}>
              Share tactical strategies, find free players for competitive pick-up matches, build verified achievement portfolios, and recruit through Computer Vision AI audited coaches.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
              <button onClick={() => setIsAuthOpen(true)} className="btn-primary" style={{ padding: "12px 28px", fontSize: "1rem" }}>
                Join TacticHub Today
              </button>
              <button onClick={() => setActiveTab("matches")} className="btn-secondary" style={{ padding: "12px 24px", fontSize: "1rem" }}>
                Browse Open Matches (LFG)
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Tab Content Area */}
      <main style={{ flex: 1, paddingBottom: "60px" }}>
        {activeTab === "tactics" && (
          <TacticsFeed
            user={user}
            onOpenAddModal={() => setIsAddTacticOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === "matches" && (
          <MatchmakingBoard
            user={user}
            onOpenCreateModal={() => setIsCreateMatchOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === "scouting" && (
          <ScoutingPortal
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onRefreshUser={fetchCurrentUser}
          />
        )}

        {activeTab === "certificates" && (
          <CertificatesPortal
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === "verification" && user?.role === "COACH" && (
          <CoachVerification
            user={user}
            onRefreshUser={fetchCurrentUser}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "30px 20px",
          textAlign: "center",
          background: "rgba(11, 15, 25, 0.9)",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={18} color="#9333ea" />
            <span style={{ fontWeight: 700, color: "#fff" }}>TACTICHUB 2.0</span>
            <span>— The Sports Strategy & Matchmaking Network</span>
          </div>
          <div>
            FastAPI Backend • React 19 • Computer Vision AI Verification
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={fetchCurrentUser}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        user={user}
        onClose={() => setIsSettingsOpen(false)}
        onSuccess={fetchCurrentUser}
      />

      <AddTacticModal
        isOpen={isAddTacticOpen}
        onClose={() => setIsAddTacticOpen(false)}
        onSuccess={() => {}}
      />

      <CreateMatchModal
        isOpen={isCreateMatchOpen}
        onClose={() => setIsCreateMatchOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default App;
