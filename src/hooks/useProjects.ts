"use client";

import { useState, useCallback } from "react";
import api, { getTask } from "@/lib/api";
import type { Project, ProjectConfig, Question, AnswerKey, StudentExam, GradingSummary } from "@/types/project";
import type { PaginatedResponse } from "@/types/api";
import type { TaskLog } from "@/types/task";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerKeys, setAnswerKeys] = useState<AnswerKey[]>([]);
  const [studentExams, setStudentExams] = useState<StudentExam[]>([]);
  const [summary, setSummary] = useState<GradingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchProjects = useCallback(async (page = 1, perPage = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<PaginatedResponse<Project>>("/projects", {
        params: { page, per_page: perPage },
      });
      setProjects(response.data.items);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar proyectos";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Project>(`/projects/${id}`);
      setCurrentProject(response.data);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar el proyecto";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(
    async (data: { name: string; description?: string; subject?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post<Project>("/projects", data);
        setProjects((prev) => [response.data, ...prev]);
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al crear el proyecto";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateProjectConfig = useCallback(
    async (projectId: string, config: ProjectConfig) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.put<Project>(
          `/projects/${projectId}`,
          { config }
        );
        setCurrentProject(response.data);
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al actualizar configuracion";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const uploadAnswerKey = useCallback(
    async (projectId: string, file: File) => {
      setIsLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post<AnswerKey>(
          `/projects/${projectId}/answer-key/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al subir solucionario";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const processAnswerKey = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<Project>(
        `/projects/${projectId}/answer-key/process`
      );
      setCurrentProject(response.data);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al procesar solucionario";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchQuestions = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Question[]>(
        `/projects/${projectId}/questions`
      );
      setQuestions(response.data);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar preguntas";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuestion = useCallback(
    async (
      projectId: string,
      questionId: string,
      data: Partial<Question>
    ) => {
      setError(null);
      try {
        const response = await api.put<Question>(
          `/projects/${projectId}/questions/${questionId}`,
          data
        );
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? response.data : q))
        );
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al actualizar pregunta";
        setError(message);
        throw err;
      }
    },
    []
  );

  const confirmQuestions = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<Question[]>(
        `/projects/${projectId}/questions/confirm-all`,
        { confirm_all: true }
      );
      setQuestions(response.data);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al confirmar preguntas";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadStudentExams = useCallback(
    async (projectId: string, files: File[]) => {
      setIsLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
        const response = await api.post<StudentExam[]>(
          `/projects/${projectId}/exams/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setStudentExams((prev) => [...prev, ...response.data]);
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al subir examenes";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchStudentExams = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ items: StudentExam[] }>(
        `/projects/${projectId}/exams/`
      );
      const items = response.data.items ?? response.data;
      setStudentExams(items as StudentExam[]);
      return items;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar examenes";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const gradeExams = useCallback(async (projectId: string, regrade = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<TaskLog>(
        `/projects/${projectId}/grading/grade-all`,
        null,
        { params: regrade ? { regrade: true } : undefined }
      );
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al calificar examenes";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pollTaskProgress = useCallback(
    async (taskId: string, onProgress?: (task: TaskLog) => void): Promise<TaskLog> => {
      return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const res = await getTask(taskId);
            const task: TaskLog = res.data;
            if (onProgress) onProgress(task);
            if (task.status === 'completed' || task.status === 'failed') {
              clearInterval(interval);
              resolve(task);
            }
          } catch (err) {
            clearInterval(interval);
            reject(err);
          }
        }, 2000);
      });
    },
    []
  );

  const fetchGradingSummary = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<GradingSummary>(
        `/projects/${projectId}/grading/summary`
      );
      setSummary(response.data);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar resumen";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExamDetail = useCallback(
    async (projectId: string, examId: string) => {
      setError(null);
      try {
        const response = await api.get<{ student_exam: StudentExam; answers: StudentExam["answers"] }>(
          `/projects/${projectId}/exams/${examId}`
        );
        const detail: StudentExam = {
          ...response.data.student_exam,
          answers: response.data.answers,
        };
        return detail;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar detalle del examen";
        setError(message);
        throw err;
      }
    },
    []
  );

  const fetchAnswerKeys = useCallback(async (projectId: string) => {
    setError(null);
    try {
      const response = await api.get<AnswerKey[]>(
        `/projects/${projectId}/answer-key`
      );
      setAnswerKeys(response.data);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar solucionarios";
      setError(message);
      throw err;
    }
  }, []);

  return {
    projects,
    currentProject,
    questions,
    answerKeys,
    studentExams,
    summary,
    isLoading,
    error,
    clearError,
    fetchProjects,
    fetchProject,
    createProject,
    updateProjectConfig,
    uploadAnswerKey,
    processAnswerKey,
    fetchQuestions,
    updateQuestion,
    confirmQuestions,
    uploadStudentExams,
    fetchStudentExams,
    gradeExams,
    pollTaskProgress,
    fetchGradingSummary,
    fetchExamDetail,
    fetchAnswerKeys,
  };
}
