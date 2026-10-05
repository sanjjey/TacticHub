import React, { useState, useEffect } from "react";
import { api } from "../api";
import { User, ScoutPlayer, RecruitmentInvite } from "../types";
import { 
  Compass, 
  Send, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Award, 
  ShieldCheck, 
  Clock, 
  UserCheck,
  Search,
  MessageSquare
} from "lucide-react";

interface ScoutingPortalProps {
  user: User | null;
  onOpenAuth: () => void;
  onRefreshUser: () => void;
}

export const ScoutingPortal: React.FC<ScoutingPortalProps> = ({
  user,
  onOpenAuth,
  onRefreshUser,
}) => {
  const [players, setPlayers] = useState<ScoutPlayer[]>([]);
  const [invites, setInvites] = useState<RecruitmentInvite[]>([]);
  const [sportFilter, setSportFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Invite modal state for Coach
  const [selectedPlayer, setSelectedPlayer] = useState<ScoutPlayer | null>(null);
  const [playerDetail, setPlayerDetail] = useState<any>(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.role === "COACH") {
        const [scoutPlayers, myInvites] = await Promise.all([
          api.getScoutablePlayers(sportFilter || undefined),
          api.getMyInvites(),
        ]);
        setPlayers(scoutPlayers);
        setInvites(myInvites);
      } else if (user?.role === "PLAYER") {
        const myInvites = await api.getMyInvites();
        setInvites(myInvites);
      }
    } catch (err: any) {
      console.error("Scouting data error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, sportFilter]);

  const handleToggleVisibility = async () => {
    if (!user) return;
    try {
      await api.updateSettings({
        coach_visibility: !user.coach_visibility,
      });
      onRefreshUser();
    } catch (err: any) {
      alert(err.message || "Failed to toggle visibility");
    }
  };

  const handleViewPlayer = async (p: ScoutPlayer) => {
    setSelectedPlayer(p);
    setInviteMessage(`Hi ${p.full_name || p.username}, I reviewed your sports profile and certificates. I would like to invite you for a coaching trial at our center.`);
    setInviteSuccess(null);
    setError(null);
    try {
      const detail = await api.getPlayerDetail(p.player_id);
      setPlayerDetail(detail);
    } catch (err: any) {
      setError(err.message || "Could not view player details");
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    setSendingInvite(true);
    setError(null);
    try {
      await api.sendInvite(selectedPlayer.player_id, inviteMessage);
      setInviteSuccess(`Recruitment invite dispatched to @${selectedPlayer.username}!`);
      loadData();
      setTimeout(() => {
        setSelectedPlayer(null);
        setPlayerDetail(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to send recruitment invite");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRespondInvite = async (inviteId: string, action: "ACCEPTED" | "DECLINED") => {
    try {
      await api.respondToInvite(inviteId, action);
      loadData();
    } catch (err: any) {
      alert(err.message || "Could not process response");
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: "800px", margin: "60px auto", textAlign: "center", padding: "40px" }} className="glass-panel">
        <Compass size={48} color="#10b981" style={{ marginBottom: "16px" }} />
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "10px" }}>Coach Scouting & Recruitment Hub</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
          Sign in to discover scoutable players, view verified certificates, and exchange direct coaching trial invites.
        </p>
        <button onClick={onOpenAuth} className="btn-primary">
          Sign In to Access Scouting
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px" }}>
      {/* Role-Specific Header */}
      {user.role === "PLAYER" ? (
        <div>
          {/* Privacy Visibility Switcher Banner */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: "24px", 
              marginBottom: "30px", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              flexWrap: "wrap",
              gap: "20px",
              border: user.coach_visibility ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
              background: user.coach_visibility ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                {user.coach_visibility ? (
                  <Eye size={22} color="#34d399" />
                ) : (
                  <EyeOff size={22} color="#f87171" />
                )}
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                  Coach Visibility: {user.coach_visibility ? "ENABLED (Visible to Coaches)" : "DISABLED (Hidden / Private)"}
                </h2>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "600px" }}>
                {user.coach_visibility
                  ? "Coaches can review your athletic profile, verified certificates, and dispatch recruitment trial invitations to you."
                  : "You are invisible in the coach scout directory. Coaches cannot view your achievements or send you invitations."}
              </p>
            </div>

            <button
              onClick={handleToggleVisibility}
              className={user.coach_visibility ? "btn-secondary" : "btn-primary"}
              style={{ padding: "10px 18px", fontSize: "0.9rem" }}
            >
              {user.coach_visibility ? "Switch to Private Mode" : "Enable Coach Visibility"}
            </button>
          </div>

          {/* Player Invites Inbox */}
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <MessageSquare size={20} color="#a855f7" /> Coaching Invites Received ({invites.length})
          </h2>

          {invites.length === 0 ? (
            <div className="glass-panel" style={{ padding: "40px", textAlign: "center" }}>
              <Clock size={36} color="#94a3b8" style={{ marginBottom: "12px" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>No coaching invites received yet</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                Ensure your Coach Visibility is enabled and upload achievement certificates to attract certified coaches!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className="glass-panel"
                  style={{
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem", color: "#fff" }}>
                        Coach {inv.coach_name}
                      </span>
                      {inv.coach_verified && (
                        <span className="badge badge-verified" style={{ fontSize: "0.68rem" }}>
                          ✓ AI Verified
                        </span>
                      )}
                      {inv.coach_organization && (
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          • {inv.coach_organization}
                        </span>
                      )}
                    </div>
                    <p style={{ color: "#cbd5e1", fontSize: "0.92rem", marginBottom: "8px", fontStyle: "italic" }}>
                      "{inv.message}"
                    </p>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      Received {new Date(inv.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {inv.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => handleRespondInvite(inv.id, "ACCEPTED")}
                          className="btn-primary"
                          style={{ background: "#10b981", padding: "8px 16px", fontSize: "0.85rem" }}
                        >
                          <Check size={16} /> Accept Invite
                        </button>
                        <button
                          onClick={() => handleRespondInvite(inv.id, "DECLINED")}
                          className="btn-secondary"
                          style={{ padding: "8px 16px", fontSize: "0.85rem", color: "#f87171" }}
                        >
                          <X size={16} /> Decline
                        </button>
                      </>
                    ) : (
                      <span
                        className={`badge ${
                          inv.status === "ACCEPTED" ? "badge-verified" : "badge-flagged"
                        }`}
                        style={{ fontSize: "0.82rem" }}
                      >
                        {inv.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* COACH VIEW: Search & Scout Players */
        <div>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              Athlete Scouting Directory
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Scout players with public coach visibility, review their athletic certificates, and extend trial invitations.
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", marginBottom: "24px", maxWidth: "450px" }}>
            <Search size={18} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "12px" }} />
            <input
              type="text"
              className="glass-input"
              style={{ paddingLeft: "42px" }}
              placeholder="Filter players by sport (e.g. Football, Basketball)..."
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
            />
          </div>

          {/* Scoutable Players Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
              Scanning athlete directory...
            </div>
          ) : players.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: "center", padding: "60px 20px" }}>
              <Compass size={40} color="#94a3b8" style={{ marginBottom: "12px" }} />
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>No scoutable players found</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Only athletes who enabled "Coach Visibility" appear here. Check back soon!
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {players.map((p) => (
                <div
                  key={p.player_id}
                  className="glass-panel"
                  style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
                          {p.full_name || p.username}
                        </h3>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          @{p.username} {p.age ? `• ${p.age} yrs` : ""}
                        </div>
                      </div>
                      <span className="badge badge-player" style={{ fontSize: "0.75rem" }}>
                        {p.primary_sport || "Athlete"}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.88rem", color: "#cbd5e1", marginBottom: "16px" }}>
                      <div><strong>Team:</strong> {p.team || "Free Agent"}</div>
                      {p.bio && <div style={{ marginTop: "6px", fontStyle: "italic", color: "#94a3b8" }}>"{p.bio}"</div>}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fbbf24", fontSize: "0.85rem", marginBottom: "18px" }}>
                      <Award size={16} />
                      <span>{p.certificates_count} Achievement Credentials</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewPlayer(p)}
                    className="btn-primary"
                    style={{ width: "100%", fontSize: "0.88rem" }}
                  >
                    <Send size={15} /> Review & Send Invite
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Sent Invites History for Coach */}
          <div style={{ marginTop: "40px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "14px" }}>
              Sent Recruitment Invites ({invites.length})
            </h2>
            {invites.length === 0 ? (
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                You haven't sent any recruitment offers yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {invites.map((inv) => (
                  <div
                    key={inv.id}
                    className="glass-panel"
                    style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: "#fff" }}>To @{inv.player_name}</span>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>"{inv.message}"</p>
                    </div>
                    <span
                      className={`badge ${
                        inv.status === "ACCEPTED" ? "badge-verified" : inv.status === "DECLINED" ? "badge-flagged" : "badge-coach"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coach Invite Dialog Modal */}
      {selectedPlayer && (
        <div className="modal-overlay" onClick={() => setSelectedPlayer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                Recruit @{selectedPlayer.username}
              </h2>
              <button onClick={() => setSelectedPlayer(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{ marginBottom: "16px", padding: "10px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "8px", color: "#fca5a5", fontSize: "0.88rem" }}>
                {error}
              </div>
            )}
            {inviteSuccess && (
              <div style={{ marginBottom: "16px", padding: "10px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "8px", color: "#34d399", fontSize: "0.88rem" }}>
                {inviteSuccess}
              </div>
            )}

            {playerDetail && (
              <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(0,0,0,0.3)", borderRadius: "10px" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "6px" }}>
                  Verified Athlete Portfolio
                </div>
                {playerDetail.certificates?.length > 0 ? (
                  <ul style={{ paddingLeft: "18px", fontSize: "0.85rem", color: "#e2e8f0" }}>
                    {playerDetail.certificates.map((c: any) => (
                      <li key={c.id}>
                        {c.title} — <em>{c.issuing_body}</em> {c.is_verified ? "✓" : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>No public certificates uploaded yet</div>
                )}
              </div>
            )}

            <form onSubmit={handleSendInvite}>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8" }}>
                    Trial Offer / Recruitment Message
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!inviteMessage.trim()) return;
                      try {
                        const res = await api.improviseText(inviteMessage, "coaching recruitment offer");
                        setInviteMessage(res.improvised);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    disabled={!inviteMessage.trim()}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#c084fc",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    ✨ Improvise English with AI
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  className="glass-input"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Detail the coaching trial, venue, proposed position, and academy perks..."
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", padding: "12px" }}
                disabled={sendingInvite}
              >
                {sendingInvite ? "Transmitting..." : "Send Formal Recruitment Invite"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
