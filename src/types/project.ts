export type ProjectStatus =
  | "draft"
  | "configuring"
  | "answer_key_uploaded"
  | "answer_key_processed"
  | "confirmed"
  | "grading"
  | "completed";

export interface ProjectConfig {
  exam_type: "multiple_choice" | "open_ended" | "mixed";
  total_questions: number;
  points_per_question?: number;
  has_multiple_pages: boolean;
  additional_instructions?: string;
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  subject: string | null;
  status: ProjectStatus;
  config: ProjectConfig | null;
  created_at: string;
  updated_at: string;
  questions_count?: number;
  exams_count?: number;
  graded_count?: number;
}

export interface Question {
  id: string;
  project_id: string;
  question_number: number;
  question_text: string | null;
  correct_answer: string;
  points: number;
  is_confirmed: boolean;
}

export interface AnswerKey {
  id: string;
  project_id: string;
  original_filename: string | null;
  file_type: string;
  num_pages: number | null;
  is_processed: boolean;
  created_at: string;
}

export interface StudentExam {
  id: string;
  project_id: string;
  student_name: string | null;
  student_identifier: string | null;
  original_filename: string | null;
  file_type: string;
  status: "uploaded" | "processing" | "graded" | "error";
  total_score: number | null;
  max_score: number | null;
  grade_percentage: number | null;
  grading_details: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  graded_at: string | null;
  answers?: ExamAnswer[];
}

export interface ExamAnswer {
  id: string;
  student_exam_id: string;
  question_id: string;
  extracted_answer: string | null;
  is_correct: boolean | null;
  score: number;
  max_score: number | null;
  feedback: string | null;
  confidence: number | null;
  question?: Question;
}

export interface GradingSummary {
  project_id: string;
  project_name: string;
  total_exams: number;
  graded_count: number;
  pending_count: number;
  error_count: number;
  average_score: number | null;
  average_percentage: number | null;
  highest_score: number | null;
  lowest_score: number | null;
}
