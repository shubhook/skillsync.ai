import { useState } from 'react';
import Logo from "./assets/logo.png";

const predefined = {
  languages: ['JavaScript', 'Python', 'Java', 'C/C++', 'Go', 'Rust', 'TypeScript', 'PHP'],
  frameworks: ['React.js', 'Node.js', 'Express.js', 'Next.js', 'Django', 'Flask', 'Spring Boot', 'Vue.js'],
  databases: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Firebase', 'Supabase'],
  others: ['Docker', 'Kubernetes', 'AWS', 'Git', 'REST API', 'GraphQL', 'WebSockets']
};

const categories = ['languages', 'frameworks', 'databases', 'others'];

const categoryTitles = {
  languages: 'Languages',
  frameworks: 'Frameworks',
  databases: 'Databases',
  others: 'Others'
};

const categoryIcons = {
  languages: '💻',
  frameworks: '🛠️',
  databases: '🗄️',
  others: '🔧'
};

export default function App() {
  const [selected, setSelected] = useState({
    languages: [],
    frameworks: [],
    databases: [],
    others: []
  });

  const allSelected = [...selected.languages, ...selected.frameworks, ...selected.databases, ...selected.others];

  const removeTag = (item) => {
    setSelected(prev => {
      const newSelected = { ...prev };
      for (const cat in newSelected) {
        newSelected[cat] = newSelected[cat].filter(i => i !== item);
      }
      return newSelected;
    });
  };

  const clearAll = () => {
    setSelected({
      languages: [],
      frameworks: [],
      databases: [],
      others: []
    });
  };

  const [customInputs, setCustomInputs] = useState({
    languages: '',
    frameworks: '',
    databases: '',
    others: ''
  });

  const [openSections, setOpenSections] = useState(new Set(categories));

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSection = (category) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) newSet.delete(category);
      else newSet.add(category);
      return newSet;
    });
  };

  const toggleSelection = (category, item) => {
    setSelected(prev => {
      if (prev[category].includes(item)) {
        return { ...prev, [category]: prev[category].filter(i => i !== item) };
      }
      return { ...prev, [category]: [...prev[category], item] };
    });
  };

  const addCustom = (category) => {
    const input = customInputs[category].trim();
    if (!input) return;

    const normalized = input.toLowerCase();
    const alreadyExists = [
      ...predefined[category].map(i => i.toLowerCase()),
      ...selected[category].map(i => i.toLowerCase())
    ].includes(normalized);

    if (alreadyExists) {
      setCustomInputs(prev => ({ ...prev, [category]: '' }));
      return;
    }

    setSelected(prev => ({ ...prev, [category]: [...prev[category], input] }));
    setCustomInputs(prev => ({ ...prev, [category]: '' }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setProjects([]);

    const hasSelection = allSelected.length > 0;
    if (!hasSelection) {
      setError('Select at least one technology.');
      setLoading(false);
      return;
    }

    const payload = {
      language: selected.languages.join(','),
      framework: selected.frameworks.join(','),
      database: selected.databases.join(','),
      others: selected.others.join(',')
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    try {
      const res = await fetch(`${API_URL}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset: payload })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const fetchedProjects = data?.response?.projects;

      if (!Array.isArray(fetchedProjects)) throw new Error('Invalid response');

      setProjects(fetchedProjects);
    } catch (err) {
      setError('Failed to fetch project suggestions. Check if backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ProjectCard = ({ project }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900/50 to-gray-900 border border-gray-800 p-8 hover:border-gray-700 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-900/20">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-white">{project.title}</h3>
          <span className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider ${project.difficulty === 'Beginner' ? 'bg-green-900/50 text-green-400 border border-green-800' :
            project.difficulty === 'Intermediate' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' :
              'bg-red-900/50 text-red-400 border border-red-800'
            }`}>
            {project.difficulty}
          </span>
        </div>
        <p className="text-gray-300 mb-6 leading-relaxed">{project.description}</p>

        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Estimated Time</p>
          <p className="text-lg font-medium text-white">{project.estimatedTime}</p>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Tech Stack</h4>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech, idx) => (
              <span key={idx} className="px-4 py-2 bg-gray-800/50 text-gray-200 rounded-xl text-sm border border-gray-700">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Learning Outcomes</h4>
          <ul className="space-y-2">
            {project.learningOutcomes.map((outcome, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="text-cyan-400 mt-1">•</span>
                {outcome}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Resources</h4>
          <div className="space-y-3">
            {project.resources.map((resource, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-800/30 rounded-xl p-4 border border-gray-800">
                <div>
                  <p className="font-medium text-white">{resource.name}</p>
                  <p className="text-xs text-gray-500">{resource.type}</p>
                </div>
                {resource.url !== 'Not available' ? (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer"
                    className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all">
                    Open
                  </a>
                ) : (
                  <span className="text-xs text-gray-600">Not available</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-5xl z-50">
        <div className="backdrop-blur-xl bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl px-8 py-4 flex justify-between items-center">
          <img src={Logo} alt="SkillSync Logo" className="h-12" />
          <a href="https://github.com/shubhook/skillsync.ai" target="_blank" rel="noopener noreferrer"
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 transition-all">
            GitHub
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Find Your Next Project
          </h1>
          <p className="text-xl text-gray-400">Select your tech stack and get AI-powered project ideas tailored just for you</p>
        </header>

        {/* Selected Tags Summary */}
        {allSelected.length > 0 && (
          <div className="mb-8 p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-300">Selected Technologies ({allSelected.length})</h3>
              <button onClick={clearAll} className="text-sm text-gray-500 hover:text-white transition">
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {allSelected.map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-full text-sm border border-cyan-800">
                  {item}
                  <button onClick={() => removeTag(item)} className="hover:text-red-400 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Accordion Sections */}
        <div className="mb-12 space-y-4">
          {categories.map((category) => {
            const isOpen = openSections.has(category);
            const items = predefined[category];
            const selectedCount = selected[category].length;

            return (
              <div key={category} className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection(category)}
                  aria-expanded={isOpen}
                  aria-controls={`section-${category}`}
                  className="w-full px-8 py-6 flex justify-between items-center hover:bg-gray-800/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{categoryIcons[category]}</span>
                    <h2 className="text-xl font-semibold">{categoryTitles[category]}</h2>
                    {selectedCount > 0 && (
                      <span className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full text-xs font-bold">
                        {selectedCount}
                      </span>
                    )}
                  </div>
                  <svg className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div id={`section-${category}`} className="px-8 pb-8 pt-4 border-t border-gray-800">
                    <div className="flex flex-wrap gap-3 mb-6">
                      {items.map(item => (
                        <button
                          key={item}
                          onClick={() => toggleSelection(category, item)}
                          className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${selected[category].includes(item)
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                            }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={customInputs[category]}
                        onChange={e => setCustomInputs(prev => ({ ...prev, [category]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom(category))}
                        placeholder="Add custom technology..."
                        className="flex-1 px-5 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                      />
                      <button
                        onClick={() => addCustom(category)}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 transition-all"
                      >
                        Add
                      </button>
                    </div>

                    {selected[category].length > 0 && selected[category].some(item => !predefined[category].includes(item)) && (
                      <div className="mt-4 text-sm text-gray-400">
                        Custom: {selected[category].filter(item => !predefined[category].includes(item)).join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleSubmit}
            disabled={loading || allSelected.length === 0}
            className="px-12 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-xl font-bold rounded-2xl hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-cyan-900/50"
          >
            {loading ? 'Generating Ideas...' : 'Generate Project Ideas'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-12 p-6 bg-red-900/20 border border-red-800 rounded-2xl text-center text-red-300">
            {error}
          </div>
        )}

        {/* Project Results */}
        {projects.length > 0 && (
          <div className="mt-20">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Your Tailored Project Suggestions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, idx) => (
                <ProjectCard key={idx} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-gray-800 py-8 text-center text-gray-500">
        <p className="mb-4">
          <a href="https://github.com/shubhook/skillsync.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white mx-4 transition">GitHub</a>
          <a href="https://x.com/ShubhamKhakha" target="_blank" rel="noopener noreferrer" className="hover:text-white mx-4 transition">Twitter</a>
        </p>
        <p>Built with ❤️</p>
      </footer>
    </div>
  );
}
