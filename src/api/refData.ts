// src/api/refData.ts
import { supabase } from "../lib/supabase";

/**
 * LISTES (pour alimenter les dropdowns)
 */
export async function listPrestations(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from("prestations")
    .select("id,name")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as { id: string; name: string }[];
}

export async function listCompetences(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from("competences")
    .select("id,name")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as { id: string; name: string }[];
}

/**
 * PRESTATIONS
 * Retourne l'id de la prestation (la crée si elle n'existe pas).
 */
export async function ensurePrestationId(name: string): Promise<string> {
  const trimmed = (name ?? "").trim();
  if (!trimmed) throw new Error("Le nom de prestation est vide.");

  // 1) Cherche existant
  const { data: existing, error: e1 } = await supabase
    .from("prestations")
    .select("id")
    .eq("name", trimmed)
    .maybeSingle();

  if (e1) throw e1;
  if (existing?.id) return existing.id;

  // 2) Crée
  const { data: created, error: e2 } = await supabase
    .from("prestations")
    .insert({ name: trimmed })
    .select("id")
    .single();

  if (!e2 && created?.id) return created.id;

  // 3) Si collision (ou autre raison), retente un select
  const { data: existing2, error: e3 } = await supabase
    .from("prestations")
    .select("id")
    .eq("name", trimmed)
    .maybeSingle();

  if (e3) throw e3;
  if (existing2?.id) return existing2.id;

  // Sinon on remonte l'erreur d'insert
  if (e2) throw e2;
  throw new Error("Impossible de créer / récupérer la prestation.");
}

/**
 * COMPETENCES
 * Retourne les ids des compétences (crée celles qui manquent).
 */
export async function ensureCompetenceIds(names: string[]): Promise<string[]> {
  const uniq = Array.from(
    new Set((names ?? []).map((n) => (n ?? "").trim()).filter(Boolean))
  );
  if (uniq.length === 0) return [];

  // 1) Récupère les existantes
  const { data: existing, error: e1 } = await supabase
    .from("competences")
    .select("id,name")
    .in("name", uniq);

  if (e1) throw e1;

  const existingNames = new Set((existing ?? []).map((c: any) => c.name));
  const missing = uniq.filter((n) => !existingNames.has(n));

  // 2) Crée les manquantes
  if (missing.length > 0) {
    const { error: e2 } = await supabase
      .from("competences")
      .insert(missing.map((name) => ({ name })));

    // Si vous avez une contrainte UNIQUE(name), une collision peut arriver : on ignore et on reselect.
    if (e2 && e2.code !== "23505") throw e2;
  }

  // 3) Re-sélection pour récupérer tous les ids
  const { data: all, error: e3 } = await supabase
    .from("competences")
    .select("id,name")
    .in("name", uniq);

  if (e3) throw e3;

  const byName = new Map<string, string>(
    (all ?? []).map((x: any) => [x.name, x.id])
  );

  return uniq.map((n) => byName.get(n)).filter(Boolean) as string[];
}
