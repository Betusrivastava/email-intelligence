import { useState } from "react";
import EmailExtractor from "@/components/email-extractor";
import OrganizationDatabase from "@/components/organization-database";
import { Mail, Database, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("extract");

  const tabs = [
    { id: "extract", label: "Extract from Email", icon: Mail },
    { id: "database", label: "Organizations Database", icon: Database },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-slate-900">Email Intelligence</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab("extract")}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>New Extraction</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">PS</span>
                </div>
                <span className="text-sm font-medium text-slate-700">Prachi Srivastava</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "extract" && <EmailExtractor />}
        {activeTab === "database" && <OrganizationDatabase />}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-slate-500">Analytics and reporting features will be available in a future update.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
