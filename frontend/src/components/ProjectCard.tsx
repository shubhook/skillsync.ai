import React from "react";
import { useBookmarks, Project } from "../context/BookmarksContext";

interface ProjectCardProps {
  project: Project;
  index: number;
  showRemoveBookmark?: boolean;
  onRemove?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, showRemoveBookmark = false, onRemove }) => {
  const { addBookmark, removeBookmark, isBookmarked, getBookmarkId } = useBookmarks();
  const bookmarked = isBookmarked(project);

  const handleBookmarkClick = () => {
    if (bookmarked) {
      const id = getBookmarkId(project);
      if (id) {
        removeBookmark(id);
        if (onRemove) onRemove();
      }
    } else {
      addBookmark(project);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-gray-600 font-mono">#{String(index).padStart(2, '0')}</span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-800 text-gray-400 border border-gray-700">
              {project.difficulty}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">{project.title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {project.estimatedTime}
          </div>
          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkClick}
            className={`p-2 rounded-lg border transition-all ${
              bookmarked
                ? "bg-white text-gray-900 border-gray-300 hover:bg-gray-200"
                : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600"
            }`}
            title={bookmarked ? "Remove bookmark" : "Bookmark this project"}
          >
            <svg 
              className="w-5 h-5" 
              fill={bookmarked ? "currentColor" : "none"} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-400 mb-6 leading-relaxed">{project.description}</p>

      {/* Tech Stack */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Tech Stack</h4>
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 font-mono"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Learning Outcomes */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">What You'll Learn</h4>
        <ul className="space-y-2">
          {project.learningOutcomes.map((outcome, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-gray-400">
              <span className="text-gray-600 mt-0.5">-</span>
              {outcome}
            </li>
          ))}
        </ul>
      </div>

      {/* Resources */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Resources</h4>
        <div className="grid gap-2">
          {project.resources.map((resource, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-850 rounded-lg p-3 border border-gray-800"
            >
              <div>
                <p className="text-sm text-gray-300 font-medium">{resource.name}</p>
                <p className="text-xs text-gray-600">{resource.type}</p>
              </div>
              {resource.url !== "Not available" ? (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Open
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
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
};

export default ProjectCard;