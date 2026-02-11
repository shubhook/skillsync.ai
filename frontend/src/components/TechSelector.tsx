import React from "react";

interface TechSelectorProps {
  category: string;
  categoryTitle: string;
  predefinedItems: string[];
  selectedItems: string[];
  customInput: string;
  isOpen: boolean;
  onToggleSection: () => void;
  onToggleSelection: (item: string) => void;
  onAddCustom: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const TechSelector: React.FC<TechSelectorProps> = ({
  category,
  categoryTitle,
  predefinedItems,
  selectedItems,
  customInput,
  isOpen,
  onToggleSection,
  onToggleSelection,
  onAddCustom,
  onInputChange,
  onKeyDown,
}) => {
  const selectedCount = selectedItems.length;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleSection}
        aria-expanded={isOpen}
        aria-controls={`section-${category}`}
        className="w-full px-6 py-5 flex justify-between items-center hover:bg-gray-850 transition-colors"
      >
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-100">{categoryTitle}</h3>
          {selectedCount > 0 && (
            <span className="px-2.5 py-1 bg-white text-gray-900 text-xs font-semibold rounded-full">
              {selectedCount}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isOpen && (
        <div id={`section-${category}`} className="px-6 pb-6 pt-2 border-t border-gray-800">
          {/* Technology chips */}
          <div className="flex flex-wrap gap-2.5 mb-5">
            {predefinedItems.map((item) => {
              const isSelected = selectedItems.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => onToggleSelection(item)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    isSelected
                      ? "bg-white text-gray-900 border-gray-300"
                      : "bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700 border-gray-700 hover:border-gray-600"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {item}
                </button>
              );
            })}
          </div>

          {/* Custom input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={customInput}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Add custom technology..."
              className="flex-1 px-4 py-3 bg-gray-850 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:bg-gray-800 text-sm"
            />
            <button
              onClick={onAddCustom}
              disabled={!customInput.trim()}
              className="px-5 py-3 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg font-medium hover:bg-gray-700 hover:text-white hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-800 disabled:hover:text-gray-300 transition-all text-sm"
            >
              Add
            </button>
          </div>

          {/* Custom items */}
          {selectedItems.some((item) => !predefinedItems.includes(item)) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-600">Custom:</span>
              {selectedItems
                .filter((item) => !predefinedItems.includes(item))
                .map((item, idx) => (
                  <span key={idx} className="text-xs text-gray-400 font-mono bg-gray-800 px-2 py-1 rounded">{item}</span>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TechSelector;