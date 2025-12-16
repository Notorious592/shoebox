
import React from 'react';
import { ShieldCheck, Zap, Lock, Box } from 'lucide-react';
import Logo from './Logo';
import { Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeProps {
  categories: Category[];
  onSelectTool: (id: string, categoryId: string) => void;
}

const Home: React.FC<HomeProps> = ({ categories, onSelectTool }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Hero Section */}
      <div className="py-20 text-center relative">
        <div className="flex justify-center mb-8">
           <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-primary-600 ring-4 ring-gray-50">
              <Logo size={64} />
           </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
          {t('app.title')}
        </h1>
        <div className="space-y-4 max-w-2xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed">
            {t('home.hero.subtitle')}
            </p>
            <p className="text-lg text-gray-500 font-normal">
            {t('home.hero.tagline')}
            </p>
        </div>
        
        {/* Privacy Badge */}
        <div className="flex justify-center mt-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100 shadow-sm">
                <ShieldCheck size={18} className="fill-current" />
                <span>{t('home.badge')}</span>
            </div>
        </div>
      </div>

      {/* Features Section (Redesigned - Minimal List) */}
      <div className="mb-20 px-6 py-12 bg-gray-50/50 border-y border-gray-100">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shrink-0">
                      <Zap size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-gray-900 mb-1 text-lg">{t('home.feature.perf')}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                          {t('home.feature.perf.desc')}
                      </p>
                  </div>
              </div>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl shrink-0">
                      <Lock size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-gray-900 mb-1 text-lg">{t('home.feature.privacy')}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                          {t('home.feature.privacy.desc')}
                      </p>
                  </div>
              </div>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shrink-0">
                      <Box size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-gray-900 mb-1 text-lg">{t('home.feature.ready')}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                          {t('home.feature.ready.desc')}
                      </p>
                  </div>
              </div>
          </div>
      </div>

      {/* Tools List */}
      <div className="space-y-16 px-4">
          {categories.map(category => (
              <div key={category.id}>
                  <div className="flex flex-col gap-1 mb-6">
                      <div className="flex items-center gap-3">
                          <div className="h-8 w-1 bg-primary-500 rounded-full"></div>
                          <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                      </div>
                      <p className="text-gray-500 pl-4">{category.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {category.tools.map(tool => (
                          <button
                              key={tool.id}
                              onClick={() => onSelectTool(tool.id, category.id)}
                              className="group flex flex-col text-left p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 hover:ring-1 hover:ring-primary-200 transition-all duration-200"
                          >
                              <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                  <tool.icon size={24} />
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 mb-2">
                                  {tool.name}
                              </h3>
                              <p className="text-sm text-gray-500 leading-relaxed">
                                  {tool.description}
                              </p>
                          </button>
                      ))}
                  </div>
              </div>
          ))}
      </div>
      
      {/* Footer */}
      <div className="mt-24 pt-8 border-t border-gray-200 text-center text-gray-400 text-sm pb-8">
          <p>{t('home.footer', { year: new Date().getFullYear() })}</p>
      </div>
    </div>
  );
};

export default Home;
