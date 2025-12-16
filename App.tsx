
/// <reference lib="dom" />
import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu,
  X,
  Code2, 
  Github,
  Languages,
  ChevronDown
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Logo from './components/Logo';
import { CategoryId } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { useTools } from './hooks/useTools';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
        aria-label="Change Language"
      >
        <Languages size={20} />
        <span className="text-xs font-medium uppercase w-5 text-center">{language === 'zh' ? '中' : 'EN'}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 animate-fade-in">
          <button
            onClick={() => { setLanguage('en'); setIsOpen(false); }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${language === 'en' ? 'text-primary-600 font-medium' : 'text-gray-700'}`}
          >
            English
          </button>
          <button
            onClick={() => { setLanguage('zh'); setIsOpen(false); }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${language === 'zh' ? 'text-primary-600 font-medium' : 'text-gray-700'}`}
          >
            简体中文
          </button>
        </div>
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const [isHome, setIsHome] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(CategoryId.IMAGE);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const { t } = useLanguage();
  // Get categories with dynamic translations
  const categories = useTools();

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const activeTool = activeCategory?.tools.find(t => t.id === activeToolId);

  const handleToolSelect = (toolId: string, categoryId?: string) => {
    if (categoryId) {
        setActiveCategoryId(categoryId);
    }
    setActiveToolId(toolId);
    setIsHome(false);
    
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setActiveToolId(null); // Reset tool when category changes
    setIsHome(false);
  };

  const goHome = () => {
      setIsHome(true);
      setActiveToolId(null);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <button 
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md md:hidden"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-100">
          <button 
            onClick={goHome}
            className="flex items-center gap-2 font-bold text-xl text-primary-600 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center">
              <Logo size={20} />
            </div>
            LOLO' Shoebox
          </button>
          <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <Sidebar 
          categories={categories} 
          activeCategoryId={activeCategoryId}
          activeToolId={isHome ? null : activeToolId}
          onSelectCategory={handleCategorySelect}
          onSelectTool={(id) => handleToolSelect(id)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            {isHome ? (
                <span className="font-medium text-gray-900">{t('header.home')}</span>
            ) : (
                <>
                    <button 
                    onClick={() => setActiveToolId(null)}
                    className="hover:text-primary-600 transition-colors flex items-center gap-1"
                    >
                    {activeCategory?.name}
                    </button>
                    {activeTool && (
                    <>
                        <span>/</span>
                        <span className="font-medium text-gray-900">{activeTool.name}</span>
                    </>
                    )}
                </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />

            <div className="h-4 w-px bg-gray-200 mx-1"></div>

            <a 
              href="https://github.com/lolo1208/shoebox" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100 flex items-center gap-2 group"
              aria-label="View on GitHub"
            >
              <Github size={20} />
              <span className="text-xs font-medium hidden sm:block max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 ease-in-out whitespace-nowrap">
                GitHub
              </span>
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="w-full mx-auto">
            {isHome ? (
                <Home categories={categories} onSelectTool={handleToolSelect} />
            ) : (
                <>
                    {!activeTool ? (
                    // Category View (Tool Grid)
                    <div className="animate-fade-in max-w-5xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {activeCategory?.name}
                            </h1>
                            <p className="text-gray-500">
                            {activeCategory?.description}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeCategory?.tools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => handleToolSelect(tool.id)}
                                className="flex flex-col text-left p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 hover:ring-1 hover:ring-primary-200 transition-all duration-200 group"
                            >
                                <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                <tool.icon size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {tool.name}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                {tool.description}
                                </p>
                            </button>
                            ))}
                            {activeCategory?.tools.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                <div className="flex justify-center mb-2">
                                    <Code2 size={48} className="opacity-20"/>
                                </div>
                                <p>{t('home.empty.title')}</p>
                                <p className="text-xs mt-1 opacity-60">{t('home.empty.desc')}</p>
                            </div>
                            )}
                        </div>
                    </div>
                    ) : (
                    // Tool Detail View
                    <div className={`animate-fade-in bg-white rounded-xl border border-gray-200 shadow-sm min-h-[500px] ${activeTool.layoutClass || 'w-full'}`}>
                        <div className="border-b border-gray-100 p-6 flex items-center gap-4">
                            <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                            <activeTool.icon size={24} />
                            </div>
                            <div>
                            <h2 className="text-xl font-bold text-gray-900">{activeTool.name}</h2>
                            <p className="text-sm text-gray-500">{activeTool.description}</p>
                            </div>
                        </div>
                        <div className="p-6">
                            {activeTool.component}
                        </div>
                    </div>
                    )}
                </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Wrap the App with LanguageProvider
const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
