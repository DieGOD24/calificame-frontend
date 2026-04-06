"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { listUsers, updateUserRole, getInstitutions } from "@/lib/api";
import {
  Shield,
  Users,
  Building2,
  UserCheck,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { User, UserRole } from "@/types/user";

interface Institution {
  id: string;
  name: string;
  member_count?: number;
  plan: string | null;
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "developer", label: "Developer" },
  { value: "admin", label: "Admin" },
  { value: "institution", label: "Institucion" },
  { value: "professor", label: "Profesor" },
  { value: "student", label: "Estudiante" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const hasAccess = user && ["developer", "admin"].includes(user.role);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, instRes] = await Promise.all([
        listUsers(),
        getInstitutions(),
      ]);
      setUsers(usersRes.data?.items ?? usersRes.data ?? []);
      setInstitutions(instRes.data?.items ?? instRes.data ?? []);
    } catch {
      toast.error("Error al cargar datos de administracion");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasAccess) fetchData();
    else setIsLoading(false);
  }, [hasAccess, fetchData]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole as UserRole } : u
        )
      );
      toast.success("Rol actualizado");
    } catch {
      toast.error("Error al actualizar rol");
    }
  };

  if (!hasAccess) {
    return (
      <div className="py-16">
        <EmptyState
          title="Acceso restringido"
          description="Solo administradores pueden acceder a esta seccion."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const roleCounts = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statsCards = [
    {
      label: "Total Usuarios",
      value: users.length,
      icon: <Users className="h-6 w-6 text-indigo-600" />,
      bg: "bg-indigo-100",
    },
    {
      label: "Profesores",
      value: roleCounts.professor || 0,
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      label: "Estudiantes",
      value: roleCounts.student || 0,
      icon: <GraduationCap className="h-6 w-6 text-green-600" />,
      bg: "bg-green-100",
    },
    {
      label: "Instituciones",
      value: institutions.length,
      icon: <Building2 className="h-6 w-6 text-purple-600" />,
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Panel de Administracion
          </h1>
          <p className="text-gray-500 mt-0.5">
            Gestion de usuarios e instituciones.
          </p>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statsCards.map((stat) => (
          <motion.div key={stat.label} variants={rowVariants}>
            <Card>
              <CardBody className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 ${stat.bg} rounded-xl flex items-center justify-center`}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Usuarios ({users.length})
            </h2>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <motion.table
            className="w-full text-sm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-6 py-3 font-medium">Rol</th>
                <th className="px-6 py-3 font-medium">Activo</th>
                <th className="px-6 py-3 font-medium">Creado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <motion.tr
                  key={u.id}
                  variants={rowVariants}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-3 text-gray-400 font-mono text-xs">
                    {u.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-3 text-gray-900">{u.email}</td>
                  <td className="px-6 py-3 text-gray-700">{u.full_name}</td>
                  <td className="px-6 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      disabled={u.id === user?.id}
                    >
                      {roleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.is_active ? "Si" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {formatDate(u.created_at)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>
      </Card>

      {/* Institutions list */}
      {institutions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Instituciones ({institutions.length})
              </h2>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Nombre</th>
                  <th className="px-6 py-3 font-medium">Miembros</th>
                  <th className="px-6 py-3 font-medium">Plan</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst) => (
                  <tr
                    key={inst.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-gray-900 font-medium">
                      {inst.name}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {inst.member_count ?? 0}
                    </td>
                    <td className="px-6 py-3">
                      {inst.plan ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          {inst.plan}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
