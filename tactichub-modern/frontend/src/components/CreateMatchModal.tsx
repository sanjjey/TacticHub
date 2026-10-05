import React, { useState } from "react";
import { api } from "../api";
import { X, Users, MapPin, Clock, Award } from "lucide-react";

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [sport, setSport] = useState("Football 5-a-side");
  const [locationName, setLocationName] = useState("");
  const [startTime, setStartTime] = useState("Tomorrow 7:00 PM");
  const [slotsTotal, setSlotsTotal] = useState(10);
  const [skillLevel, setSkillLevel] = useState("All Levels Welcome");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createMatch({
        sport,
        location_name: locationName,
        start_time: startTime,
        slots_total: Number(slotsTotal),
        skill_level: skillLevel,
        notes,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create match request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={20} color="#3b82f6" /> Post Match LFG Request
          </h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: "16px", padding: "10px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "8px", color: "#fca5a5", fontSize: "0.88rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
              Sport & Match Format
            </label>
            <input
              type="text"
              required
              className="glass-input"
              placeholder="e.g. Football 5v5, Basketball 3x3, Badminton Doubles"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
              Location & Ground Name
            </label>
            <div style={{ position: "relative" }}>
              <MapPin size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "12px" }} />
              <input
                type="text"
                required
                className="glass-input"
                style={{ paddingLeft: "36px" }}
                placeholder="e.g. Metro Turf Pitch 2, Central Community Court"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                Date & Start Time
              </label>
              <div style={{ position: "relative" }}>
                <Clock size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "12px" }} />
                <input
                  type="text"
                  required
                  className="glass-input"
                  style={{ paddingLeft: "36px" }}
                  placeholder="e.g. Today 6:00 PM / Sat 10:00 AM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>

            <div style={{ width: "120px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                Total Slots
              </label>
              <input
                type="number"
                min={2}
                max={50}
                required
                className="glass-input"
                value={slotsTotal}
                onChange={(e) => setSlotsTotal(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
              Skill Level Expectations
            </label>
            <select
              className="glass-input"
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
            >
              <option value="All Levels Welcome">All Levels Welcome</option>
              <option value="Beginner / Casual">Beginner / Casual</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Competitive / Tournament Ready">Competitive / Tournament Ready</option>
            </select>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8" }}>
                Match Specifications & Equipment Notes
              </label>
              <button
                type="button"
                onClick={async () => {
                  if (!notes.trim()) return;
                  try {
                    const res = await api.improviseText(notes, "sports match notes");
                    setNotes(res.improvised);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                disabled={!notes.trim()}
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
                  opacity: !notes.trim() ? 0.5 : 1,
                }}
              >
                ✨ Improvise with AI
              </button>
            </div>
            <textarea
              rows={3}
              className="glass-input"
              placeholder="e.g. Cleats allowed, match ball supplied, split court fee ₹150/player"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "12px", marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? "Posting..." : "Broadcast Match Request"}
          </button>
        </form>
      </div>
    </div>
  );
};
