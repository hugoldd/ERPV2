-- ERPV3 — Schéma Projets (projects + project_lines)
-- À exécuter dans le SQL editor Supabase (ordre : projects puis project_lines).

-- NOTE : Supabase active généralement pgcrypto (gen_random_uuid()) par défaut.
-- Si besoin :
-- create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Table: projects
-- ------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  client_id uuid not null references public.clients(id) on delete restrict,
  client_contact_id uuid references public.client_contacts(id) on delete set null,

  commercial_name text not null default '',
  project_manager_id uuid references public.consultants(id) on delete set null,

  order_date date,
  sales_type text not null default '',

  status text not null default 'devis_en_cours'
    check (status in (
      'devis_en_cours',
      'commande_receptionnee',
      'attente_affectation_dp',
      'en_cours_deploiement',
      'facture',
      'paye',
      'termine'
    )),

  notes text not null default '',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists projects_order_date_idx on public.projects(order_date);


-- ------------------------------------------------------------
-- Table: project_lines
-- ------------------------------------------------------------
create table if not exists public.project_lines (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null references public.projects(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete restrict,

  sold_quantity numeric(12,2) not null default 0,
  amount numeric(12,2) not null default 0,

  consultant_id uuid references public.consultants(id) on delete set null,
  planned_start_date date,
  planned_end_date date,

  planned_quantity numeric(12,2) not null default 0,
  realized_quantity numeric(12,2) not null default 0,

  booking_id uuid references public.consultant_bookings(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint project_lines_qty_check check (
    planned_quantity <= sold_quantity
    and realized_quantity <= planned_quantity
  )
);

create index if not exists project_lines_project_id_idx on public.project_lines(project_id);
create index if not exists project_lines_consultant_id_idx on public.project_lines(consultant_id);
create index if not exists project_lines_planned_start_date_idx on public.project_lines(planned_start_date);
create index if not exists project_lines_planned_end_date_idx on public.project_lines(planned_end_date);


-- ------------------------------------------------------------
-- (Optionnel) Trigger updated_at
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists trg_project_lines_updated_at on public.project_lines;
create trigger trg_project_lines_updated_at
before update on public.project_lines
for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- (Optionnel) RLS — à activer uniquement si vous utilisez l'auth Supabase + policies.
-- ------------------------------------------------------------
-- alter table public.projects enable row level security;
-- alter table public.project_lines enable row level security;
--
-- create policy "projects_all" on public.projects
--   for all using (true) with check (true);
--
-- create policy "project_lines_all" on public.project_lines
--   for all using (true) with check (true);
