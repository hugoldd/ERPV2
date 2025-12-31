import { supabase } from "../lib/supabase";
import type { Project, ProjectLine, ProjectStatus } from "../types";

export type ProjectUpsertInput = {
  name: string;
  clientId: string;
  clientContactId?: string | null;
  commercialName: string;
  projectManagerId?: string | null;
  orderDate?: string | null; // YYYY-MM-DD
  salesType: string;
  status: ProjectStatus;
  notes?: string;
};

export type ProjectLineUpsertInput = {
  articleId: string;
  soldQuantity: number;
  amount: number;
  consultantId?: string | null;
  plannedStartDate?: string | null; // YYYY-MM-DD
  plannedEndDate?: string | null; // YYYY-MM-DD
  plannedQuantity: number;
  realizedQuantity: number;
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      name,
      order_date,
      sales_type,
      status,
      commercial_name,
      notes,
      client_id,
      client:clients(
        id,
        client_number,
        name,
        address
      ),
      client_contact_id,
      contact:client_contacts(
        id,
        name,
        email,
        phone
      ),
      project_manager_id,
      project_manager:consultants(
        id,
        name
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    clientId: r.client_id,
    clientNumber: r.client?.client_number ?? "",
    clientName: r.client?.name ?? "",
    clientAddress: r.client?.address ?? "",
    clientContactId: r.client_contact_id ?? null,
    clientContactName: r.contact?.name ?? null,
    clientContactEmail: r.contact?.email ?? null,
    clientContactPhone: r.contact?.phone ?? null,
    commercialName: r.commercial_name ?? "",
    projectManagerId: r.project_manager_id ?? null,
    projectManagerName: r.project_manager?.name ?? null,
    orderDate: r.order_date ?? null,
    salesType: r.sales_type ?? "",
    status: r.status as ProjectStatus,
    notes: r.notes ?? "",
  }));
}

export async function createProject(input: ProjectUpsertInput): Promise<void> {
  const { error } = await supabase.from("projects").insert({
    name: input.name,
    client_id: input.clientId,
    client_contact_id: input.clientContactId ?? null,
    commercial_name: input.commercialName ?? "",
    project_manager_id: input.projectManagerId ?? null,
    order_date: input.orderDate ?? null,
    sales_type: input.salesType ?? "",
    status: input.status,
    notes: input.notes ?? "",
  });
  if (error) throw error;
}

export async function updateProject(id: string, input: ProjectUpsertInput): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update({
      name: input.name,
      client_id: input.clientId,
      client_contact_id: input.clientContactId ?? null,
      commercial_name: input.commercialName ?? "",
      project_manager_id: input.projectManagerId ?? null,
      order_date: input.orderDate ?? null,
      sales_type: input.salesType ?? "",
      status: input.status,
      notes: input.notes ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ✅ CORRIGÉ : Ajout de comment, group_id, sold_total, line_quantity
export async function fetchProjectLines(projectId: string): Promise<ProjectLine[]> {
  const { data, error } = await supabase
    .from("project_lines")
    .select(
      `
      id,
      project_id,
      article_id,
      sold_quantity,
      amount,
      consultant_id,
      planned_start_date,
      planned_end_date,
      planned_quantity,
      realized_quantity,
      booking_id,
      comment,
      group_id,
      sold_total,
      line_quantity,
      article:articles(
        id,
        name,
        service,
        competences:article_competences(
          competence:competences(name)
        )
      ),
      consultant:consultants(
        id,
        name
      )
    `
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((r: any) => ({
    id: r.id,
    projectId: r.project_id,
    articleId: r.article_id,
    articleName: r.article?.name ?? "",
    articleService: r.article?.service ?? "",
    articleCompetencesRequired: (r.article?.competences ?? [])
      .map((x: any) => x.competence?.name)
      .filter(Boolean),
    soldQuantity: Number(r.sold_quantity ?? 0),
    lineQuantity: Number(r.line_quantity ?? 0), // ✅ AJOUTÉ
    amount: Number(r.amount ?? 0),
    consultantId: r.consultant_id ?? null,
    consultantName: r.consultant?.name ?? null,
    plannedStartDate: r.planned_start_date ?? null,
    plannedEndDate: r.planned_end_date ?? null,
    plannedQuantity: Number(r.planned_quantity ?? 0),
    realizedQuantity: Number(r.realized_quantity ?? 0),
    bookingId: r.booking_id ?? null,
    groupId: r.group_id ?? r.id, // ✅ AJOUTÉ (fallback sur id si null)
  }));
}

export async function createProjectLine(projectId: string, input: ProjectLineUpsertInput): Promise<void> {
  const { data, error } = await supabase
    .from("project_lines")
    .insert({
      project_id: projectId,
      article_id: input.articleId,
      sold_quantity: input.soldQuantity,
      amount: input.amount,
      consultant_id: input.consultantId ?? null,
      planned_start_date: input.plannedStartDate ?? null,
      planned_end_date: input.plannedEndDate ?? null,
      planned_quantity: input.plannedQuantity ?? 0,
      realized_quantity: input.realizedQuantity ?? 0,
    })
    .select("id")
    .single();

  if (error) throw error;

  // Synchronisation planning (si dates + ressource + qté planifiée)
  await syncBookingForLine(data.id);
}

export async function updateProjectLine(id: string, input: ProjectLineUpsertInput): Promise<void> {
  const { error } = await supabase
    .from("project_lines")
    .update({
      article_id: input.articleId,
      sold_quantity: input.soldQuantity,
      amount: input.amount,
      consultant_id: input.consultantId ?? null,
      planned_start_date: input.plannedStartDate ?? null,
      planned_end_date: input.plannedEndDate ?? null,
      planned_quantity: input.plannedQuantity ?? 0,
      realized_quantity: input.realizedQuantity ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  await syncBookingForLine(id);
}

export async function deleteProjectLine(id: string): Promise<void> {
  // supprime d'abord le booking (si présent)
  const { data, error: e0 } = await supabase
    .from("project_lines")
    .select("booking_id")
    .eq("id", id)
    .maybeSingle();
  if (e0) throw e0;

  const bookingId = data?.booking_id as string | null | undefined;
  if (bookingId) {
    const { error: e1 } = await supabase.from("consultant_bookings").delete().eq("id", bookingId);
    if (e1) throw e1;
  }

  const { error } = await supabase.from("project_lines").delete().eq("id", id);
  if (error) throw error;
}

export async function reportProjectLineRemainder(lineId: string): Promise<void> {
  // Récupère la ligne
  const { data: line, error: e0 } = await supabase
    .from("project_lines")
    .select(
      "id, project_id, article_id, sold_quantity, amount, consultant_id, planned_start_date, planned_end_date, planned_quantity, realized_quantity"
    )
    .eq("id", lineId)
    .single();

  if (e0) throw e0;

  const sold = Number(line.sold_quantity ?? 0);
  const planned = Number(line.planned_quantity ?? 0);
  const amount = Number(line.amount ?? 0);

  if (!(sold > 0)) throw new Error("La quantité vendue est invalide.");
  if (!(planned > 0 && planned < sold)) {
    throw new Error("Pour reporter un reliquat, la quantité planifiée doit être strictement entre 0 et la quantité vendue.");
  }

  const remainder = sold - planned;
  const amountPlanned = round2((amount * planned) / sold);
  const amountRemainder = round2(amount - amountPlanned);

  // 1) Met à jour la ligne actuelle pour ne garder que la partie planifiée
  const { error: e1 } = await supabase
    .from("project_lines")
    .update({
      sold_quantity: planned,
      amount: amountPlanned,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lineId);
  if (e1) throw e1;

  // 2) Crée une nouvelle ligne pour le reliquat (non planifié)
  const { error: e2 } = await supabase.from("project_lines").insert({
    project_id: line.project_id,
    article_id: line.article_id,
    sold_quantity: remainder,
    amount: amountRemainder,
    consultant_id: null,
    planned_start_date: null,
    planned_end_date: null,
    planned_quantity: 0,
    realized_quantity: 0,
  });
  if (e2) throw e2;

  // 3) Met à jour le booking si besoin (la ligne planifiée a peut-être changé de montant/qté)
  await syncBookingForLine(lineId);
}

async function syncBookingForLine(lineId: string): Promise<void> {
  // On relit la ligne avec les infos nécessaires pour construire un titre lisible
  const { data, error } = await supabase
    .from("project_lines")
    .select(
      `
      id,
      booking_id,
      consultant_id,
      planned_start_date,
      planned_end_date,
      planned_quantity,
      article:articles(name),
      project:projects(
        name,
        client:clients(client_number, name)
      )
    `
    )
    .eq("id", lineId)
    .single();

  if (error) throw error;

  const consultantId = data.consultant_id as string | null;
  const start = data.planned_start_date as string | null;
  const end = data.planned_end_date as string | null;
  const plannedQty = Number(data.planned_quantity ?? 0);
  const bookingId = (data.booking_id as string | null) ?? null;

  const hasAll = !!consultantId && !!start && !!end && plannedQty > 0;

  if (!hasAll) {
    if (bookingId) {
      const { error: e1 } = await supabase.from("consultant_bookings").delete().eq("id", bookingId);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("project_lines").update({ booking_id: null }).eq("id", lineId);
      if (e2) throw e2;
    }
    return;
  }

  const clientNumber = data.project?.client?.client_number ?? "";
  const clientName = data.project?.client?.name ?? "";
  const projectName = data.project?.name ?? "Projet";
  const articleName = data.article?.name ?? "Prestation";

  const title = `${clientNumber} • ${clientName} — ${projectName} — ${articleName}`.trim();
  const notes = `Ligne projet: ${lineId}\nQté planifiée: ${plannedQty}`;

  if (bookingId) {
    const { error: e1 } = await supabase
      .from("consultant_bookings")
      .update({
        consultant_id: consultantId,
        kind: "booking",
        title,
        notes,
        start_date: start,
        end_date: end,
      })
      .eq("id", bookingId);
    if (e1) throw e1;
    return;
  }

  const { data: created, error: e2 } = await supabase
    .from("consultant_bookings")
    .insert({
      consultant_id: consultantId,
      kind: "booking",
      title,
      notes,
      start_date: start,
      end_date: end,
    })
    .select("id")
    .single();
  if (e2) throw e2;

  const { error: e3 } = await supabase.from("project_lines").update({ booking_id: created.id }).eq("id", lineId);
  if (e3) throw e3;
}
