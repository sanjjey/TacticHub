import React, { useState } from "react";
import { api } from "../api";
import { UserRole } from "../types";
import { X, ShieldCheck, User as UserIcon, Lock, Mail, Users } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>("PLAYER");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [team, setTeam] = useState("");
  const [organization, setOrganization] = useState("");
  const [sport, setSport] = useState("Football");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const payload: any = {
          username,
          password,
          email,
          role,
          full_name: fullName,
          age: age ? Number(age) : undefined,
        };
        if (role === "PLAYER") {
          payload.team = team;
          payload.primary_sport = sport;
        } else {
          payload.organization_name = organization;
        }
        const res = await api.register(payload);
        localStorage.setItem("tactichub_token", res.access_token);
      } else {
        const res = await api.login(username, password);
        localStorage.setItem("tactichub_token", res.access_token);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (u: string, p: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(u, p);
      localStorage.setItem("tactichub_token", res.access_token);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>
            {isRegister ? "Join TacticHub" : "Welcome Back"}
          </h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Toggle Mode */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", background: "rgba(0,0,0,0.3)", padding: "4px", borderRadius: "10px" }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            style={{
              flex: 1,
              padding: "8px",
              border: "none",
              borderRadius: "8px",
              background: !isRegister ? "var(--accent-purple)" : "transparent",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            style={{
              flex: 1,
              padding: "8px",
              border: "none",
              borderRadius: "8px",
              background: isRegister ? "var(--accent-purple)" : "transparent",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </div>

        {/* Demo Fast Login Buttons */}
        {!isRegister && (
          <div style={{ marginBottom: "20px", padding: "12px", background: "rgba(147, 51, 234, 0.1)", borderRadius: "12px", border: "1px dashed rgba(147, 51, 234, 0.4)" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#c084fc", textTransform: "uppercase", marginBottom: "8px" }}>
              Quick Demo Logins
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => handleDemoLogin("coach_alex", "coach123")}
                className="btn-secondary"
                style={{ fontSize: "0.8rem", padding: "6px 12px" }}
              >
                <ShieldCheck size={14} color="#a855f7" /> Coach Alex (Verified)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("striker_leo", "player123")}
                className="btn-secondary"
                style={{ fontSize: "0.8rem", padding: "6px 12px" }}
              >
                <UserIcon size={14} color="#3b82f6" /> Striker Leo (Player)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("hoops_jordan", "player123")}
                className="btn-secondary"
                style={{ fontSize: "0.8rem", padding: "6px 12px" }}
              >
                <Users size={14} color="#10b981" /> Jordan (Private Visibility)
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginBottom: "16px", padding: "10px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "8px", color: "#fca5a5", fontSize: "0.88rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                Select Role
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setRole("PLAYER")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: role === "PLAYER" ? "2px solid #3b82f6" : "1px solid var(--border-subtle)",
                    background: role === "PLAYER" ? "rgba(59, 130, 246, 0.15)" : "transparent",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Player
                </button>
                <button
                  type="button"
                  onClick={() => setRole("COACH")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: role === "COACH" ? "2px solid #9333ea" : "1px solid var(--border-subtle)",
                    background: role === "COACH" ? "rgba(147, 51, 234, 0.15)" : "transparent",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Coach
                </button>
              </div>
            </div>
          )}

          {isRegister && (
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                Email
              </label>
              <input
                type="email"
                required
                className="glass-input"
                placeholder="athlete@tactichub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
              Username
            </label>
            <input
              type="text"
              required
              className="glass-input"
              placeholder="e.g. striker99"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              required
              className="glass-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                  Full Name & Age
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Full Legal Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <input
                    type="number"
                    className="glass-input"
                    style={{ width: "90px" }}
                    placeholder="Age"
                    value={age || ""}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>

              {role === "PLAYER" ? (
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                    Team & Primary Sport
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="Current Team / Free Agent"
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                    />
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="Football / Basketball"
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                    Coaching Center / Organization
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. Apex Sports Academy"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", marginTop: "10px", padding: "12px" }}
            disabled={loading}
          >
            {loading ? "Processing..." : isRegister ? "Complete Registration" : "Sign In to Account"}
          </button>
        </form>
      </div>
    </div>
  );
};
