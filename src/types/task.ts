export interface TaskLog {
  id: string;
  user_id: string;
  task_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  current_step: string | null;
  result_data: Record<string, unknown> | null;
  error_message: string | null;
  project_id: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}
