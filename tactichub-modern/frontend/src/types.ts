export type UserRole = "PLAYER" | "COACH";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  full_name?: string;
  age?: number;
  team?: string;
  primary_sport?: string;
  coach_visibility?: boolean;
  organization_name?: string;
  verification_status?: "UNVERIFIED" | "VERIFIED" | "FLAGGED";
  bio?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  username: string;
  user_id: string;
}

export interface Tactic {
  id: string;
  game: string;
  title: string;
  description: string;
  author_name: string;
  author_role: UserRole;
  author_organization?: string;
  is_author_verified: boolean;
  media_url?: string;
  media_type?: "IMAGE" | "VIDEO";
  coach_name?: string;
  coach_organization?: string;
  is_coach_verified?: boolean;
  created_at: string;
}

export interface MatchRequest {
  id: string;
  sport: string;
  location_name: string;
  start_time: string;
  slots_total: number;
  slots_filled: number;
  skill_level: string;
  notes?: string;
  status: "OPEN" | "FULL" | "CANCELLED";
  host_username: string;
  host_team?: string;
  created_at: string;
  is_host: boolean;
  has_joined: boolean;
}

export interface ScoutPlayer {
  player_id: string;
  username: string;
  full_name?: string;
  age?: number;
  primary_sport?: string;
  team?: string;
  bio?: string;
  certificates_count: number;
}

export interface RecruitmentInvite {
  id: string;
  coach_name: string;
  coach_organization?: string;
  coach_verified: boolean;
  player_name: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  created_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  issuing_body: string;
  issue_date?: string;
  cert_type: "DEGREE" | "TOURNAMENT_WIN" | "COACHING_LICENSE" | "ACHIEVEMENT";
  file_url?: string;
  is_verified: boolean;
  created_at: string;
}

export interface VerificationAudit {
  audit_id: string;
  status: "VERIFIED" | "FLAGGED" | "REJECTED";
  confidence_score: number;
  matched_name?: string;
  extracted_text_preview: string;
  details: string;
  is_verified: boolean;
}
