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
  soldQuantity: number; // vendu TOTAL
  amount: number; // montant TOTAL

  // Ces champs peuvent exister côté UI, mais avec le modèle "chapeau + sous-lignes"
  // on les ignore à la création et on passe par allocateProjectLineDays.
  consultantId?: string | null;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  plannedQuantity?: number;
  realizedQuantity?: number;

  // optionnel si vous l'utilisez déjà côté UI
  lineQuantity?: number;
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function first<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function groupIntoConsecutiveRanges(daysIso: string[]): Array<{ start: string; end: string; qty: number; days: string[] }> {
  const uniq = Array.from(new Set(daysIso.filter(Boolean))).sort();
  if (uniq.length === 0) return [];

  const toDate = (s: string) => new Date(s + "T00:00:00");
  const ranges: Array<{ start: string; end: string; qty: number; days: string[] }> = [];

  let curStart = uniq[0];
  let curEnd = uniq[0];
  let bucket = [uniq[0]];

  for (let i = 1; i < uniq.length; i++) {
    const prev = toDate(curEnd);
    const next = toDate(uniq[i]);
    const diff = Math.round((next.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      curEnd = uniq[i];
      bucket.push(uniq[i]);
    } else {
      ranges.push({ start: curStart, end: curEnd, qty: bucket.length, days: bucket });
      curStart = uniq[i];
      curEnd = uniq[i];
      bucket = [uniq[i]];
    }
  }

  ranges.push({ start: curStart, end: curEnd, qty: bucket.length, days: bucket });
  return ranges;
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

export async function fetchProjectLines(projectId: string): Promise<ProjectLine[]> {
  const { data, error } = await supabase
    .from("project_lines")
    .select(
      `
      id,
      project_id,
      article_id,
      amount,
      consultant_id,
      planned_start_date,
      planned_end_date,
      planned_quantity,
      realized_quantity,
      booking_id,
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

    soldQuantity: Number(r.sold_total ?? 0), // total vendu (constant dans un groupe)
    lineQuantity: Number(r.line_quantity ?? 0), // quantité portée par la ligne (reliquat ou allocation)

    amount: Number(r.amount ?? 0),

    consultantId: r.consultant_id ?? null,
    consultantName: r.consultant?.name ?? null,

    plannedStartDate: r.planned_start_date ?? null,
    plannedEndDate: r.planned_end_date ?? null,
    plannedQuantity: Number(r.planned_quantity ?? 0),
    realizedQuantity: Number(r.realized_quantity ?? 0),

    bookingId: r.booking_id ?? null,

    groupId: r.group_id ?? r.id,
  }));
}

export async function createProjectLine(projectId: string, input: ProjectLineUpsertInput): Promise<void> {
  const soldTotal = Number(input.soldQuantity ?? 0);
  const totalAmount = Number(input.amount ?? 0);

  if (!(soldTotal > 0)) throw new Error("La quantité vendue est invalide.");

  // Création de la ligne chapeau = reliquat initial
  const { data, error } = await supabase
    .from("project_lines")
    .insert({
      project_id: projectId,
      article_id: input.articleId,

      // colonne legacy pour respecter la contrainte planned <= sold_quantity
      sold_quantity: soldTotal,

      sold_total: soldTotal,
      line_quantity: soldTotal,

      amount: totalAmount,

      consultant_id: null,
      planned_start_date: null,
      planned_end_date: null,
      planned_quantity: 0,
      realized_quantity: 0,
      booking_id: null,
    })
    .select("id")
    .single();

  if (error) throw error;

  await syncBookingForLine(data.id);
}

export async function updateProjectLine(id: string, input: any): Promise<void> {
  const { error } = await supabase
    .from("project_lines")
    .update({
      article_id: input.articleId,
      sold_quantity: Number(input.soldQuantity ?? 0),
      sold_total: Number(input.soldQuantity ?? 0),
      line_quantity: Number(input.lineQuantity ?? input.soldQuantity ?? 0),
      amount: Number(input.amount ?? 0),
      consultant_id: input.consultantId ?? null,
      planned_start_date: input.plannedStartDate ?? null,
      planned_end_date: input.plannedEndDate ?? null,
      planned_quantity: Number(input.plannedQuantity ?? 0),
      realized_quantity: Number(input.realizedQuantity ?? 0),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  await syncBookingForLine(id);
}

/**
 * Planifie une sélection de jours (non consécutifs possible) depuis une ligne reliquat.
 * Signature compatible avec votre ProjectDetailModal: allocateProjectLineDays(lineId, consultantId, days)
 */
export async function allocateProjectLineDays(lineId: string, consultantId: string, days: string[]): Promise<void> {
  const selectedDays = Array.from(new Set((days ?? []).filter(Boolean))).sort();
  if (selectedDays.length === 0) throw new Error("Aucun jour sélectionné.");

  // 1) Charger la ligne reliquat (chapeau)
  const { data: base, error: e0 } = await supabase
    .from("project_lines")
    .select(
      `
      id,
      project_id,
      article_id,
      group_id,
      sold_total,
      line_quantity,
      amount,
      consultant_id,
      planned_start_date,
      planned_end_date,
      planned_quantity
    `
    )
    .eq("id", lineId)
    .single();

  if (e0) throw e0;

  const isRemainder =
    !base.consultant_id &&
    !base.planned_start_date &&
    !base.planned_end_date &&
    Number(base.planned_quantity ?? 0) === 0;

  if (!isRemainder) {
    throw new Error("La planification doit partir de la ligne reliquat (chapeau).");
  }

  const soldTotal = Number(base.sold_total ?? 0);
  const remainderQty = Number(base.line_quantity ?? 0);
  const remainderAmount = Number(base.amount ?? 0);

  if (!(soldTotal > 0)) throw new Error("Vendu total invalide.");
  if (!(remainderQty > 0)) throw new Error("Il n’y a plus de reste à planifier sur ce reliquat.");

  const totalQty = selectedDays.length; // 1 jour = 1 unité
  if (totalQty > remainderQty) throw new Error("La sélection dépasse le reste à planifier.");

  // 2) Découper en blocs consécutifs
  const ranges = groupIntoConsecutiveRanges(selectedDays);
  if (ranges.length === 0) throw new Error("Sélection invalide.");

  // 3) Créer les sous-lignes (allocations) avec montant proratisé du reliquat
  let allocatedAmountSum = 0;
  let allocatedQtySum = 0;

  const toInsert: any[] = [];
  for (let i = 0; i < ranges.length; i++) {
    const seg = ranges[i];
    allocatedQtySum += seg.qty;

    let segAmount = 0;
    if (i < ranges.length - 1) {
      segAmount = round2((remainderAmount * seg.qty) / remainderQty);
      allocatedAmountSum = round2(allocatedAmountSum + segAmount);
    } else {
      segAmount = round2(remainderAmount - allocatedAmountSum);
      allocatedAmountSum = round2(allocatedAmountSum + segAmount);
    }

    toInsert.push({
      project_id: base.project_id,
      article_id: base.article_id,
      group_id: base.group_id,

      sold_quantity: soldTotal,
      sold_total: soldTotal,

      line_quantity: seg.qty,

      consultant_id: consultantId,
      planned_start_date: seg.start,
      planned_end_date: seg.end,
      planned_quantity: seg.qty,
      realized_quantity: 0,

      amount: segAmount,
    });
  }

  const { data: created, error: e1 } = await supabase.from("project_lines").insert(toInsert).select("id");
  if (e1) throw e1;

  // 4) Mettre à jour le reliquat (chapeau)
  const newRemainderQty = round2(remainderQty - allocatedQtySum);
  const newRemainderAmount = round2(remainderAmount - allocatedAmountSum);

  const { error: e2 } = await supabase
    .from("project_lines")
    .update({
      line_quantity: newRemainderQty,
      amount: newRemainderAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", base.id);

  if (e2) throw e2;

  // 5) Synchroniser bookings
  for (const row of created ?? []) {
    await syncBookingForLine(row.id);
  }
}

/**
 * Fonction "réparation" : si vous avez une ligne déjà planifiée mais sans reliquat créé,
 * on crée une ligne reliquat dans le même group_id.
 */
export async function reportProjectLineRemainder(lineId: string): Promise<void> {
  const { data: line, error: e0 } = await supabase
    .from("project_lines")
    .select(
      `
      id,
      project_id,
      article_id,
      group_id,
      sold_total,
      line_quantity,
      amount,
      consultant_id,
      planned_start_date,
      planned_end_date,
      planned_quantity
    `
    )
    .eq("id", lineId)
    .single();

  if (e0) throw e0;

  const lineQty = Number(line.line_quantity ?? 0);
  const planned = Number(line.planned_quantity ?? 0);
  const amount = Number(line.amount ?? 0);
  const soldTotal = Number(line.sold_total ?? 0);

  const isAlreadyRemainder =
    !line.consultant_id && !line.planned_start_date && !line.planned_end_date && planned === 0;

  if (isAlreadyRemainder) return;

  if (!(lineQty > 0)) throw new Error("Quantité de ligne invalide.");
  if (!(planned > 0 && planned < lineQty)) {
    throw new Error("Pour créer un reliquat, planned_quantity doit être strictement entre 0 et line_quantity.");
  }

  const remainderQty = round2(lineQty - planned);
  const amountPlanned = round2((amount * planned) / lineQty);
  const amountRemainder = round2(amount - amountPlanned);

  // 1) ajuster la ligne actuelle
  const { error: e1 } = await supabase
    .from("project_lines")
    .update({
      line_quantity: planned,
      amount: amountPlanned,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lineId);

  if (e1) throw e1;

  // 2) créer le reliquat
  const { error: e2 } = await supabase.from("project_lines").insert({
    project_id: line.project_id,
    article_id: line.article_id,
    group_id: line.group_id,

    sold_quantity: soldTotal,
    sold_total: soldTotal,

    line_quantity: remainderQty,
    amount: amountRemainder,

    consultant_id: null,
    planned_start_date: null,
    planned_end_date: null,
    planned_quantity: 0,
    realized_quantity: 0,
    booking_id: null,
  });

  if (e2) throw e2;

  await syncBookingForLine(lineId);
}

export async function deleteProjectLine(id: string): Promise<void> {
  const { data: line, error: e0 } = await supabase
    .from("project_lines")
    .select(
      `
      id,
      group_id,
      line_quantity,
      amount,
      consultant_id,
      planned_start_date,
      planned_end_date,
      planned_quantity,
      booking_id
    `
    )
    .eq("id", id)
    .single();

  if (e0) throw e0;

  const isRemainder =
    !line.consultant_id &&
    !line.planned_start_date &&
    !line.planned_end_date &&
    Number(line.planned_quantity ?? 0) === 0;

  // Supprimer le booking si présent
  const bookingId = (line.booking_id as string | null) ?? null;
  if (bookingId) {
    const { error: eb } = await supabase.from("consultant_bookings").delete().eq("id", bookingId);
    if (eb) throw eb;
  }

  if (isRemainder) {
    // suppression du groupe complet
    const gid = line.group_id;

    const { data: groupLines, error: eg } = await supabase
      .from("project_lines")
      .select("id, booking_id")
      .eq("group_id", gid);

    if (eg) throw eg;

    const bookingIds = (groupLines ?? []).map((x: any) => x.booking_id).filter(Boolean);
    if (bookingIds.length > 0) {
      const { error: eb2 } = await supabase.from("consultant_bookings").delete().in("id", bookingIds);
      if (eb2) throw eb2;
    }

    const { error: ed } = await supabase.from("project_lines").delete().eq("group_id", gid);
    if (ed) throw ed;

    return;
  }

  // sous-ligne => réinjecter dans le reliquat
  const gid = line.group_id;
  const qtyBack = Number(line.line_quantity ?? 0);
  const amountBack = Number(line.amount ?? 0);

  const { data: rem, error: e1 } = await supabase
    .from("project_lines")
    .select("id, line_quantity, amount")
    .eq("group_id", gid)
    .is("consultant_id", null)
    .is("planned_start_date", null)
    .is("planned_end_date", null)
    .eq("planned_quantity", 0)
    .maybeSingle();

  if (e1) throw e1;
  if (!rem) throw new Error("Reliquat introuvable pour ce groupe.");

  const newQty = round2(Number(rem.line_quantity ?? 0) + qtyBack);
  const newAmount = round2(Number(rem.amount ?? 0) + amountBack);

  const { error: e2 } = await supabase
    .from("project_lines")
    .update({
      line_quantity: newQty,
      amount: newAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", rem.id);

  if (e2) throw e2;

  const { error: e3 } = await supabase.from("project_lines").delete().eq("id", id);
  if (e3) throw e3;
}

async function syncBookingForLine(lineId: string): Promise<void> {
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

  const consultantId = (data as any).consultant_id as string | null;
  const start = (data as any).planned_start_date as string | null;
  const end = (data as any).planned_end_date as string | null;
  const plannedQty = Number((data as any).planned_quantity ?? 0);
  const bookingId = ((data as any).booking_id as string | null) ?? null;

  const hasAll = !!consultantId && !!start && !!end && plannedQty > 0;

  // Si ce n'est pas une allocation => on supprime le booking éventuel
  if (!hasAll) {
    if (bookingId) {
      const { error: e1 } = await supabase.from("consultant_bookings").delete().eq("id", bookingId);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("project_lines").update({ booking_id: null }).eq("id", lineId);
      if (e2) throw e2;
    }
    return;
  }

  // ⚠️ Correction principale: project/client peuvent être typés "array"
  const projectRel = first<any>((data as any).project);
  const clientRel = first<any>(projectRel?.client);

  const clientNumber = clientRel?.client_number ?? "";
  const clientName = clientRel?.name ?? "";
  const projectName = projectRel?.name ?? "Projet";

  const articleRel = first<any>((data as any).article);
  const articleName = articleRel?.name ?? "Prestation";

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
