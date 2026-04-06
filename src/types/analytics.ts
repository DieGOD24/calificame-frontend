export interface QuestionDifficulty {
  question_number: number;
  question_text: string | null;
  correct_count: number;
  total_count: number;
  success_rate: number;
}

export interface ScoreDistribution {
  range_label: string;
  count: number;
}

export interface ProjectAnalytics {
  project_id: string;
  project_name: string;
  total_exams: number;
  graded_count: number;
  average_score: number | null;
  median_score: number | null;
  highest_score: number | null;
  lowest_score: number | null;
  average_percentage: number | null;
  pass_rate: number | null;
  score_distribution: ScoreDistribution[];
  question_difficulty: QuestionDifficulty[];
}

export interface StudentProgress {
  student_identifier: string;
  student_name: string | null;
  project_name: string;
  score: number | null;
  max_score: number | null;
  percentage: number | null;
  graded_at: string | null;
}

export interface InstitutionAnalytics {
  institution_id: string;
  institution_name: string;
  total_professors: number;
  total_students: number;
  total_projects: number;
  total_exams_graded: number;
  average_score_percentage: number | null;
}
