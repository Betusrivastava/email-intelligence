import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Mail, Database, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import EmailExtractor from "@/components/email-extractor";
import OrganizationDatabase from "@/components/organization-database";

type Tab = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab["id"]>("extract");
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const tabs: Tab[] = [
    { id: "extract", label: "Extract from Email", icon: Mail },
    { id: "database", label: "Organizations Database", icon: Database },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout(() => {
      navigate('/login');
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    navigate('/login');
    return null;
  }

  const getUserInitials = (name?: string | null) => {
    if (!name || typeof name !== 'string') return 'U';
    return name
      .trim()
      .split(/\s+/)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-8 w-8 text-indigo-600" />
                <h1 className="text-xl font-bold text-slate-900">Email Intelligence</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab("extract")}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>New Extraction</span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-700">
                      {getUserInitials(user?.name || user?.email)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {user?.name || user?.email || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "extract" && <EmailExtractor />}
        {activeTab === "database" && <OrganizationDatabase />}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-slate-900">Analytics</h2>
            <p className="mt-2 text-slate-600">Analytics and reporting features will be available in a future update.</p>
          </div>
        )}
      </main>
    </div>
  );
}
