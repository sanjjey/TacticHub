import React, { useState, useEffect } from "react";
import { api } from "../api";
import { User, VerificationAudit } from "../types";
import { 
  ShieldCheck, 
  UploadCloud, 
  Cpu, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileSearch,
  Scan,
  History
} from "lucide-react";

interface CoachVerificationProps {
  user: User | null;
  onRefreshUser: () => void;
}

export const CoachVerification: React.FC<CoachVerificationProps> = ({ user, onRefreshUser }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("National Coaching License Level 2");
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [latestAudit, setLatestAudit] = useState<VerificationAudit | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const data = await api.getVerificationHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load audit history", err);
    }
  };

  useEffect(() => {
    if (user?.role === "COACH") {
      loadHistory();
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRunVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a certificate or license document image.");
      return;
    }

    setError(null);
    setScanning(true);
    setLatestAudit(null);

    // Multi-stage visual scan feedback
    setScanStep("Stage 1/3: OpenCV Document Preprocessing & Circular Seal Detection...");
    await new Promise((r) => setTimeout(r, 600));

    setScanStep("Stage 2/3: RapidOCR Optical Character Recognition Running...");
    await new Promise((r) => setTimeout(r, 600));

    setScanStep("Stage 3/3: Fuzzy Entity Matching against Coach Name & Sports Council Taxonomies...");

    const formData = new FormData();
    formData.append("document", selectedFile);
    formData.append("document_title", documentTitle);

    try {
      const audit = await api.verifyCoachDocument(formData);
      setLatestAudit(audit);
      loadHistory();
      onRefreshUser();
    } catch (err: any) {
      setError(err.message || "Computer vision verification pipeline failed");
    } finally {
      setScanning(false);
      setScanStep("");
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "30px 20px" }}>
      {/* Title */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <ShieldCheck size={28} color="#ec4899" />
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            Computer Vision AI Coach Credential Verification
          </h1>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Automated multi-stage document inspection powered by OpenCV contour detection, RapidOCR, and RapidFuzz entity resolution.
        </p>
      </div>

      {/* Current Status Pill Card */}
      <div
        className="glass-panel"
        style={{
          padding: "20px 26px",
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          border:
            user?.verification_status === "VERIFIED"
              ? "1px solid rgba(16, 185, 129, 0.4)"
              : "1px solid rgba(245, 158, 11, 0.4)",
          background:
            user?.verification_status === "VERIFIED"
              ? "rgba(16, 185, 129, 0.05)"
              : "rgba(245, 158, 11, 0.05)",
        }}
      >
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Coach Credibility Status
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            {user?.verification_status === "VERIFIED" ? (
              <>
                <CheckCircle size={22} color="#34d399" /> Accredited & Verified Coach
              </>
            ) : user?.verification_status === "FLAGGED" ? (
              <>
                <AlertTriangle size={22} color="#fbbf24" /> Under Manual Staff Review
              </>
            ) : (
              <>
                <AlertTriangle size={22} color="#94a3b8" /> Unverified (Upload Credential Below)
              </>
            )}
          </div>
        </div>

        <div style={{ fontSize: "0.85rem", color: "#cbd5e1", maxWidth: "420px" }}>
          {user?.verification_status === "VERIFIED"
            ? "Your credentials have been matched with official sporting authorities. Verified badges are displayed on your playbooks and scouting invites."
            : "Upload degree documents, sports coaching licenses, or federation competition championship certificates to unlock your Verified Coach badge."}
        </div>
      </div>

      {/* Upload & Inspection Panel */}
      <div className="glass-panel" style={{ padding: "30px", marginBottom: "36px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Scan size={20} color="#a855f7" /> Document Scanner & Verification Engine
        </h2>

        {error && (
          <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "8px", color: "#fca5a5", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRunVerification} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
              Credential Title / License Name
            </label>
            <input
              type="text"
              required
              className="glass-input"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="e.g. AFC/UEFA Coaching License, National Sports University Degree"
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
              Upload Document Image (.jpg, .png, .webp)
            </label>
            <div
              style={{
                border: "2px dashed var(--border-subtle)",
                borderRadius: "14px",
                padding: "30px 20px",
                textAlign: "center",
                background: "rgba(0,0,0,0.2)",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onClick={() => document.getElementById("doc-file-input")?.click()}
            >
              <UploadCloud size={36} color="#a855f7" style={{ marginBottom: "10px" }} />
              <div style={{ fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                {selectedFile ? selectedFile.name : "Click to select certificate image"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Supports university degrees, state competition win certs, and coaching council badges
              </div>
              <input
                id="doc-file-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: "0.95rem" }}
            disabled={scanning || !selectedFile}
          >
            {scanning ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Cpu size={18} className="animate-spin" /> {scanStep}
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Scan size={18} /> Initiate AI Computer Vision Credential Audit
              </span>
            )}
          </button>
        </form>

        {/* Scan Results Inspector */}
        {latestAudit && (
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              background: "rgba(0,0,0,0.4)",
              borderRadius: "12px",
              border:
                latestAudit.status === "VERIFIED"
                  ? "1px solid rgba(16, 185, 129, 0.4)"
                  : "1px solid rgba(245, 158, 11, 0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>
                AI Document Inspection Report
              </div>
              <span
                className={`badge ${
                  latestAudit.status === "VERIFIED"
                    ? "badge-verified"
                    : latestAudit.status === "FLAGGED"
                    ? "badge-flagged"
                    : "badge-coach"
                }`}
              >
                {latestAudit.status}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "14px" }}>
              <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px 14px", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Confidence Score</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#34d399" }}>
                  {latestAudit.confidence_score}%
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px 14px", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Entity Matched</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
                  {latestAudit.matched_name || "Uncertain"}
                </div>
              </div>
            </div>

            <div style={{ fontSize: "0.88rem", color: "#cbd5e1", marginBottom: "12px" }}>
              <strong>Audit Summary:</strong> {latestAudit.details}
            </div>

            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "6px" }}>
              <strong>Extracted OCR Tokens:</strong> "{latestAudit.extracted_text_preview}"
            </div>
          </div>
        )}
      </div>

      {/* Historical Audit Logs */}
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <History size={18} color="#94a3b8" /> Previous Verification Audits
        </h2>

        {history.length === 0 ? (
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            No past verification scans on record.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {history.map((h) => (
              <div
                key={h.id}
                className="glass-panel"
                style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "#fff" }}>{h.details}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Scanned {new Date(h.created_at).toLocaleDateString()} • Confidence: {h.confidence_score}%
                  </div>
                </div>
                <span
                  className={`badge ${
                    h.status === "VERIFIED" ? "badge-verified" : h.status === "FLAGGED" ? "badge-flagged" : "badge-coach"
                  }`}
                >
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
