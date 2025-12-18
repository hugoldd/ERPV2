export type ArticleMode = "Sur site" | "À distance" | "Hybride";

export type Article = {
  id: string;
  name: string;
  type: string;
  service: string;
  competencesRequired: string[];
  standardDuration: number;
  mode: ArticleMode;
  description: string;
};

export type WorkDays = {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
};

export type Consultant = {
  id: string;
  name: string;
  competences: string[];
  location: string;
  service: string;
  email?: string;
  phone?: string;
  workDays: WorkDays;
};

export type Competence = {
  id: string;
  name: string;
};

export type PlanningKind = "booking" | "time_off";

export type PlanningItem = {
  id: string;
  consultantId: string;
  kind: PlanningKind;
  title: string;
  notes: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
};

export type ClientContact = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
};

export type Client = {
  id: string;
  clientNumber: string;
  name: string;
  address: string;
  phone: string;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  contacts: ClientContact[];
};

export type ProjectStatus =
  | "devis_en_cours"
  | "commande_receptionnee"
  | "attente_affectation_dp"
  | "en_cours_deploiement"
  | "facture"
  | "paye"
  | "termine";

export type Project = {
  id: string;
  name: string;

  clientId: string;
  clientNumber: string;
  clientName: string;
  clientAddress: string;

  clientContactId?: string | null;
  clientContactName?: string | null;
  clientContactEmail?: string | null;
  clientContactPhone?: string | null;

  commercialName: string;
  projectManagerId?: string | null;
  projectManagerName?: string | null;

  orderDate?: string | null; // YYYY-MM-DD
  salesType: string;
  status: ProjectStatus;
  notes?: string;
};

export type ProjectLine = {
  id: string;
  projectId: string;

  articleId: string;
  articleName: string;
  articleService?: string;
  articleCompetencesRequired?: string[];

  /**
   * Vendu TOTAL (constant au sein d'un groupe)
   */
  soldQuantity: number;

  /**
   * Quantité portée par CETTE ligne (reliquat ou allocation)
   */
  lineQuantity: number;

  amount: number;

  consultantId?: string | null;
  consultantName?: string | null;

  plannedStartDate?: string | null; // YYYY-MM-DD
  plannedEndDate?: string | null;   // YYYY-MM-DD
  plannedQuantity: number;
  realizedQuantity: number;

  bookingId?: string | null;

  /**
   * Identifiant de groupe "chapeau + sous-lignes"
   */
  groupId: string;
};
