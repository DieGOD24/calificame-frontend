"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getInstitution,
  getInstitutionMembers,
  updateInstitution,
  inviteMember,
  removeMember,
} from "@/lib/api";
import {
  ArrowLeft,
  Users,
  Mail,
  Settings,
  UserPlus,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

interface Institution {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  plan: string | null;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  joined_at: string;
}

type TabKey = "members" | "invitations" | "settings";

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "members", label: "Miembros", icon: <Users className="h-4 w-4" /> },
  {
    key: "invitations",
    label: "Invitaciones",
    icon: <Mail className="h-4 w-4" />,
  },
  {
    key: "settings",
    label: "Configuracion",
    icon: <Settings className="h-4 w-4" />,
  },
];

const tabContentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

export default function InstitutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const institutionId = params.id as string;
  const { user } = useAuth();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("members");
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("professor");
  const [isInviting, setIsInviting] = useState(false);

  // Settings form
  const [settingsName, setSettingsName] = useState("");
  const [settingsColor, setSettingsColor] = useState("#4f46e5");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const allowedRoles = ["developer", "admin", "institution"];
  const hasAccess = user && allowedRoles.includes(user.role);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [instRes, membersRes] = await Promise.all([
        getInstitution(institutionId),
        getInstitutionMembers(institutionId),
      ]);
      const inst = instRes.data;
      setInstitution(inst);
      setSettingsName(inst.name);
      setSettingsColor(inst.primary_color || "#4f46e5");
      setMembers(membersRes.data?.items ?? membersRes.data ?? []);
    } catch {
      toast.error("Error al cargar la institucion");
    } finally {
      setIsLoading(false);
    }
  }, [institutionId]);

  useEffect(() => {
    if (hasAccess && institutionId) fetchData();
    else setIsLoading(false);
  }, [hasAccess, institutionId, fetchData]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      await inviteMember(institutionId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      toast.success("Invitacion enviada");
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("professor");
    } catch {
      toast.error("Error al enviar invitacion");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Eliminar este miembro de la institucion?")) return;
    try {
      await removeMember(institutionId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success("Miembro eliminado");
    } catch {
      toast.error("Error al eliminar miembro");
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await updateInstitution(institutionId, {
        name: settingsName,
        primary_color: settingsColor,
      });
      setInstitution(res.data);
      toast.success("Configuracion guardada");
    } catch {
      toast.error("Error al guardar configuracion");
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="py-16">
        <EmptyState
          title="Acceso restringido"
          description="No tienes permisos para ver esta seccion."
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

  if (!institution) {
    return (
      <EmptyState
        title="Institucion no encontrada"
        description="La institucion solicitada no existe."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/institutions">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Volver
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{
              backgroundColor: institution.primary_color || "#4f46e5",
            }}
          >
            {institution.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {institution.name}
            </h1>
            <p className="text-sm text-gray-500">/{institution.slug}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {activeTab === "members" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  size="sm"
                  leftIcon={<UserPlus className="h-4 w-4" />}
                  onClick={() => setShowInviteModal(true)}
                >
                  Invitar Miembro
                </Button>
              </div>
              {members.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-16 w-16" />}
                  title="Sin miembros"
                  description="Invita miembros a tu institucion."
                />
              ) : (
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-500">
                          <th className="px-6 py-3 font-medium">Nombre</th>
                          <th className="px-6 py-3 font-medium">Email</th>
                          <th className="px-6 py-3 font-medium">Rol</th>
                          <th className="px-6 py-3 font-medium">
                            Fecha de ingreso
                          </th>
                          <th className="px-6 py-3 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr
                            key={member.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-6 py-3 text-gray-900">
                              {member.full_name}
                            </td>
                            <td className="px-6 py-3 text-gray-500">
                              {member.email}
                            </td>
                            <td className="px-6 py-3">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                {member.role}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-gray-500">
                              {formatDate(member.joined_at)}
                            </td>
                            <td className="px-6 py-3">
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="p-1 rounded text-red-500 hover:bg-red-50"
                                title="Eliminar miembro"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === "invitations" && (
            <div className="space-y-4">
              <Card>
                <CardBody>
                  <EmptyState
                    icon={<Mail className="h-16 w-16" />}
                    title="Invitaciones pendientes"
                    description="Las invitaciones enviadas apareceran aqui. Usa el boton 'Invitar Miembro' en la pestana Miembros."
                  />
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  Configuracion de la Institucion
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color primario
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settingsColor}
                      onChange={(e) => setSettingsColor(e.target.value)}
                      className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">
                      {settingsColor}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={handleSaveSettings}
                    isLoading={isSavingSettings}
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              className="fixed inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
            />
            <motion.div
              className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 z-10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Invitar Miembro
                </h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electronico
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="professor">Profesor</option>
                    <option value="admin">Administrador</option>
                    <option value="student">Estudiante</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleInvite} isLoading={isInviting}>
                  Enviar Invitacion
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
