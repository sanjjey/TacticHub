import React, { useState } from "react";
import { api } from "../api";
import { X, PlusCircle, Sparkles, Languages, Check, ArrowRight } from "lucide-react";

interface AddTacticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddTacticModal: React.FC<AddTacticModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [game, setGame] = useState("Football");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [improvising, setImprovising] = useState(false);
  const [improvisingTitle, setImprovisingTitle] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState("english");
  const [targetLang, setTargetLang] = useState("spanish");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImproviseDesc = async () => {
    if (!description.trim()) {
      setError("Please write some strategy description first to improvise.");
      return;
    }
    setError(null);
    setImprovising(true);
    setFeedbackMsg(null);
    try {
      const res = await api.improviseText(description, "tactics playbook");
      setDescription(res.improvised);
      setFeedbackMsg(`✨ AI enhanced: ${res.improvements.join(" • ")}`);
    } catch (err: any) {
      setError(err.message || "Improvisation failed");
    } finally {
      setImprovising(false);
    }
  };

  const handleImproviseTitle = async () => {
    if (!title.trim()) {
      setError("Please write a strategy title first to improvise.");
      return;
    }
    setError(null);
    setImprovisingTitle(true);
    try {
      const res = await api.improviseText(title, "sports strategy title");
      setTitle(res.improvised);
    } catch (err: any) {
      setError(err.message || "Title improvisation failed");
    } finally {
      setImprovisingTitle(false);
    }
  };

  const handleTranslateBoth = async () => {
    if (!description.trim() && !title.trim()) {
      setError("Please enter a title or description to translate.");
      return;
    }
    setError(null);
    setTranslating(true);
    try {
      if (title.trim()) {
        const transTitle = await api.translateText(title, targetLang, sourceLang);
        setTitle(transTitle.translated);
      }
      if (description.trim()) {
        const transDesc = await api.translateText(description, targetLang, sourceLang);
        setDescription(transDesc.translated);
      }
      setFeedbackMsg(`🌐 Content translated into ${targetLang.toUpperCase()}!`);
    } catch (err: any) {
      setError(err.message || "Translation failed");
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createTactic({ game, title, description });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to publish tactic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <PlusCircle size={20} color="#a855f7" /> Publish Tactical Strategy
          </h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: "14px", padding: "10px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "8px", color: "#fca5a5", fontSize: "0.88rem" }}>
            {error}
          </div>
        )}

        {feedbackMsg && (
          <div style={{ marginBottom: "14px", padding: "10px", background: "rgba(147, 51, 234, 0.15)", border: "1px solid rgba(147, 51, 234, 0.4)", borderRadius: "8px", color: "#d8b4fe", fontSize: "0.85rem" }}>
            {feedbackMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
              Sport / Game Name
            </label>
            <input
              type="text"
              required
              className="glass-input"
              placeholder="e.g. Football, Basketball, Cricket, Badminton"
              value={game}
              onChange={(e) => setGame(e.target.value)}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8" }}>
                Strategy Title
              </label>
              <button
                type="button"
                onClick={handleImproviseTitle}
                disabled={improvisingTitle || !title.trim()}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#c084fc",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                  opacity: !title.trim() ? 0.5 : 1,
                }}
              >
                <Sparkles size={13} color="#a855f7" />
                {improvisingTitle ? "Polishing..." : "Improvise Title"}
              </button>
            </div>
            <input
              type="text"
              required
              className="glass-input"
              placeholder="e.g. High Defensive Line & Offside Trap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8" }}>
                Tactical Description & Instructions
              </label>
              {/* ✨ Improvise English with AI Button */}
              <button
                type="button"
                onClick={handleImproviseDesc}
                disabled={improvising || !description.trim()}
                className="btn-secondary"
                style={{
                  padding: "4px 10px",
                  fontSize: "0.78rem",
                  color: "#c084fc",
                  borderColor: "rgba(168, 85, 247, 0.4)",
                  background: "rgba(147, 51, 234, 0.15)",
                }}
              >
                <Sparkles size={14} color="#c084fc" />
                {improvising ? "Analyzing & Polishing..." : "✨ Improvise English with AI"}
              </button>
            </div>

            <textarea
              required
              rows={5}
              className="glass-input"
              placeholder="Type your tactical setup (you can type informally or in simple English, then click 'Improvise' to refine vocabulary and tactical flow)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Quick AI Translate Bar */}
          <div style={{ padding: "12px", background: "rgba(0,0,0,0.3)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
                <Languages size={15} color="#3b82f6" /> Post in Different Language / Translate
              </div>
              <button
                type="button"
                onClick={handleTranslateBoth}
                disabled={translating || (!title.trim() && !description.trim())}
                style={{
                  background: "rgba(59, 130, 246, 0.2)",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  color: "#93c5fd",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {translating ? "Translating..." : "Translate Draft"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.82rem" }}>
              <select
                className="glass-input"
                style={{ padding: "6px", fontSize: "0.8rem", flex: 1 }}
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
              >
                <option value="english">From: English 🇬🇧</option>
                <option value="spanish">From: Spanish 🇪🇸</option>
                <option value="french">From: French 🇫🇷</option>
                <option value="german">From: German 🇩🇪</option>
                <option value="hindi">From: Hindi 🇮🇳</option>
                <option value="tamil">From: Tamil 🇮🇳</option>
                <option value="japanese">From: Japanese 🇯🇵</option>
              </select>
              <ArrowRight size={14} color="#94a3b8" />
              <select
                className="glass-input"
                style={{ padding: "6px", fontSize: "0.8rem", flex: 1 }}
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
              >
                <option value="spanish">To: Spanish 🇪🇸</option>
                <option value="french">To: French 🇫🇷</option>
                <option value="german">To: German 🇩🇪</option>
                <option value="italian">To: Italian 🇮🇹</option>
                <option value="hindi">To: Hindi 🇮🇳</option>
                <option value="tamil">To: Tamil 🇮🇳</option>
                <option value="japanese">To: Japanese 🇯🇵</option>
                <option value="english">To: English 🇬🇧</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "12px", marginTop: "6px" }}
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish Strategy to Hub"}
          </button>
        </form>
      </div>
    </div>
  );
};
