export type ProjectTemplateType = "Packagé" | "Sur-mesure";

export type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  type: ProjectTemplateType;
  articles: string[];
  estimatedDuration: number;
  estimatedDays: number;
};
