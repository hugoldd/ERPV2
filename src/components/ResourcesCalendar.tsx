import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Consultant, PlanningItem } from "../types";
import { createPlanningItem, deletePlanningItem, fetchPlanningItems } from "../api/planning";

interface ResourcesCalendarProps {
  consultants: Consultant[];
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (24 * 3600 * 1000));
}

function isWorkingDay(consultant: Consultant, date: Date): boolean {
  const d = date.getDay(); // 0=dim,1=lun,...6=sam
  const wd = consultant.workDays;
  if (!wd) return true;
  switch (d) {
    case 1: return wd.mon;
    case 2: return wd.tue;
    case 3: return wd.wed;
    case 4: return wd.thu;
    case 5: return wd.fri;
    case 6: return wd.sat;
    case 0: return wd.sun;
    default: return true;
  }
}

export function ResourcesCalendar({ consultants }: ResourcesCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(0);
  const daysInWeek = 14;

  const [items, setItems] = useState<PlanningItem[]>([]);
  const [loading, setLoading] = useState(false);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(today.getDate() + currentWeek * 7);

    for (let i = 0; i < daysInWeek; i++) {
      days.push(addDays(startDate, i));
    }
    return days;
  }, [currentWeek]);

  const rangeStart = useMemo(() => toISODate(weekDays[0]), [weekDays]);
  const rangeEnd = useMemo(() => toISODate(weekDays[daysInWeek - 1]), [weekDays]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await fetchPlanningItems(rangeStart, rangeEnd);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart, rangeEnd]);

  const itemsByConsultant = useMemo(() => {
    const map = new Map<string, PlanningItem[]>();
    for (const it of items) {
      const arr = map.get(it.consultantId) ?? [];
      arr.push(it);
      map.set(it.consultantId, arr);
    }
    return map;
  }, [items]);

  const previousWeek = () => setCurrentWeek((w) => w - 1);
  const nextWeek = () => setCurrentWeek((w) => w + 1);

  const handleCreate = async (consultantId: string, startDate: Date) => {
    const title = (prompt("Titre de la réservation :", "Réservation") ?? "").trim();
    if (!title) return;

    const kindPrompt = (prompt("Type (booking / time_off) :", "booking") ?? "booking").trim();
    const kind = kindPrompt === "time_off" ? "time_off" : "booking";

    const durationStr = (prompt("Durée (jours) :", "1") ?? "1").trim();
    const duration = Math.max(1, Number(durationStr) || 1);

    const startISO = toISODate(startDate);
    const endISO = toISODate(addDays(startDate, duration - 1));

    await createPlanningItem({
      consultantId,
      kind,
      title,
      startDate: startISO,
      endDate: endISO,
    });

    await refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    await deletePlanningItem(id);
    await refresh();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-gray-50">
        <h3 className="text-gray-900">Planning {loading ? "• chargement…" : ""}</h3>
        <div className="flex items-center gap-4">
          <button onClick={previousWeek} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-gray-700 min-w-[240px] text-center">
            {weekDays[0].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} -{" "}
            {weekDays[daysInWeek - 1].toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <button onClick={nextWeek} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <div className="grid grid-cols-[200px_repeat(14,1fr)] border-b border-gray-200 bg-gray-50">
            <div className="p-3 border-r border-gray-200">
              <span className="text-gray-700">Consultant</span>
            </div>
            {weekDays.map((day, idx) => (
              <div key={idx} className="p-3 text-center border-r border-gray-200">
                <div className="text-sm text-gray-600">{day.toLocaleDateString("fr-FR", { weekday: "short" })}</div>
                <div className="text-gray-900">{day.getDate()}</div>
              </div>
            ))}
          </div>

          {consultants.map((consultant) => {
            const consultantItems = itemsByConsultant.get(consultant.id) ?? [];

            // Pré-calcul des blocs (start index + durée) dans la fenêtre affichée
            const blocks = consultantItems
              .map((it) => {
                const s = new Date(it.startDate);
                const e = new Date(it.endDate);
                const windowStart = weekDays[0];
                const windowEnd = weekDays[daysInWeek - 1];

                const startClamped = s < windowStart ? windowStart : s;
                const endClamped = e > windowEnd ? windowEnd : e;

                const startIdx = diffDays(startClamped, windowStart);
                const endIdx = diffDays(endClamped, windowStart);
                const days = endIdx - startIdx + 1;

                return { it, startIdx, days };
              })
              .filter((b) => b.days > 0 && b.startIdx >= 0 && b.startIdx < daysInWeek);

            return (
              <div key={consultant.id} className="grid grid-cols-[200px_repeat(14,1fr)] border-b border-gray-200 hover:bg-gray-50">
                <div className="p-3 border-r border-gray-200 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 text-sm">
                      {consultant.name
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-900 text-sm truncate">{consultant.name}</div>
                    <div className="text-gray-500 text-xs">{consultant.service}</div>
                  </div>
                </div>

                {weekDays.map((dayDate, dayIdx) => {
                  const block = blocks.find((b) => dayIdx >= b.startIdx && dayIdx < b.startIdx + b.days);
                  const isStart = block && dayIdx === block.startIdx;

                  const working = isWorkingDay(consultant, dayDate);

                  return (
                    <div
                      key={dayIdx}
                      className="border-r border-gray-200 p-1 relative min-h-[60px]"
                      onDoubleClick={() => {
                        if (!block && working) void handleCreate(consultant.id, dayDate);
                      }}
                      title={!block && working ? "Double-clic pour ajouter" : undefined}
                    >
                      {block ? (
                        isStart ? (
                          <button
                            type="button"
                            onClick={() => void handleDelete(block.it.id)}
                            className={`absolute top-1 left-1 h-[calc(100%-8px)] rounded px-2 py-1 text-xs overflow-hidden text-white ${
                              block.it.kind === "time_off" ? "bg-red-500" : "bg-blue-500"
                            }`}
                            style={{ width: `calc(${block.days * 100}% + ${(block.days - 1) * 1}px)` }}
                            title="Cliquer pour supprimer"
                          >
                            <div className="truncate">{block.it.title}</div>
                          </button>
                        ) : null
                      ) : working ? (
                        <div className="w-full h-full bg-green-50 rounded" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded" />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded" />
          <span className="text-sm text-gray-600">Travaille (libre)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded" />
          <span className="text-sm text-gray-600">Ne travaille pas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span className="text-sm text-gray-600">Réservé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-sm text-gray-600">Absence / indispo</span>
        </div>
      </div>
    </div>
  );
}
