import { AuthResponse, User, Tactic, MatchRequest, ScoutPlayer, RecruitmentInvite, Certificate, VerificationAudit } from "./types";

const API_BASE = "http://localhost:8000/api";

function getHeaders(isFormData = false): HeadersInit {
  const token = localStorage.getItem("tactichub_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(err.detail || "Login failed");
    }
    return res.json();
  },

  async register(data: any): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Registration failed" }));
      throw new Error(err.detail || "Registration failed");
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load user profile");
    return res.json();
  },

  async updateSettings(data: any): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/settings`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Update failed" }));
      throw new Error(err.detail || "Update failed");
    }
    return res.json();
  },

  // Tactics
  async getTactics(params?: { search?: string; sport?: string; my_posts_only?: boolean }): Promise<Tactic[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.sport) query.append("sport", params.sport);
    if (params?.my_posts_only) query.append("my_posts_only", "true");

    const res = await fetch(`${API_BASE}/tactics/?${query.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch tactics");
    return res.json();
  },

  async createTactic(data: { game: string; title: string; description: string }): Promise<Tactic> {
    const res = await fetch(`${API_BASE}/tactics/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to create tactic" }));
      throw new Error(err.detail || "Failed to create tactic");
    }
    return res.json();
  },

  async deleteTactic(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tactics/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete tactic");
  },

  // Matches / LFG
  async getMatches(params?: { sport?: string; status?: string }): Promise<MatchRequest[]> {
    const query = new URLSearchParams();
    if (params?.sport) query.append("sport", params.sport);
    if (params?.status) query.append("status", params.status);

    const res = await fetch(`${API_BASE}/matches/?${query.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch match requests");
    return res.json();
  },

  async createMatch(data: {
    sport: string;
    location_name: string;
    start_time: string;
    slots_total: number;
    skill_level: string;
    notes?: string;
  }): Promise<MatchRequest> {
    const res = await fetch(`${API_BASE}/matches/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to create match" }));
      throw new Error(err.detail || "Failed to create match");
    }
    return res.json();
  },

  async joinMatch(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/matches/${id}/join`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to join match" }));
      throw new Error(err.detail || "Failed to join match");
    }
    return res.json();
  },

  async leaveMatch(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/matches/${id}/leave`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to leave match" }));
      throw new Error(err.detail || "Failed to leave match");
    }
    return res.json();
  },

  async cancelMatch(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/matches/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to cancel match");
  },

  // Scouting & Invites
  async getScoutablePlayers(sport?: string): Promise<ScoutPlayer[]> {
    const query = sport ? `?sport=${encodeURIComponent(sport)}` : "";
    const res = await fetch(`${API_BASE}/scouting/players${query}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to load players" }));
      throw new Error(err.detail || "Failed to load players");
    }
    return res.json();
  },

  async getPlayerDetail(playerId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/scouting/players/${playerId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to load player details" }));
      throw new Error(err.detail || "Failed to load player details");
    }
    return res.json();
  },

  async sendInvite(playerId: string, message: string): Promise<RecruitmentInvite> {
    const res = await fetch(`${API_BASE}/scouting/invite`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ player_id: playerId, message }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to send invite" }));
      throw new Error(err.detail || "Failed to send invite");
    }
    return res.json();
  },

  async getMyInvites(): Promise<RecruitmentInvite[]> {
    const res = await fetch(`${API_BASE}/scouting/my-invites`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load invites");
    return res.json();
  },

  async respondToInvite(inviteId: string, action: "ACCEPTED" | "DECLINED"): Promise<any> {
    const res = await fetch(`${API_BASE}/scouting/invites/${inviteId}/respond?action=${action}`, {
      method: "PUT",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to respond to invite");
    return res.json();
  },

  // Certificates
  async getMyCertificates(): Promise<Certificate[]> {
    const res = await fetch(`${API_BASE}/certificates/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load certificates");
    return res.json();
  },

  async uploadCertificate(formData: FormData): Promise<Certificate> {
    const res = await fetch(`${API_BASE}/certificates/`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to upload certificate" }));
      throw new Error(err.detail || "Failed to upload certificate");
    }
    return res.json();
  },

  async deleteCertificate(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/certificates/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete certificate");
  },

  // Coach Computer Vision AI Verification
  async verifyCoachDocument(formData: FormData): Promise<VerificationAudit> {
    const res = await fetch(`${API_BASE}/verification/verify-document`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Verification scan failed" }));
      throw new Error(err.detail || "Verification scan failed");
    }
    return res.json();
  },

  async getVerificationHistory(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/verification/history`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load verification history");
    return res.json();
  },

  // AI Text Analyzer: Improvisation, Translation & Moderation
  async moderateContent(title: string, description: string, game = "Sports"): Promise<{ allowed: boolean; status: string; message: string; relevance_score?: number }> {
    const res = await fetch(`${API_BASE}/ai/moderate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ title, description, game }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Moderation check failed" }));
      throw new Error(err.detail || "Moderation check failed");
    }
    return res.json();
  },

  async improviseText(text: string, context = "tactics"): Promise<{ original: string; improvised: string; method: string; improvements: string[] }> {
    const res = await fetch(`${API_BASE}/ai/improvise`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ text, context }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Improvisation failed" }));
      throw new Error(err.detail || "Improvisation failed");
    }
    return res.json();
  },

  async translateText(text: string, target_lang: string, source_lang = "english"): Promise<{ original: string; translated: string; target_lang: string; provider: string }> {
    const res = await fetch(`${API_BASE}/ai/translate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ text, target_lang, source_lang }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Translation failed" }));
      throw new Error(err.detail || "Translation failed");
    }
    return res.json();
  },

  async getSupportedLanguages(): Promise<{ code: string; name: string; flag: string }[]> {
    const res = await fetch(`${API_BASE}/ai/languages`);
    if (!res.ok) throw new Error("Failed to load languages");
    return res.json();
  },
};
