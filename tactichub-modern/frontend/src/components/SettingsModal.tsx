import React, { useState } from "react";
import { api } from "../api";
import { User } from "../types";
import { X, Settings, Lock, User as UserIcon, Shield, Eye } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState(user?.username || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [bio, setBio] = useState(user?.bio || "");
  const [coachVisibility, setCoachVisibility] = useState(user?.coach_visibility ?? true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const payload: any = {};
    if (username.trim() && username !== user.username) {
      payload.new_username = username.trim();
    }
    if (oldPassword && newPassword) {
      payload.old_password = oldPassword;
      payload.new_password = newPassword;
    }
    if (bio !== user.bio) {
      payload.new_bio = bio;
    }
    if (user.role === "PLAYER" && coachVisibility !== user.coach_visibility) {
      payload.coach_visibility = coachVisibility;
    }

    try {
      await api.updateSettings(payload);
      setMsg({ text: "Profile and credentials updated successfully!", isError: false });
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setMsg({ text: err.message || "Failed to update profile", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <Settings size={20} color="#a855f7" /> Account & Security Settings
          </h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {msg && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px",
              borderRadius: "8px",
              background: msg.isError ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
              border: msg.isError ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(16, 185, 129, 0.4)",
              color: msg.isError ? "#fca5a5" : "#34d399",
              fontSize: "0.88rem",
            }}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
              Username
            </label>
            <input
              type="text"
              className="glass-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
              Update Password
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="password"
                className="glass-input"
                placeholder="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <input
                type="password"
                className="glass-input"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
              Athletic Bio / Coaching Philosophy
            </label>
            <textarea
              rows={3}
              className="glass-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about your sporting journey, achievements, or training focus..."
            />
          </div>

          {user.role === "PLAYER" && (
            <div style={{ padding: "14px", background: "rgba(0,0,0,0.3)", borderRadius: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={coachVisibility}
                  onChange={(e) => setCoachVisibility(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#9333ea" }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>
                    Coach Visibility (Allow Scouting)
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    When checked, coaches can discover your profile and send recruitment trial invitations.
                  </div>
                </div>
              </label>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
