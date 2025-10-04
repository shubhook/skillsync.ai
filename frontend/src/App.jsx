import { useState } from 'react';
import axios from 'axios';

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

    // Use environment variable for API URL in production
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

  const Section = ({ title, category, items }) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-100">{title}</h2>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map(item => (
          <button
            key={item}
            onClick={() => toggleSelection(category, item)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
          onKeyPress={(e) => e.key === 'Enter' && addCustom(category)}
          placeholder="Add custom..."
          className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
        />
        <button
          onClick={() => addCustom(category)}
          className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
        >
          Add
        </button>
      </div>
      {selected[category].length > 0 && (
        <div className="mt-3 text-sm text-gray-400">
          Selected: {selected[category].join(', ')}
        </div>
      )}
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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-2">SkillSync.ai</h1>
          <p className="text-gray-400">Find curated projects tailored to your tech stack</p>
        </header>

        <div className="mb-12">
          <Section title="1. Languages" category="languages" items={predefined.languages} />
          <Section title="2. Tools/Frameworks" category="frameworks" items={predefined.frameworks} />
          <Section title="3. Databases" category="databases" items={predefined.databases} />
          <Section title="4. Other Skills" category="others" items={predefined.others} />

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
    </div>
  );
}

export default App;