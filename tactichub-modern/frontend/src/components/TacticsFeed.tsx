import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Tactic, User } from "../types";
import { Search, Plus, Trash2, ShieldCheck, Gamepad2, Calendar, Languages, RotateCcw, Video, Image as ImageIcon } from "lucide-react";

interface TacticsFeedProps {
  user: User | null;
  onOpenAddModal: () => void;
  onOpenAuth: () => void;
}

interface TranslatedCardState {
  title: string;
  description: string;
  lang: string;
  loading: boolean;
}

export const TacticsFeed: React.FC<TacticsFeedProps> = ({ user, onOpenAddModal, onOpenAuth }) => {
  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [myPostsOnly, setMyPostsOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Translation states per card
  const [cardTranslations, setCardTranslations] = useState<Record<string, TranslatedCardState>>({});
  const [targetLangs, setTargetLangs] = useState<Record<string, string>>({});

  const sports = ["All", "Football", "Basketball", "Tennis", "Badminton", "Cricket"];
  const languageOptions = [
    { code: "spanish", name: "Spanish 🇪🇸" },
    { code: "french", name: "French 🇫🇷" },
    { code: "german", name: "German 🇩🇪" },
    { code: "italian", name: "Italian 🇮🇹" },
    { code: "hindi", name: "Hindi 🇮🇳" },
    { code: "tamil", name: "Tamil 🇮🇳" },
    { code: "japanese", name: "Japanese 🇯🇵" },
    { code: "english", name: "English 🇬🇧" },
  ];

  const loadTactics = async () => {
    setLoading(true);
    try {
      const data = await api.getTactics({
        search: search.trim() || undefined,
        sport: selectedSport !== "All" ? selectedSport : undefined,
        my_posts_only: myPostsOnly,
      });
      setTactics(data);
    } catch (err) {
      console.error("Failed to load tactics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTactics();
  }, [search, selectedSport, myPostsOnly]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this strategy?")) return;
    try {
      await api.deleteTactic(id);
      loadTactics();
    } catch (err: any) {
      alert(err.message || "Failed to delete tactic");
    }
  };

  const handleTranslateCard = async (tactic: Tactic) => {
    const chosenLang = targetLangs[tactic.id] || "spanish";
    setCardTranslations((prev) => ({
      ...prev,
      [tactic.id]: {
        title: "",
        description: "",
        lang: chosenLang,
        loading: true,
      },
    }));

    try {
      const [transTitle, transDesc] = await Promise.all([
        api.translateText(tactic.title, chosenLang, "auto"),
        api.translateText(tactic.description, chosenLang, "auto"),
      ]);

      setCardTranslations((prev) => ({
        ...prev,
        [tactic.id]: {
          title: transTitle.translated,
          description: transDesc.translated,
          lang: chosenLang,
          loading: false,
        },
      }));
    } catch (err: any) {
      alert("Translation failed: " + (err.message || "Service error"));
      setCardTranslations((prev) => {
        const copy = { ...prev };
        delete copy[tactic.id];
        return copy;
      });
    }
  };

  const handleResetTranslation = (tacticId: string) => {
    setCardTranslations((prev) => {
      const copy = { ...prev };
      delete copy[tacticId];
      return copy;
    });
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px" }}>
      {/* Top Header & Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            Sports Strategy & Tactics Hub
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Tactical playbooks from coaches & players with formation diagrams, video clips, and AI translation.
          </p>
        </div>

        {user ? (
          <button onClick={onOpenAddModal} className="btn-primary">
            <Plus size={18} /> Post Strategy
          </button>
        ) : (
          <button onClick={onOpenAuth} className="btn-primary">
            Sign In to Contribute
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={18} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "12px" }} />
          <input
            type="text"
            className="glass-input"
            style={{ paddingLeft: "42px" }}
            placeholder="Search by game, keyword, or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {user && (
          <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e2e8f0", fontSize: "0.88rem", cursor: "pointer", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={myPostsOnly}
              onChange={(e) => setMyPostsOnly(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "#9333ea" }}
            />
            My Strategies Only
          </label>
        )}
      </div>

      {/* Sport Category Pills */}
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
              border: selectedSport === sp ? "1px solid var(--accent-purple)" : "1px solid var(--border-subtle)",
              background: selectedSport === sp ? "rgba(147, 51, 234, 0.25)" : "rgba(255, 255, 255, 0.03)",
              color: selectedSport === sp ? "#c084fc" : "#94a3b8",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {sp}
          </button>
        ))}
      </div>

      {/* Tactics Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          Loading strategy repository...
        </div>
      ) : tactics.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Gamepad2 size={40} color="#94a3b8" style={{ marginBottom: "12px" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>No strategies found</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Be the first athlete or coach to post a strategy with photos or video drills!
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: "20px" }}>
          {tactics.map((t) => {
            const author = t.author_name || t.coach_name || "Athlete";
            const role = t.author_role || (t.coach_name ? "COACH" : "PLAYER");
            const isVerified = t.is_author_verified || t.is_coach_verified || false;
            const orgOrTeam = t.author_organization || t.coach_organization;

            const translation = cardTranslations[t.id];
            const isTranslated = !!translation && !translation.loading;
            const displayTitle = isTranslated ? translation.title : t.title;
            const displayDesc = isTranslated ? translation.description : t.description;

            return (
              <div
                key={t.id}
                className="glass-panel"
                style={{
                  padding: "22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span className="badge badge-player" style={{ fontSize: "0.75rem" }}>
                        {t.game}
                      </span>
                      <span
                        className={`badge ${role === "COACH" ? "badge-coach" : "badge-player"}`}
                        style={{ fontSize: "0.68rem" }}
                      >
                        {role}
                      </span>
                    </div>

                    {user && user.username === author && (
                      <button
                        onClick={() => handleDelete(t.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "4px",
                          opacity: 0.8,
                        }}
                        title="Delete strategy"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>
                    {displayTitle}
                  </h3>

                  <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6", whiteSpace: "pre-line", marginBottom: "14px" }}>
                    {displayDesc}
                  </p>

                  {/* Attached Media Photo or Video */}
                  {t.media_url && (
                    <div style={{ marginBottom: "16px", borderRadius: "10px", overflow: "hidden", background: "rgba(0,0,0,0.4)", border: "1px solid var(--border-subtle)" }}>
                      {t.media_type === "VIDEO" ? (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", fontSize: "0.75rem", color: "#60a5fa", background: "rgba(0,0,0,0.6)" }}>
                            <Video size={14} /> Video Demonstration Clip
                          </div>
                          <video
                            controls
                            src={`http://localhost:8000${t.media_url}`}
                            style={{ width: "100%", maxHeight: "240px", display: "block" }}
                          />
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", fontSize: "0.75rem", color: "#c084fc", background: "rgba(0,0,0,0.6)" }}>
                            <ImageIcon size={14} /> Tactical Formation Diagram
                          </div>
                          <img
                            src={`http://localhost:8000${t.media_url}`}
                            alt={t.title}
                            style={{ width: "100%", maxHeight: "240px", objectFit: "contain", display: "block" }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Translation Bar */}
                  <div style={{ padding: "8px 12px", background: "rgba(0,0,0,0.25)", borderRadius: "8px", border: "1px solid var(--border-subtle)", marginBottom: "16px" }}>
                    {isTranslated ? (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.78rem", color: "#34d399", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}>
                          <Languages size={14} /> Translated to {translation.lang.toUpperCase()}
                        </span>
                        <button
                          onClick={() => handleResetTranslation(t.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#94a3b8",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <RotateCcw size={12} /> Show Original
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Languages size={14} color="#94a3b8" />
                        <select
                          className="glass-input"
                          style={{ padding: "4px 8px", fontSize: "0.78rem", flex: 1, height: "28px" }}
                          value={targetLangs[t.id] || "spanish"}
                          onChange={(e) => setTargetLangs({ ...targetLangs, [t.id]: e.target.value })}
                        >
                          {languageOptions.map((opt) => (
                            <option key={opt.code} value={opt.code}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleTranslateCard(t)}
                          disabled={translation?.loading}
                          style={{
                            background: "rgba(59, 130, 246, 0.2)",
                            border: "1px solid rgba(59, 130, 246, 0.4)",
                            color: "#93c5fd",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {translation?.loading ? "Translating..." : "Translate"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Author Footer */}
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#e2e8f0" }}>
                        {role === "COACH" ? "Coach" : "Player"} @{author}
                      </span>
                      {isVerified && (
                        <span title="AI Verified Coach">
                          <ShieldCheck size={16} color="#34d399" />
                        </span>
                      )}
                    </div>
                    {orgOrTeam && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {orgOrTeam}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={12} />
                    {new Date(t.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
