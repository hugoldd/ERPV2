import { Mail, Phone, MapPin, Award, Pencil, Trash2 } from "lucide-react";
import type { Consultant } from "../types";

interface ResourcesTableProps {
  consultants: Consultant[];
  onEdit: (c: Consultant) => void;
  onDelete: (id: string) => void;
}

const dayLabels: { key: keyof Consultant["workDays"]; label: string }[] = [
  { key: "mon", label: "L" },
  { key: "tue", label: "M" },
  { key: "wed", label: "Me" },
  { key: "thu", label: "J" },
  { key: "fri", label: "V" },
  { key: "sat", label: "S" },
  { key: "sun", label: "D" },
];

export function ResourcesTable({ consultants, onEdit, onDelete }: ResourcesTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Consultant</th>
              <th className="px-6 py-3 text-left text-gray-700">Service</th>
              <th className="px-6 py-3 text-left text-gray-700">Compétences</th>
              <th className="px-6 py-3 text-left text-gray-700">Localisation</th>
              <th className="px-6 py-3 text-left text-gray-700">Contact</th>
              <th className="px-6 py-3 text-left text-gray-700">Jours</th>
              <th className="px-6 py-3 text-right text-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {consultants.map((consultant) => (
              <tr key={consultant.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700">
                        {consultant.name
                          .split(" ")
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="text-gray-900">{consultant.name}</div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {consultant.service}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {consultant.competences?.length ? (
                      consultant.competences.map((comp, idx) => (
                        <span
                          key={`${comp}-${idx}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          <Award className="w-3 h-3" />
                          {comp}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {consultant.location}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {consultant.email ? (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Mail className="w-3 h-3" />
                        <a href={`mailto:${consultant.email}`} className="hover:text-blue-600">
                          {consultant.email}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Mail className="w-3 h-3" />—
                      </div>
                    )}

                    {consultant.phone ? (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Phone className="w-3 h-3" />
                        <a href={`tel:${consultant.phone}`} className="hover:text-blue-600">
                          {consultant.phone}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Phone className="w-3 h-3" />—
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    {dayLabels.map((d) => (
                      <span
                        key={d.key}
                        className={`w-7 h-7 rounded flex items-center justify-center text-xs border ${
                          consultant.workDays?.[d.key]
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-gray-200 text-gray-400"
                        }`}
                        title={d.key}
                      >
                        {d.label}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit(consultant);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(consultant.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {consultants.length === 0 && (
        <div className="py-12 text-center text-gray-500">Aucun consultant trouvé</div>
      )}
    </div>
  );
}
