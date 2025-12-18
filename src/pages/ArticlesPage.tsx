import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { ManageArticleModal } from "../components/modals/ManageArticleModal";
import { Toast } from "../components/Toast";

import type { Article } from "../types";
import { fetchArticles, createArticle, updateArticle, deleteArticle } from "../api/articles";
import { listPrestations, listCompetences } from "../api/refData";

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [prestations, setPrestations] = useState<{ id: string; name: string }[]>([]);
  const [competences, setCompetences] = useState<{ id: string; name: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showAddArticle, setShowAddArticle] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>();

  const [searchTerm, setSearchTerm] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const prestationOptions = useMemo(() => prestations.map((p) => p.name), [prestations]);
  const competenceOptions = useMemo(() => competences.map((c) => c.name), [competences]);

  const refresh = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [a, p, c] = await Promise.all([fetchArticles(), listPrestations(), listCompetences()]);
      setArticles(a);
      setPrestations(p);
      setCompetences(c);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filteredArticles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return articles;

    return articles.filter((article) => {
      return (
        article.name.toLowerCase().includes(term) ||
        article.type.toLowerCase().includes(term) ||
        article.service.toLowerCase().includes(term)
      );
    });
  }, [articles, searchTerm]);

  const handleAddArticle = async (newArticle: Omit<Article, "id">) => {
    await createArticle(newArticle);
    await refresh();
    setToastMessage("Article ajouté avec succès");
    setShowToast(true);
  };

  const handleEditArticle = async (updatedArticle: Omit<Article, "id">) => {
    if (!editingArticle) return;
    await updateArticle(editingArticle.id, updatedArticle);
    await refresh();
    setToastMessage("Article mis à jour");
    setShowToast(true);
    setEditingArticle(undefined);
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
    await deleteArticle(id);
    await refresh();
    setToastMessage("Article supprimé");
    setShowToast(true);
  };

  const getModeColor = (mode: Article["mode"]) => {
    switch (mode) {
      case "Sur site":
        return "bg-blue-100 text-blue-700";
      case "À distance":
        return "bg-green-100 text-green-700";
      case "Hybride":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Vos types (prestations) deviennent dynamiques. On garde vos couleurs
  // pour les libellés connus, sinon fallback.
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Installation: "bg-orange-100 text-orange-700",
      "Paramétrage": "bg-blue-100 text-blue-700",
      Formation: "bg-green-100 text-green-700",
      "Reprise de données": "bg-purple-100 text-purple-700",
      Support: "bg-gray-100 text-gray-700",
      Migration: "bg-pink-100 text-pink-700",
    };
    return colors[type] ?? "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-gray-600">
          Chargement…
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-red-600 mb-3">{errorMsg}</div>
          <button
            onClick={() => void refresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={() => setShowAddArticle(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un article</span>
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-gray-900 mb-2">{article.name}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-sm ${getTypeColor(article.type)}`}>
                    {article.type}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${getModeColor(article.mode)}`}>
                    {article.mode}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingArticle(article)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => void handleDeleteArticle(article.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500 mb-1">Service</div>
                <div className="text-gray-900">{article.service}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Compétences requises</div>
                <div className="flex flex-wrap gap-1">
                  {article.competencesRequired.map((comp, idx) => (
                    <span
                      key={`${comp}-${idx}`}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Durée standard</div>
                <div className="text-gray-900">
                  {article.standardDuration} jour{article.standardDuration > 1 ? "s" : ""}
                </div>
              </div>

              {article.description && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Description</div>
                  <div className="text-gray-600 text-sm">{article.description}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Aucun article trouvé</div>
        </div>
      )}

      {/* Create */}
      <ManageArticleModal
        isOpen={showAddArticle}
        onClose={() => setShowAddArticle(false)}
        onSave={handleAddArticle}
        prestationOptions={prestationOptions}
        competenceOptions={competenceOptions}
      />

      {/* Edit */}
      {editingArticle && (
        <ManageArticleModal
          isOpen={!!editingArticle}
          onClose={() => setEditingArticle(undefined)}
          onSave={handleEditArticle}
          article={editingArticle}
          prestationOptions={prestationOptions}
          competenceOptions={competenceOptions}
        />
      )}

      {showToast && (
        <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
