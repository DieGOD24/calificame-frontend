import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo valido"),
  password: z
    .string()
    .min(1, "La contrasena es obligatoria")
    .min(6, "La contrasena debe tener al menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(1, "El nombre es obligatorio")
      .min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z
      .string()
      .min(1, "El correo es obligatorio")
      .email("Ingresa un correo valido"),
    password: z
      .string()
      .min(1, "La contrasena es obligatoria")
      .min(6, "La contrasena debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contrasena"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const projectCreateSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del proyecto es obligatorio")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z
    .string()
    .max(500, "La descripcion no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .max(100, "La materia no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),
});

export type ProjectCreateFormData = z.infer<typeof projectCreateSchema>;

export const projectConfigSchema = z.object({
  exam_type: z.enum(["multiple_choice", "open_ended", "mixed"], {
    required_error: "Selecciona un tipo de examen",
  }),
  total_questions: z
    .number({ required_error: "Indica el numero de preguntas" })
    .min(1, "Debe haber al menos 1 pregunta")
    .max(200, "Maximo 200 preguntas"),
  points_per_question: z
    .number()
    .min(0.1, "Los puntos deben ser mayores a 0")
    .optional(),
  has_multiple_pages: z.boolean(),
  additional_instructions: z
    .string()
    .max(1000, "Las instrucciones no pueden exceder 1000 caracteres")
    .optional()
    .or(z.literal("")),
});

export type ProjectConfigFormData = z.infer<typeof projectConfigSchema>;

export const questionUpdateSchema = z.object({
  question_text: z.string().optional().or(z.literal("")),
  correct_answer: z.string().min(1, "La respuesta correcta es obligatoria"),
  points: z.number().min(0, "Los puntos no pueden ser negativos"),
});

export type QuestionUpdateFormData = z.infer<typeof questionUpdateSchema>;
