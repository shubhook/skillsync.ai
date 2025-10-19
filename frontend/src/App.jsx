import { useState } from 'react';
import axios from 'axios';
import Logo from "./assets/logo.png";

function App() {
  const [selected, setSelected] = useState({
    languages: [],
    frameworks: [],
    databases: [],
    others: []
  });

  const [customInputs, setCustomInputs] = useState({
    languages: '',
    frameworks: '',
    databases: '',
    others: ''
  });

  const [openSection, setOpenSection] = useState('languages'); // Default open section

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predefined = {
    languages: ['JavaScript', 'Python', 'Java', 'C/C++', 'Go', 'Rust', 'TypeScript', 'PHP'],
    frameworks: ['React.js', 'Node.js', 'Express.js', 'Next.js', 'Django', 'Flask', 'Spring Boot', 'Vue.js'],
    databases: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Firebase', 'Supabase'],
    others: ['Docker', 'Kubernetes', 'AWS', 'Git', 'REST API', 'GraphQL', 'WebSockets']
  };

  const toggleSelection = (category, item) => {
    setSelected(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i !== item)
        : [...prev[category], item]
    }));
  };

  const addCustom = (category) => {
    const input = customInputs[category].trim();
    if (input) {
      setSelected(prev => ({
        ...prev,
        [category]: [...prev[category], input]
      }));
      setCustomInputs(prev => ({ ...prev, [category]: '' }));
    }
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setProjects([]);

    const dataset = {
      language: selected.languages.join(','),
      framework: selected.frameworks.join(','),
      database: selected.databases.join(','),
      others: selected.others.join(',')
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    try {
      const response = await axios.post(`${API_URL}/ai`, { dataset });
      setProjects(response.data.response.projects || []);
    } catch (err) {
      setError('Failed to fetch project suggestions. Make sure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title, category, items, isOpen }) => (
    <div className={`border-r border-gray-800 last:border-r-0 ${isOpen ? '' : ''}`}>
      <div className="bg-gray-900/50 h-full">
        {/* Section Header */}
        <button
          onClick={() => toggleSection(category)}
          className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-800/50 transition-all border-b border-gray-800"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-100 whitespace-nowrap">{title}</h2>
            {selected[category].length > 0 && (
              <span className="px-2 py-0.5 bg-white text-black rounded-full text-xs font-semibold">
                {selected[category].length}
              </span>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Section Content */}
        {isOpen && (
          <div className="px-4 pb-4 pt-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {items.map(item => (
                <button
                  key={item}
                  onClick={() => toggleSelection(category, item)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selected[category].includes(item)
                      ? 'bg-white text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInputs[category]}
                onChange={(e) => setCustomInputs(prev => ({ ...prev, [category]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustom(category);
                  }
                }}
                placeholder="Add custom..."
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white"
              />
              <button
                onClick={() => addCustom(category)}
                className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-all whitespace-nowrap"
              >
                Add
              </button>
            </div>
            {selected[category].length > 0 && (
              <div className="mt-2 text-xs text-gray-400">
                Selected: {selected[category].join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const ProjectCard = ({ project }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-2xl font-bold text-white">{project.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          project.difficulty === 'Beginner' ? 'bg-green-900 text-green-300' :
          project.difficulty === 'Intermediate' ? 'bg-yellow-900 text-yellow-300' :
          'bg-red-900 text-red-300'
        }`}>
          {project.difficulty}
        </span>
      </div>
      
      <p className="text-gray-400 mb-4">{project.description}</p>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Estimated Time: <span className="text-white">{project.estimatedTime}</span></p>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Tech Stack:</h4>
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech, idx) => (
            <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Learning Outcomes:</h4>
        <ul className="list-disc list-inside space-y-1">
          {project.learningOutcomes.map((outcome, idx) => (
            <li key={idx} className="text-sm text-gray-400">{outcome}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Resources:</h4>
        <div className="space-y-2">
          {project.resources.map((resource, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-800 rounded p-2">
              <div>
                <p className="text-sm text-white">{resource.name}</p>
                <p className="text-xs text-gray-500">{resource.type}</p>
              </div>
              {resource.url !== 'Not available' ? (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-white text-black text-xs rounded hover:bg-gray-200 transition-all"
                >
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
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Navbar */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 
                        w-[66%] max-w-6xl z-50 
                        backdrop-blur-xl bg-gray-900/70 border border-gray-700 
                        rounded-2xl shadow-xl transition-all duration-300 
                        hover:shadow-2xl hover:-translate-y-0.5">
        <div className="flex justify-between items-center px-6 py-3">
          <img
            src={Logo}
            alt="SkillSync Logo"
            className="h-10 w-auto object-contain scale-125"
            style={{ minHeight: '2.5rem', borderRadius: '1vh' }}
          />
          <a
            href="https://github.com/shubhook/skillsync.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-indigo-500 text-white 
                      hover:bg-indigo-600 transition-all text-sm font-medium"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Main Content - Centered with max-width */}
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <header className="mb-12 text-center">
          {/* <p className="text-gray-400 text-lg">Find curated projects tailored to your tech stack</p> */}
        </header>

        {/* Horizontal Accordion Sections */}
        <div className="mb-12">
          <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50">
            {/* Headers Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => toggleSection('languages')}
                className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-800/50 transition-all border-b border-gray-800 border-r border-gray-800 md:last:border-r-0"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-100 whitespace-nowrap">1. Languages</h2>
                  {selected.languages.length > 0 && (
                    <span className="px-2 py-0.5 bg-white text-black rounded-full text-xs font-semibold">
                      {selected.languages.length}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${openSection === 'languages' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <button
                onClick={() => toggleSection('frameworks')}
                className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-800/50 transition-all border-b border-gray-800 border-r border-gray-800 md:last:border-r-0"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-100 whitespace-nowrap">2. Frameworks</h2>
                  {selected.frameworks.length > 0 && (
                    <span className="px-2 py-0.5 bg-white text-black rounded-full text-xs font-semibold">
                      {selected.frameworks.length}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${openSection === 'frameworks' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <button
                onClick={() => toggleSection('databases')}
                className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-800/50 transition-all border-b border-gray-800 border-r border-gray-800 md:last:border-r-0"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-100 whitespace-nowrap">3. Databases</h2>
                  {selected.databases.length > 0 && (
                    <span className="px-2 py-0.5 bg-white text-black rounded-full text-xs font-semibold">
                      {selected.databases.length}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${openSection === 'databases' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <button
                onClick={() => toggleSection('others')}
                className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-800/50 transition-all border-b border-gray-800"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-100 whitespace-nowrap">4. Others</h2>
                  {selected.others.length > 0 && (
                    <span className="px-2 py-0.5 bg-white text-black rounded-full text-xs font-semibold">
                      {selected.others.length}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${openSection === 'others' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Content Area - Full Width */}
            {openSection && (
              <div className="px-4 pb-4 pt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {predefined[openSection].map(item => (
                    <button
                      key={item}
                      onClick={() => toggleSelection(openSection, item)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selected[openSection].includes(item)
                          ? 'bg-white text-black'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInputs[openSection]}
                    onChange={(e) => setCustomInputs(prev => ({ ...prev, [openSection]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustom(openSection);
                      }
                    }}
                    placeholder="Add custom..."
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white"
                  />
                  <button
                    onClick={() => addCustom(openSection)}
                    className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-all whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
                {selected[openSection].length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    Selected: {selected[openSection].join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-4 bg-white text-black rounded-lg font-bold text-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Project Suggestions'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {projects.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Project Suggestions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, idx) => (
                <ProjectCard key={idx} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-800 py-6 text-center text-gray-400 text-sm">
        <p className="mb-3">
          <a
            href="https://github.com/shubhook/skillsync.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-all mx-2"
          >
            GitHub
          </a>
          |
          <a
            href="https://x.com/ShubhamKhakha"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-all mx-2"
          >
            Twitter
          </a>
        </p>
        <p className="text-gray-500">Built with ❤️</p>
      </footer>
    </div>
  );
}

export default App;