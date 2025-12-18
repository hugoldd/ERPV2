import {
  Briefcase,
  FolderKanban,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Package,
  Building2,
  Award,
} from "lucide-react";
import { NavigationPage } from "../App";

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { icon: Briefcase, label: "Portefeuille projets", page: "portfolio" as NavigationPage },
    { icon: FolderKanban, label: "Projets", page: "projects" as NavigationPage },
    { icon: Calendar, label: "Planning", page: "planning" as NavigationPage },
    { icon: Users, label: "Ressources", page: "resources" as NavigationPage },
    { icon: Building2, label: "Clients", page: "clients" as NavigationPage },
    { icon: Award, label: "Compétences", page: "competences" as NavigationPage },
    { icon: Package, label: "Articles", page: "articles" as NavigationPage },
    { icon: BarChart3, label: "Reporting", page: "reporting" as NavigationPage },
    { icon: Settings, label: "Administration", page: "administration" as NavigationPage },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white">PM</span>
          </div>
          <span className="text-gray-900">ProjectHub</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  currentPage === item.page
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-700">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-gray-900 truncate">Jean Dupont</div>
            <div className="text-gray-500 text-sm">Chef de projet</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
