import React, { useState, useEffect } from "react";
import { api } from "../api";
import { MatchRequest, User } from "../types";
import { MapPin, Clock, Users, Plus, CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface MatchmakingBoardProps {
  user: User | null;
  onOpenCreateModal: () => void;
  onOpenAuth: () => void;
}

export const MatchmakingBoard: React.FC<MatchmakingBoardProps> = ({
  user,
  onOpenCreateModal,
  onOpenAuth,
}) => {
  const [matches, setMatches] = useState<MatchRequest[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  const sports = ["All", "Football", "Basketball", "Tennis", "Badminton", "Cricket"];

  const loadMatches = async () => {
    setLoading(true);
    try {
      const data = await api.getMatches({
        sport: selectedSport !== "All" ? selectedSport : undefined,
      });
      setMatches(data);
    } catch (err) {
      console.error("Failed to load matches", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [selectedSport]);

  const handleJoin = async (id: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    try {
      await api.joinMatch(id);
      loadMatches();
    } catch (err: any) {
      alert(err.message || "Could not join match");
    }
  };

  const handleLeave = async (id: string) => {
    try {
      await api.leaveMatch(id);
      loadMatches();
    } catch (err: any) {
      alert(err.message || "Could not leave match");
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Cancel this match broadcast?")) return;
    try {
      await api.cancelMatch(id);
      loadMatches();
    } catch (err: any) {
      alert(err.message || "Failed to cancel");
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            Match LFG & Player Finder
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Find free players looking for matches, pick-up games, or fill remaining roster slots.
          </p>
        </div>

        {user?.role === "PLAYER" ? (
          <button onClick={onOpenCreateModal} className="btn-primary">
            <Plus size={18} /> Post Match Request
          </button>
        ) : !user ? (
          <button onClick={onOpenAuth} className="btn-primary">
            Sign In to Join Matches
          </button>
        ) : null}
      </div>

      {/* Sport Category Filter */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "24px" }}>
        {sports.map((sp) => (
          <button
            key={sp}
            onClick={() => setSelectedSport(sp)}
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              border: selectedSport === sp ? "1px solid var(--accent-blue)" : "1px solid var(--border-subtle)",
              background: selectedSport === sp ? "rgba(59, 130, 246, 0.25)" : "rgba(255, 255, 255, 0.03)",
              color: selectedSport === sp ? "#93c5fd" : "#94a3b8",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {sp}
          </button>
        ))}
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          Loading match requests...
        </div>
      ) : matches.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Users size={40} color="#94a3b8" style={{ marginBottom: "12px" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>No open matches right now</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Be the first to post a game request and recruit local players!
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: "20px" }}>
          {matches.map((m) => {
            const pct = Math.min(100, Math.round((m.slots_filled / m.slots_total) * 100));
            const isFull = m.slots_filled >= m.slots_total;

            return (
              <div
                key={m.id}
                className="glass-panel"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span className="badge badge-player" style={{ fontSize: "0.78rem" }}>
                      {m.sport}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: m.status === "OPEN" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: m.status === "OPEN" ? "#34d399" : "#fca5a5",
                      }}
                    >
                      {m.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>
                    {m.location_name}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px", fontSize: "0.88rem", color: "#cbd5e1" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Clock size={15} color="#3b82f6" />
                      <span>{m.start_time}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin size={15} color="#a855f7" />
                      <span>Level: {m.skill_level}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Users size={15} color="#10b981" />
                      <span>Host: @{m.host_username} {m.host_team ? `(${m.host_team})` : ""}</span>
                    </div>
                  </div>

                  {m.notes && (
                    <div style={{ padding: "10px 12px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", fontSize: "0.82rem", color: "#94a3b8", marginBottom: "18px", fontStyle: "italic" }}>
                      "{m.notes}"
                    </div>
                  )}

                  {/* Slot progress bar */}
                  <div style={{ marginBottom: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                      <span>Roster Occupancy</span>
                      <span style={{ color: isFull ? "#f87171" : "#34d399" }}>
                        {m.slots_filled} / {m.slots_total} Players
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: isFull ? "linear-gradient(to right, #f59e0b, #ef4444)" : "linear-gradient(to right, #3b82f6, #10b981)",
                          borderRadius: "4px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                  {m.is_host ? (
                    <button
                      onClick={() => handleCancel(m.id)}
                      className="btn-secondary"
                      style={{ width: "100%", color: "#f87171", fontSize: "0.88rem" }}
                    >
                      <XCircle size={16} /> Cancel My Broadcast
                    </button>
                  ) : m.has_joined ? (
                    <button
                      onClick={() => handleLeave(m.id)}
                      className="btn-secondary"
                      style={{ width: "100%", color: "#fbbf24", fontSize: "0.88rem" }}
                    >
                      <CheckCircle size={16} color="#34d399" /> Joined (Click to Leave)
                    </button>
                  ) : isFull ? (
                    <button
                      disabled
                      className="btn-secondary"
                      style={{ width: "100%", opacity: 0.5, cursor: "not-allowed", fontSize: "0.88rem" }}
                    >
                      Match Roster Full
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(m.id)}
                      className="btn-primary"
                      style={{ width: "100%", fontSize: "0.88rem" }}
                    >
                      Join This Match
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
