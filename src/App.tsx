import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { PortfolioPage } from "./pages/PortfolioPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { ArticlesPage } from "./pages/ArticlesPage";
import { CompetencesPage } from "./pages/CompetencesPage";
import { AdministrationPage } from "./pages/AdministrationPage";
import { PlanningPage } from "./pages/PlanningPage";
import { ReportingPage } from "./pages/ReportingPage";
import { ClientsPage } from "./pages/ClientsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { supabase } from "./lib/supabase";

export type NavigationPage =
  | "portfolio"
  | "projects"
  | "planning"
  | "resources"
  | "clients"
  | "competences"
  | "articles"
  | "reporting"
  | "administration";

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>("portfolio");
  const [supabaseStatus, setSupabaseStatus] = useState<
    "checking" | "ok" | "error"
  >("checking");
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // 1) Test session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        console.log("Supabase session:", sessionData.session);

        // 2) Optionnel : récupérer le user (non bloquant si pas de session)
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) {
          console.log("Supabase getUser (non bloquant):", userError.message);
        } else {
          console.log("Supabase user:", userData.user);
        }

        setSupabaseStatus("ok");
        setSupabaseError(null);
      } catch (e: any) {
        console.error("Supabase init error:", e);
        setSupabaseStatus("error");
        setSupabaseError(e?.message ?? "Erreur Supabase inconnue.");
      }
    })();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "portfolio":
        return <PortfolioPage />;
      case "projects":
        return <ProjectsPage />;
      case "planning":
        return <PlanningPage />;
      case "resources":
        return <ResourcesPage />;
      case "clients":
        return <ClientsPage />;
      case "competences":
        return <CompetencesPage />;
      case "articles":
        return <ArticlesPage />;
      case "reporting":
        return <ReportingPage />;
      case "administration":
        return <AdministrationPage />;
      default:
        return <PortfolioPage />;
    }
  };

  if (supabaseStatus === "error") {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white border rounded-lg p-6">
          <h1 className="text-lg font-semibold text-gray-900">
            Configuration Supabase invalide
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Vérifiez que vous avez bien défini{" "}
            <code className="px-1 py-0.5 bg-gray-100 rounded">
              VITE_SUPABASE_URL
            </code>{" "}
            et{" "}
            <code className="px-1 py-0.5 bg-gray-100 rounded">
              VITE_SUPABASE_ANON_KEY
            </code>{" "}
            dans les variables d’environnement (GitHub Actions / Secrets si vous
            déployez via Pages).
          </p>
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            {supabaseError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar currentPage={currentPage} />

        <main className="flex-1 overflow-y-auto">
          {supabaseStatus === "checking" && (
            <div className="px-4 py-2 text-sm text-gray-600 border-b bg-white">
              Connexion à Supabase…
            </div>
          )}
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
