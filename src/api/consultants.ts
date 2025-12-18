import { supabase } from "../lib/supabase";
import type { Consultant } from "../types";
import { ensureCompetenceIds } from "./refData";

export async function fetchConsultants(): Promise<Consultant[]> {
  const { data, error } = await supabase
    .from("consultants")
    .select(
      `
      id,
      name,
      email,
      phone,
      service,
      location,
      work_mon,
      work_tue,
      work_wed,
      work_thu,
      work_fri,
      work_sat,
      work_sun,
      competences:consultant_competences(
        competence:competences(name)
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    service: row.service,
    location: row.location,
    competences: (row.competences ?? [])
      .map((x: any) => x.competence?.name)
      .filter(Boolean),
    workDays: {
      mon: !!row.work_mon,
      tue: !!row.work_tue,
      wed: !!row.work_wed,
      thu: !!row.work_thu,
      fri: !!row.work_fri,
      sat: !!row.work_sat,
      sun: !!row.work_sun,
    },
  }));
}

export async function createConsultant(input: Omit<Consultant, "id">): Promise<void> {
  const { data, error } = await supabase
    .from("consultants")
    .insert({
      name: input.name,
      email: input.email?.trim() ? input.email.trim() : null, // ✅ nullable
      phone: input.phone?.trim() ? input.phone.trim() : null,
      service: input.service,
      location: input.location,
      work_mon: input.workDays.mon,
      work_tue: input.workDays.tue,
      work_wed: input.workDays.wed,
      work_thu: input.workDays.thu,
      work_fri: input.workDays.fri,
      work_sat: input.workDays.sat,
      work_sun: input.workDays.sun,
    })
    .select("id")
    .single();

  if (error) throw error;

  const competenceIds = await ensureCompetenceIds(input.competences);
  if (competenceIds.length > 0) {
    const { error: e2 } = await supabase.from("consultant_competences").insert(
      competenceIds.map((cid) => ({
        consultant_id: data.id,
        competence_id: cid,
      }))
    );
    if (e2) throw e2;
  }
}

export async function updateConsultant(
  id: string,
  input: Omit<Consultant, "id">
): Promise<void> {
  const { error: e1 } = await supabase
    .from("consultants")
    .update({
      name: input.name,
      email: input.email?.trim() ? input.email.trim() : null,
      phone: input.phone?.trim() ? input.phone.trim() : null,
      service: input.service,
      location: input.location,
      work_mon: input.workDays.mon,
      work_tue: input.workDays.tue,
      work_wed: input.workDays.wed,
      work_thu: input.workDays.thu,
      work_fri: input.workDays.fri,
      work_sat: input.workDays.sat,
      work_sun: input.workDays.sun,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from("consultant_competences")
    .delete()
    .eq("consultant_id", id);

  if (e2) throw e2;

  const competenceIds = await ensureCompetenceIds(input.competences);
  if (competenceIds.length > 0) {
    const { error: e3 } = await supabase.from("consultant_competences").insert(
      competenceIds.map((cid) => ({
        consultant_id: id,
        competence_id: cid,
      }))
    );
    if (e3) throw e3;
  }
}

export async function deleteConsultant(id: string): Promise<void> {
  const { error: e1 } = await supabase
    .from("consultant_competences")
    .delete()
    .eq("consultant_id", id);
  if (e1) throw e1;

  const { error: e2 } = await supabase.from("consultants").delete().eq("id", id);
  if (e2) throw e2;
}
