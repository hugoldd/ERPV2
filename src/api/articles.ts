// src/api/articles.ts

import { supabase } from "../lib/supabase";
import type { Article } from "../types";
import { ensureCompetenceIds, ensurePrestationId } from "./refData";

export async function fetchArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      id,
      name,
      service,
      standard_duration_days,
      mode,
      description,
      prestation:prestations(name),
      competences:article_competences(
        competence:competences(name)
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    type: row.prestation?.name ?? "",
    service: row.service,
    competencesRequired: (row.competences ?? [])
      .map((x: any) => x.competence?.name)
      .filter(Boolean),
    standardDuration: row.standard_duration_days,
    mode: row.mode,
    description: row.description ?? "",
  }));
}

export async function createArticle(input: Omit<Article, "id">): Promise<void> {
  const prestationId = await ensurePrestationId(input.type);

  const { data, error } = await supabase
    .from("articles")
    .insert({
      name: input.name,
      prestation_id: prestationId,
      service: input.service,
      standard_duration_days: input.standardDuration,
      mode: input.mode,
      description: input.description ?? "",
    })
    .select("id")
    .single();

  if (error) throw error;

  const competenceIds = await ensureCompetenceIds(input.competencesRequired);
  if (competenceIds.length > 0) {
    const { error: e2 } = await supabase.from("article_competences").insert(
      competenceIds.map((cid) => ({
        article_id: data.id,
        competence_id: cid,
      }))
    );
    if (e2) throw e2;
  }
}

export async function updateArticle(
  id: string,
  input: Omit<Article, "id">
): Promise<void> {
  const prestationId = await ensurePrestationId(input.type);

  const { error: e1 } = await supabase
    .from("articles")
    .update({
      name: input.name,
      prestation_id: prestationId,
      service: input.service,
      standard_duration_days: input.standardDuration,
      mode: input.mode,
      description: input.description ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (e1) throw e1;

  // FK non-cascade : on supprime les liens puis on les recrée
  const { error: e2 } = await supabase
    .from("article_competences")
    .delete()
    .eq("article_id", id);

  if (e2) throw e2;

  const competenceIds = await ensureCompetenceIds(input.competencesRequired);
  if (competenceIds.length > 0) {
    const { error: e3 } = await supabase.from("article_competences").insert(
      competenceIds.map((cid) => ({
        article_id: id,
        competence_id: cid,
      }))
    );
    if (e3) throw e3;
  }
}

export async function deleteArticle(id: string): Promise<void> {
  const { error: e1 } = await supabase
    .from("article_competences")
    .delete()
    .eq("article_id", id);
  if (e1) throw e1;

  const { error: e2 } = await supabase.from("articles").delete().eq("id", id);
  if (e2) throw e2;
}
