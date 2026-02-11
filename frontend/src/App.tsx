import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import TechSelector from "./components/TechSelector";
import ProjectCard from "./components/ProjectCard";
import BookmarksPanel from "./components/BookmarksPanel";
import { BookmarksProvider, Project } from "./context/BookmarksContext";

// Type definitions
type Category = "languages" | "frameworks" | "databases" | "others";

interface SelectedTech {
  languages: string[];
  frameworks: string[];
  databases: string[];
  others: string[];
}

interface CustomInputs {
  languages: string;
  frameworks: string;
  databases: string;
  others: string;
}

interface ApiResponse {
  response: {
    projects: Project[];
  };
}

const predefined: Record<Category, string[]> = {
  languages: ["JavaScript", "Python", "Java", "C/C++", "Go", "Rust", "TypeScript", "PHP"],
  frameworks: ["React.js", "Node.js", "Express.js", "Next.js", "Django", "Flask", "Spring Boot", "Vue.js"],
  databases: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "SQLite", "Firebase", "Supabase"],
  others: ["Docker", "Kubernetes", "AWS", "Git", "REST API", "GraphQL", "WebSockets"],
};

const categories: Category[] = ["languages", "frameworks", "databases", "others"];

const categoryTitles: Record<Category, string> = {
  languages: "Programming Languages",
  frameworks: "Frameworks & Libraries",
  databases: "Databases",
  others: "Tools & Technologies",
};

function AppContent() {
  const [selected, setSelected] = useState<SelectedTech>({
    languages: [],
    frameworks: [],
    databases: [],
    others: [],
  });

  const [customInputs, setCustomInputs] = useState<CustomInputs>({
    languages: "",
    frameworks: "",
    databases: "",
    others: "",
  });

  const [openSections, setOpenSections] = useState<Set<Category>>(new Set(categories));
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookmarksPanelOpen, setBookmarksPanelOpen] = useState(false);

  const allSelected = [
    ...selected.languages,
    ...selected.frameworks,
    ...selected.databases,
    ...selected.others,
  ];

  const toggleSection = (category: Category) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) newSet.delete(category);
      else newSet.add(category);
      return newSet;
    });
  };

  const toggleSelection = (category: Category, item: string) => {
    setSelected((prev) => {
      if (prev[category].includes(item)) {
        return { ...prev, [category]: prev[category].filter((i) => i !== item) };
      }
      return { ...prev, [category]: [...prev[category], item] };
    });
  };

  const addCustom = (category: Category) => {
    const input = customInputs[category].trim();
    if (!input) return;

    const normalized = input.toLowerCase();
    const alreadyExists = [
      ...predefined[category].map((i) => i.toLowerCase()),
      ...selected[category].map((i) => i.toLowerCase()),
    ].includes(normalized);

    if (alreadyExists) {
      setCustomInputs((prev) => ({ ...prev, [category]: "" }));
      return;
    }

    setSelected((prev) => ({ ...prev, [category]: [...prev[category], input] }));
    setCustomInputs((prev) => ({ ...prev, [category]: "" }));
  };

  const removeTag = (item: string) => {
    setSelected((prev) => {
      const newSelected = { ...prev };
      let cat: Category;
      for (cat in newSelected) {
        newSelected[cat] = newSelected[cat].filter((i) => i !== item);
      }
      return newSelected;
    });
  };

  const clearAll = () => {
    setSelected({
      languages: [],
      frameworks: [],
      databases: [],
      others: [],
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setProjects([]);

    if (allSelected.length === 0) {
      setError("Please select at least one technology to generate project ideas.");
      setLoading(false);
      return;
    }

    const payload = {
      language: selected.languages.join(","),
      framework: selected.frameworks.join(","),
      database: selected.databases.join(","),
      others: selected.others.join(","),
    };

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    try {
      const res = await fetch(`${API_URL}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset: payload }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data: ApiResponse = await res.json();
      const fetchedProjects = data?.response?.projects;

      if (!Array.isArray(fetchedProjects)) throw new Error("Invalid response");

      setProjects(fetchedProjects);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      if (errorMessage.includes("Rate limit")) {
        setError(errorMessage);
      } else {
        setError("Unable to generate projects. Please ensure the backend server is running and try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-925 text-gray-100">
      <Navbar onOpenBookmarks={() => setBookmarksPanelOpen(true)} />
      <BookmarksPanel 
        isOpen={bookmarksPanelOpen} 
        onClose={() => setBookmarksPanelOpen(false)} 
      />

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        {/* Hero Section */}
        <header className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Find Your Next Project
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Select your tech stack and let AI generate personalized project ideas tailored to your skills.
          </p>
        </header>

        {/* Selected Technologies Summary */}
        {allSelected.length > 0 && (
          <div className="mb-8 p-5 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <span className="text-gray-300 font-medium">
                {allSelected.length} {allSelected.length === 1 ? 'technology' : 'technologies'} selected
              </span>
              <button
                onClick={clearAll}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allSelected.map((item, idx) => (
                <span
                  key={idx}
                  className="group inline-flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300"
                >
                  {item}
                  <button
                    onClick={() => removeTag(item)}
                    className="text-gray-600 hover:text-white transition-colors"
                    aria-label={`Remove ${item}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tech Selectors */}
        <div className="space-y-4 mb-12">
          {categories.map((category) => (
            <TechSelector
              key={category}
              category={category}
              categoryTitle={categoryTitles[category]}
              predefinedItems={predefined[category]}
              selectedItems={selected[category]}
              customInput={customInputs[category]}
              isOpen={openSections.has(category)}
              onToggleSection={() => toggleSection(category)}
              onToggleSelection={(item) => toggleSelection(category, item)}
              onAddCustom={() => addCustom(category)}
              onInputChange={(value) =>
                setCustomInputs((prev) => ({ ...prev, [category]: value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom(category);
                }
              }}
            />
          ))}
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading || allSelected.length === 0}
            className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Project Ideas"
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-8 p-4 bg-gray-900 border border-gray-700 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        )}

        {/* Project Results */}
        {projects.length > 0 && (
          <section className="mt-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">
                Your Project Ideas
              </h2>
              <p className="text-gray-500">
                {projects.length} personalized suggestions based on your tech stack
              </p>
            </div>
            <div className="space-y-6">
              {projects.map((project, idx) => (
                <ProjectCard key={idx} project={project} index={idx + 1} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

const App = () => {
  return (
    <BookmarksProvider>
      <AppContent />
    </BookmarksProvider>
  );
};

export default App;