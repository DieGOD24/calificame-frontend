"use client";

import { useState, useCallback } from "react";
import {
  getInstitutions,
  createInstitution as createInstitutionApi,
  getInstitutionMembers,
  inviteMember as inviteMemberApi,
  removeMember as removeMemberApi,
} from "@/lib/api";
import type { Institution, InstitutionMember } from "@/types/institution";

export function useInstitutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [members, setMembers] = useState<InstitutionMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInstitutions();
      setInstitutions(res.data);
      return res.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar instituciones";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createInstitution = useCallback(
    async (data: { name: string; slug: string; logo_url?: string; primary_color?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await createInstitutionApi(data);
        setInstitutions((prev) => [res.data, ...prev]);
        return res.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al crear institucion";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchMembers = useCallback(async (institutionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInstitutionMembers(institutionId);
      setMembers(res.data);
      return res.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar miembros";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteMember = useCallback(
    async (institutionId: string, data: { email: string; role: string }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await inviteMemberApi(institutionId, data);
        return res.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al invitar miembro";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeMember = useCallback(
    async (institutionId: string, memberId: string) => {
      setLoading(true);
      setError(null);
      try {
        await removeMemberApi(institutionId, memberId);
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al eliminar miembro";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    institutions,
    members,
    loading,
    error,
    fetchInstitutions,
    createInstitution,
    fetchMembers,
    inviteMember,
    removeMember,
  };
}
