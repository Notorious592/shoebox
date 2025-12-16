
/// <reference lib="dom" />
import React, { useState, useEffect } from 'react';
import { Copy, FileJson, Trash2, Minimize2, Check, Wand2, ChevronRight, ChevronDown, ArrowRight, Sparkles, ArrowDownAZ, ArrowUpAZ, AlignLeft, Settings2 } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useLanguage } from '../../contexts/LanguageContext';

// ... (JsonNode logic remains unchanged, skipping for brevity, assume it is here)
interface JsonNodeProps {
  name?: string;
  value: any;
  isLast?: boolean;
  depth?: number;
}

const JsonNode: React.FC<JsonNodeProps> = ({ name, value, isLast = true, depth = 0 }) => {
  const [expanded, setExpanded] = useState(true);

  const getType = (val: any) => {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  };

  const type = getType(value);
  const isObject = type === 'object' || type === 'array';
  const isEmpty = isObject && Object.keys(value).length === 0;

  const renderValue = (val: any, type: string) => {
    if (val === null) return <span className="text-gray-400 font-bold">null</span>;
    if (type === 'string') return <span className="text-green-600">"{val}"</span>;
    if (type === 'number') return <span className="text-blue-600">{val}</span>;
    if (type === 'boolean') return <span className="text-purple-600 font-bold">{val.toString()}</span>;
    return <span>{String(val)}</span>;
  };

  if (isObject) {
    const keys = Object.keys(value);
    const isArray = Array.isArray(value);
    const bracketOpen = isArray ? '[' : '{';
    const bracketClose = isArray ? ']' : '}';

    return (
      <div className="font-mono text-sm leading-6">
        <div className="flex items-start hover:bg-gray-50 rounded px-1 -ml-1">
          <button 
            onClick={() => !isEmpty && setExpanded(!expanded)}
            className={`mr-1 mt-1 text-gray-400 hover:text-gray-700 transition-colors ${isEmpty ? 'invisible' : ''}`}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          <div className="flex-1 break-all">
            {name && <span className="text-gray-800 font-semibold">"{name}": </span>}
            <span className="text-gray-500">{bracketOpen}</span>
            
            {!expanded && (
               <button 
                  onClick={() => setExpanded(true)}
                  className="mx-1 text-gray-400 bg-gray-100 px-1 rounded text-xs hover:bg-gray-200"
               >
                  {isArray ? `Array(${keys.length})` : `Object{...}`}
               </button>
            )}

            {!expanded && <span className="text-gray-500">{bracketClose}{!isLast && ','}</span>}
          </div>
        </div>

        {expanded && !isEmpty && (
           <div style={{ paddingLeft: '1.5rem' }}>
              {keys.map((key, index) => (
                <JsonNode 
                  key={key} 
                  name={isArray ? undefined : key}
                  value={value[key]} 
                  isLast={index === keys.length - 1} 
                  depth={depth + 1}
                />
              ))}
           </div>
        )}

        {expanded && (
           <div className="pl-6 text-gray-500">
              {bracketClose}{!isLast && ','}
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="font-mono text-sm leading-6 hover:bg-gray-50 rounded px-1 -ml-1 pl-7 flex break-all">
        <div>
            {name && <span className="text-gray-800 font-semibold mr-1">"{name}":</span>}
            {renderValue(value, type)}
            {!isLast && <span className="text-gray-500">,</span>}
        </div>
    </div>
  );
};

const JsonFormatter: React.FC = () => {
  const { t } = useLanguage();
  const [input, setInput] = useLocalStorage<string>('tool-json-input', '');
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [indentSize, setIndentSize] = useLocalStorage<number>('tool-json-indent', 2);
  const [sortOrder, setSortOrder] = useLocalStorage<'none' | 'asc' | 'desc'>('tool-json-sort', 'none');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setParsedData(null);
        setError(null);
        return;
      }
      try {
        const cleanInput = input.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        const parsed = JSON.parse(cleanInput);
        setParsedData(parsed);
        setError(null);
      } catch (e) {
        setParsedData(null);
        setError((e as Error).message);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [input]);

  const sortObject = (obj: any, order: 'asc' | 'desc'): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      if (Array.isArray(obj)) {
          return obj.map(item => sortObject(item, order));
      }
      const keys = Object.keys(obj);
      if (order === 'asc') keys.sort();
      if (order === 'desc') keys.sort().reverse();
      
      return keys.reduce((acc: any, key) => {
          acc[key] = sortObject(obj[key], order);
          return acc;
      }, {});
  };

  const getProcessedData = () => {
      if (!input.trim()) throw new Error("Input is empty");
      const cleanInput = input.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      let parsed = JSON.parse(cleanInput);
      
      if (sortOrder !== 'none') {
          parsed = sortObject(parsed, sortOrder);
      }
      return parsed;
  };

  const formatJson = () => {
    try {
      const parsed = getProcessedData();
      setInput(JSON.stringify(parsed, null, indentSize));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const minifyJson = () => {
    try {
      const parsed = getProcessedData();
      setInput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const smartFormat = () => {
      try {
        const parsed = getProcessedData();
        const MAX_INLINE_LENGTH = 80;

        const stringifySmart = (node: any, level: number): string => {
            const indentStr = ' '.repeat(indentSize * level);
            const nextIndentStr = ' '.repeat(indentSize * (level + 1));
            
            const compact = JSON.stringify(node);
            if (compact.length <= MAX_INLINE_LENGTH) {
                return compact.replace(/:/g, ': ');
            }

            if (Array.isArray(node)) {
                const items = node.map(item => stringifySmart(item, level + 1));
                return `[\n${items.map(i => nextIndentStr + i).join(',\n')}\n${indentStr}]`;
            } else if (typeof node === 'object' && node !== null) {
                const keys = Object.keys(node);
                const items = keys.map(key => {
                    const valStr = stringifySmart(node[key], level + 1);
                    return `${nextIndentStr}"${key}": ${valStr}`;
                });
                return `{\n${items.join(',\n')}\n${indentStr}}`;
            }
            
            return JSON.stringify(node);
        };

        setInput(stringifySmart(parsed, 0));
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
  };

  const copyToClipboard = () => {
    (navigator as any).clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInput('');
    setError(null);
    setParsedData(null);
  };

  const repairJson = () => {
      let fixed = input.trim();
      fixed = fixed.replace(/\/\/.*$/gm, '');
      fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '');
      fixed = fixed.replace(/,(\s*[\]}])/g, '$1');
      if (!fixed.includes('"') && fixed.includes("'")) {
          fixed = fixed.replace(/'/g, '"');
      }
      fixed = fixed.replace(/:\s*f[a-z]*/gi, ': false');
      fixed = fixed.replace(/:\s*t[a-z]*/gi, ': true');

      const lines = fixed.split('\n');
      const fixedLines = lines.map(line => {
          const quoteMatches = line.match(/(?<!\\)"/g);
          const count = quoteMatches ? quoteMatches.length : 0;
          if (count % 2 !== 0) {
              if (line.trim().endsWith(',')) {
                  const idx = line.lastIndexOf(',');
                  return line.slice(0, idx) + '"' + line.slice(idx);
              }
              return line + '"';
          }
          return line;
      });
      fixed = fixedLines.join('\n');

      const stack: string[] = [];
      const opens = ['{', '['];
      const closes = ['}', ']'];
      
      for (const char of fixed) {
          if (opens.includes(char)) {
              stack.push(char === '{' ? '}' : ']');
          } else if (closes.includes(char)) {
              const last = stack[stack.length - 1];
              if (last === char) {
                  stack.pop();
              }
          }
      }
      
      const closers = stack.reverse().join('');
      fixed += closers;

      setInput(fixed);
      
      try {
          JSON.parse(fixed);
          setError(null);
      } catch(e) {
          setError(t('json.repair_fail'));
      }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
        <div className="flex gap-2 items-center flex-wrap">
            <button
            onClick={formatJson}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
            >
            <FileJson size={16} />
            {t('json.format')}
            </button>
            <button
            onClick={smartFormat}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors text-sm font-medium"
            >
            <Sparkles size={16} />
            {t('json.smart')}
            </button>
            <button
            onClick={minifyJson}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
            >
            <Minimize2 size={16} />
            {t('json.minify')}
            </button>
            <button
            onClick={repairJson}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-md hover:bg-amber-100 transition-colors text-sm font-medium"
            >
            <Wand2 size={16} />
            {t('json.repair')}
            </button>
        </div>

        <div className="w-px h-6 bg-gray-300 hidden lg:block"></div>

        <div className="flex gap-2 items-center flex-wrap">
            {/* Indent Setting */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2 py-1">
                <AlignLeft size={14} className="text-gray-400" />
                <select 
                    value={indentSize} 
                    onChange={(e) => setIndentSize(parseInt((e.target as HTMLSelectElement).value))}
                    className="text-xs font-medium text-gray-600 bg-transparent border-none focus:ring-0 cursor-pointer"
                >
                    <option value={2}>2 {t('json.indent')}</option>
                    <option value={4}>4 {t('json.indent')}</option>
                </select>
            </div>

            {/* Sort Setting */}
            <div className="flex items-center bg-white border border-gray-200 rounded-md p-0.5">
                <button
                    onClick={() => setSortOrder('none')}
                    className={`p-1 rounded ${sortOrder === 'none' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                    title={t('json.sort')}
                >
                    <Settings2 size={14} />
                </button>
                <button
                    onClick={() => setSortOrder('asc')}
                    className={`p-1 rounded ${sortOrder === 'asc' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                    title={t('json.sort_asc')}
                >
                    <ArrowDownAZ size={14} />
                </button>
                <button
                    onClick={() => setSortOrder('desc')}
                    className={`p-1 rounded ${sortOrder === 'desc' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                    title={t('json.sort_desc')}
                >
                    <ArrowUpAZ size={14} />
                </button>
            </div>
        </div>
        
        <div className="flex-1"></div>

        <div className="flex gap-2">
            <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
            >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? t('common.copied') : t('common.copy')}
            </button>
            <button
            onClick={clear}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-red-600 rounded-md hover:bg-red-50 hover:border-red-200 transition-colors text-sm font-medium"
            >
            <Trash2 size={16} />
            {t('common.clear')}
            </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
         {/* Left: Input */}
         <div className="flex-1 flex flex-col min-h-[300px]">
             <label className="text-sm font-medium text-gray-700 mb-2">JSON</label>
             <div className="flex-1 relative">
                 <textarea
                    value={input}
                    onChange={(e) => setInput((e.target as HTMLTextAreaElement).value)}
                    placeholder={t('json.input_ph')}
                    className={`
                        w-full h-full p-4 font-mono text-sm bg-gray-50 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-gray-800
                        ${error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-primary-500'}
                    `}
                    spellCheck={false}
                 />
                 {error && (
                    <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md shadow-sm">
                        <strong>Syntax Error:</strong> {error}
                    </div>
                 )}
             </div>
         </div>

         {/* Middle Arrow (Visual only on large screens) */}
         <div className="hidden lg:flex flex-col justify-center text-gray-300">
             <ArrowRight size={24} />
         </div>

         {/* Right: Tree View */}
         <div className="flex-1 flex flex-col min-h-[300px]">
             <label className="text-sm font-medium text-gray-700 mb-2">{t('json.tree_view')}</label>
             <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 overflow-auto shadow-inner custom-scrollbar relative">
                 {parsedData ? (
                     <div className="min-w-fit">
                        <JsonNode value={parsedData} />
                     </div>
                 ) : (
                     <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                         {error ? (
                             <>
                                <span className="text-red-400 font-medium">{t('json.invalid')}</span>
                                <button 
                                    onClick={repairJson}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium border border-amber-200 shadow-sm"
                                >
                                    <Wand2 size={16} />
                                    {t('json.try_repair')}
                                </button>
                             </>
                         ) : (
                             <span>{t('common.waiting')}</span>
                         )}
                     </div>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};

export default JsonFormatter;
