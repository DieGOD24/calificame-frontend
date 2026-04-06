"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { getInstitutions, createInstitution } from "@/lib/api";
import { Plus, Building2, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Institution {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  plan: string | null;
  member_count?: number;
  created_at: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function InstitutionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const allowedRoles = ["developer", "admin", "institution"];
  const hasAccess = user && allowedRoles.includes(user.role);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getInstitutions();
      setInstitutions(res.data?.items ?? res.data ?? []);
    } catch {
      toast.error("Error al cargar instituciones");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasAccess) fetchData();
    else setIsLoading(false);
  }, [hasAccess, fetchData]);

  const handleCreate = async () => {
    if (!formName.trim()) return;
    setIsCreating(true);
    try {
      const slug = formSlug.trim() || formName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await createInstitution({ name: formName.trim(), slug });
      toast.success("Institucion creada exitosamente");
      setShowModal(false);
      setFormName("");
      setFormSlug("");
      await fetchData();
    } catch {
      toast.error("Error al crear institucion");
    } finally {
      setIsCreating(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instituciones</h1>
          <p className="text-gray-500 mt-1">
            Gestiona las instituciones de la plataforma.
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowModal(true)}
        >
          Nueva Institucion
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16">
          <Spinner size="lg" />
        </div>
      ) : institutions.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-16 w-16" />}
          title="Sin instituciones"
          description="Crea tu primera institucion para comenzar."
          action={
            <Button
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowModal(true)}
            >
              Crear Institucion
            </Button>
          }
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {institutions.map((inst) => (
            <motion.div key={inst.id} variants={cardVariants}>
              <Card
                className="hover:shadow-md transition-shadow"
                onClick={() => router.push(`/institutions/${inst.id}`)}
              >
                <CardBody className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        backgroundColor: inst.primary_color || "#4f46e5",
                      }}
                    >
                      {inst.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {inst.name}
                      </h3>
                      <p className="text-xs text-gray-400">/{inst.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Users className="h-4 w-4" />
                      {inst.member_count ?? 0} miembros
                    </span>
                    {inst.plan && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        {inst.plan}
                      </span>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Institution Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              className="fixed inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 z-10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Nueva Institucion
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej: Universidad Nacional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (opcional)
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="universidad-nacional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} isLoading={isCreating}>
                  Crear
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
