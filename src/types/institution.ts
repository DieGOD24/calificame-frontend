export interface Institution {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  plan: string;
  max_professors: number;
  max_students: number;
  member_count: number;
  created_at: string;
}

export interface InstitutionMember {
  id: string;
  user_id: string;
  institution_id: string;
  role: string;
  joined_at: string;
  user_email: string;
  user_name: string;
}

export interface InstitutionInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}
