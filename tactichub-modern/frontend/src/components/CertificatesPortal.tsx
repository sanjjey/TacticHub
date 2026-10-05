import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Certificate, User } from "../types";
import { Award, Plus, Trash2, ShieldCheck, Calendar, FileText, Upload } from "lucide-react";

interface CertificatesPortalProps {
  user: User | null;
  onOpenAuth: () => void;
}

export const CertificatesPortal: React.FC<CertificatesPortalProps> = ({ user, onOpenAuth }) => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [issuingBody, setIssuingBody] = useState("");
  const [certType, setCertType] = useState<string>("ACHIEVEMENT");
  const [issueDate, setIssueDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const data = await api.getMyCertificates();
      setCerts(data);
    } catch (err: any) {
      console.error("Failed to load certificates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCertificates();
    }
  }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("issuing_body", issuingBody);
    formData.append("cert_type", certType);
    if (issueDate) formData.append("issue_date", issueDate);
    if (selectedFile) formData.append("file", selectedFile);

    try {
      await api.uploadCertificate(formData);
      setIsModalOpen(false);
      setTitle("");
      setIssuingBody("");
      setSelectedFile(null);
      loadCertificates();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this certificate record?")) return;
    try {
      await api.deleteCertificate(id);
      loadCertificates();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: "800px", margin: "60px auto", textAlign: "center", padding: "40px" }} className="glass-panel">
        <Award size={48} color="#fbbf24" style={{ marginBottom: "16px" }} />
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "10px" }}>Certificates & Achievements Portal</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
          Sign in to curate and showcase your sports awards, university degrees, and tournament trophies.
        </p>
        <button onClick={onOpenAuth} className="btn-primary">
          Sign In to Access Portal
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            Certificates & Achievements Portfolio
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Showcase sports credentials, tournament championship awards, and coaching certifications.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} /> Add Credential
        </button>
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          Loading credential portfolio...
        </div>
      ) : certs.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Award size={40} color="#94a3b8" style={{ marginBottom: "12px" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>No credentials added yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Add your degrees, state awards, or competition certificates to enhance credibility!
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {certs.map((c) => (
            <div
              key={c.id}
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
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "rgba(245, 158, 11, 0.15)",
                      color: "#fbbf24",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {c.cert_type.replace("_", " ")}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {c.is_verified && (
                      <span className="badge badge-verified" style={{ fontSize: "0.7rem" }}>
                        ✓ Verified
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
                      style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", opacity: 0.8 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                  {c.title}
                </h3>

                <div style={{ fontSize: "0.9rem", color: "#cbd5e1", marginBottom: "12px" }}>
                  <strong>Issued by:</strong> {c.issuing_body}
                </div>

                {c.issue_date && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#94a3b8", marginBottom: "16px" }}>
                    <Calendar size={14} /> Issued on {c.issue_date}
                  </div>
                )}

                {c.file_url && (
                  <div style={{ marginTop: "12px" }}>
                    <a
                      href={`http://localhost:8000${c.file_url}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.82rem",
                        color: "#60a5fa",
                        textDecoration: "underline",
                      }}
                    >
                      <FileText size={14} /> View Attached Certificate Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "18px" }}>
              Add Sports Credential or Award
            </h2>

            {error && (
              <div style={{ marginBottom: "16px", padding: "10px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "8px", color: "#fca5a5", fontSize: "0.88rem" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                  Credential Title
                </label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  placeholder="e.g. State Badminton Champion 2025, B.Sc Sports Science"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                  Issuing Organization / Sports Council
                </label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  placeholder="e.g. State Athletics Federation, University of Madras"
                  value={issuingBody}
                  onChange={(e) => setIssuingBody(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                    Credential Type
                  </label>
                  <select
                    className="glass-input"
                    value={certType}
                    onChange={(e) => setCertType(e.target.value)}
                  >
                    <option value="ACHIEVEMENT">Milestone Achievement</option>
                    <option value="TOURNAMENT_WIN">Tournament Victory</option>
                    <option value="DEGREE">Academic Degree / Diploma</option>
                    <option value="COACHING_LICENSE">Coaching License</option>
                  </select>
                </div>

                <div style={{ width: "150px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                    Date Issued
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="YYYY-MM"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                  Upload Document / Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="glass-input"
                  style={{ padding: "8px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1 }}
                  disabled={uploading}
                >
                  {uploading ? "Saving..." : "Add to Portfolio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
