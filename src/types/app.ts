export type Section =
  | "home"
  | "clients"
  | "catalogue"
  | "articles"
  | "consultants"
  | "planning"
  | "projects"
  | "settings";

export const SECTIONS: { key: Exclude<Section, "home">; label: string; desc: string; emoji: string }[] = [
  { key: "clients", label: "Clients", desc: "Répertoire & fiches clients", emoji: "🏢" },
  { key: "catalogue", label: "Catalogue", desc: "Structure des offres & catégories", emoji: "🗂️" },
  { key: "articles", label: "Articles", desc: "Référentiel des articles & unités", emoji: "📦" },
  { key: "consultants", label: "Consultants", desc: "Ressources, compétences, disponibilité", emoji: "👥" },
  { key: "planning", label: "Planning", desc: "Calendrier, affectations, jalons", emoji: "🗓️" },
  { key: "projects", label: "Projets", desc: "Commandes → projets → prestations", emoji: "📁" },
  { key: "settings", label: "Paramètres", desc: "Organisation, droits, préférences", emoji: "⚙️" },
];

