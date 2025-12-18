import { supabase } from "../lib/supabase";
import type { Competence } from "../types";

export async function fetchCompetences(): Promise<Competence[]> {
  const { data, error } = await supabase
    .from("competences")
    .select("id,name")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Competence[];
}

export async function createCompetence(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Le nom de compétence est vide.");

  const { error } = await supabase.from("competences").insert({ name: trimmed });
  if (error) throw error;
}

export async function updateCompetence(id: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Le nom de compétence est vide.");

  const { error } = await supabase
    .from("competences")
    .update({ name: trimmed })
    .eq("id", id);

  if (error) throw error;
}

// Supprime d'abord les liens (articles / consultants) puis la compétence
export async function deleteCompetence(id: string): Promise<void> {
  const { error: e1 } = await supabase
    .from("article_competences")
    .delete()
    .eq("competence_id", id);
  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from("consultant_competences")
    .delete()
    .eq("competence_id", id);
  if (e2) throw e2;

  const { error: e3 } = await supabase.from("competences").delete().eq("id", id);
  if (e3) throw e3;
}
