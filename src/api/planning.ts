import { supabase } from "../lib/supabase";
import type { PlanningItem, PlanningKind } from "../types";

export async function fetchPlanningItems(rangeStart: string, rangeEnd: string): Promise<PlanningItem[]> {
  const { data, error } = await supabase
    .from("consultant_bookings")
    .select("id, consultant_id, kind, title, notes, start_date, end_date")
    .lte("start_date", rangeEnd)   // commence avant la fin de la fenêtre
    .gte("end_date", rangeStart)   // finit après le début de la fenêtre
    .order("start_date", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((r: any) => ({
    id: r.id,
    consultantId: r.consultant_id,
    kind: r.kind as PlanningKind,
    title: r.title,
    notes: r.notes ?? "",
    startDate: r.start_date,
    endDate: r.end_date,
  }));
}

export async function createPlanningItem(input: {
  consultantId: string;
  kind?: PlanningKind;
  title: string;
  startDate: string;
  endDate: string;
  notes?: string;
}): Promise<void> {
  const { error } = await supabase.from("consultant_bookings").insert({
    consultant_id: input.consultantId,
    kind: input.kind ?? "booking",
    title: input.title,
    notes: input.notes ?? "",
    start_date: input.startDate,
    end_date: input.endDate,
  });

  if (error) throw error;
}

export async function deletePlanningItem(id: string): Promise<void> {
  const { error } = await supabase.from("consultant_bookings").delete().eq("id", id);
  if (error) throw error;
}
