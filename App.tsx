import React, { useState, useRef, useEffect } from 'react';
import { PaperClipIcon, FileIcon, BeakerIcon, TrashIcon, HistoryIcon, XMarkIcon } from './components/Icons';
import { analyzeArticle } from './services/gemini';
import { AnalysisResult } from './components/AnalysisResult';
import { AnalysisSchema, LoadingStatus } from './types';

interface HistoryItem {
  id: string;
  date: string;
  schema: AnalysisSchema;
}

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  
  const [status, setStatus] = useState<LoadingStatus>('idle');
  const [result, setResult] = useState<AnalysisSchema | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('sciscan_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = (analysis: AnalysisSchema) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR'),
      schema: analysis
    };
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('sciscan_history', JSON.stringify(updatedHistory));
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('sciscan_history', JSON.stringify(updated));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setErrorMsg('Apenas arquivos PDF são permitidos.');
        return;
      }
      setAttachedFile(file);
      setErrorMsg(null);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !attachedFile) {
      setErrorMsg("Insira um link/texto ou anexe um PDF.");
      return;
    }

    setStatus('reading');
    setErrorMsg(null);

    try {
      await new Promise(r => setTimeout(r, 800));
      setStatus('analyzing');

      // We no longer need to pass complexity preference, the API returns both.
      const analysisData = await analyzeArticle(inputText, attachedFile);

      setResult(analysisData);
      setStatus('complete');
      saveToHistory(analysisData);
      
      // Clear inputs after success
      setInputText('');
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg("Erro ao analisar. Verifique o link ou o arquivo e tente novamente.");
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setResult(item.schema);
    setStatus('complete');
  };

  const resetView = () => {
    setResult(null);
    setStatus('idle');
    setErrorMsg(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-500';
    if (score < 5) return 'bg-red-500';
    return 'bg-amber-500';
  };

  // ----------------------------------------------------------------------
  // VIEW: LOADING
  // ----------------------------------------------------------------------
  if (status === 'reading' || status === 'analyzing') {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-xl shadow-2xl max-w-md w-full text-center border border-stone-200">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-[3px] border-stone-100"></div>
            <div className="absolute inset-0 rounded-full border-[3px] border-[#0f172a] border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-[#0f172a]">
               <BeakerIcon />
            </div>
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#0f172a] mb-3">
            {status === 'reading' ? 'Lendo Dados...' : 'Analisando Impacto...'}
          </h2>
          <p className="text-stone-500 font-light leading-relaxed">
            Nossa IA está traduzindo, simplificando e avaliando rigor metodológico.
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: RESULT
  // ----------------------------------------------------------------------
  if (status === 'complete' && result) {
    return (
      <div className="min-h-screen bg-[#fafaf9] py-8 px-4 md:px-8">
        <AnalysisResult data={result} onReset={resetView} />
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: MAIN INPUT (CHAT STYLE)
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center pt-20 pb-12 px-4 selection:bg-[#0f172a] selection:text-white">
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-[#0f172a] text-white rounded-full mb-6 shadow-xl shadow-stone-200">
           <BeakerIcon /> 
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#0f172a] mb-4 tracking-tight">
          SciScan <span className="italic font-serif text-[#b45309]">AI</span>
        </h1>
        <p className="text-stone-500 max-w-lg mx-auto font-light leading-relaxed">
          Cole um link, resumo ou anexe um PDF. <br/>
          Nós dissecamos a ciência para você.
        </p>
      </div>

      {/* Input Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden relative transition-all focus-within:ring-2 focus-within:ring-[#0f172a]/20">
        
        <textarea
          className="w-full h-32 px-6 py-6 bg-transparent border-none focus:ring-0 text-lg text-stone-700 placeholder-stone-400 resize-none leading-relaxed"
          placeholder="O que vamos analisar hoje? Cole um link DOI, PubMed ou texto..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          autoFocus
        ></textarea>

        {/* Attached File Pill */}
        {attachedFile && (
          <div className="px-6 pb-2">
            <div className="inline-flex items-center gap-2 bg-stone-100 text-[#0f172a] px-3 py-1.5 rounded-md border border-stone-200 text-sm font-medium animate-fade-in">
              <FileIcon />
              <span className="truncate max-w-[200px]">{attachedFile.name}</span>
              <button 
                onClick={() => setAttachedFile(null)}
                className="hover:text-red-500 ml-1 p-0.5 rounded-full hover:bg-stone-200 transition-colors"
              >
                <XMarkIcon />
              </button>
            </div>
          </div>
        )}

        {/* Actions Bar Bottom */}
        <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-stone-400 hover:text-[#0f172a] hover:bg-stone-200 rounded-full transition-all tooltip-trigger relative group"
                title="Anexar PDF"
             >
                <PaperClipIcon />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-stone-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Anexar PDF
                </span>
             </button>
             <input 
                type="file" 
                accept=".pdf" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
             />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!inputText.trim() && !attachedFile}
            className={`px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all shadow-md
              ${(!inputText.trim() && !attachedFile)
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                : 'bg-[#0f172a] text-white hover:bg-[#1e293b] active:scale-95'
              }`}
          >
            Analisar
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100 animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="w-full max-w-2xl mt-12 animate-fade-in">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 px-2">
            <HistoryIcon />
            Histórico de Análises
          </h3>
          <div className="grid gap-3 w-full">
            {history.map((item) => (
              <div 
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="group w-full bg-white p-4 rounded-lg border border-stone-100 shadow-sm hover:shadow-md hover:border-[#b45309]/30 cursor-pointer transition-all flex items-center justify-between overflow-hidden"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="font-serif font-bold text-[#0f172a] truncate w-full group-hover:text-[#b45309] transition-colors block">
                    {item.schema.title || "Análise sem título"}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-stone-400 font-mono flex-shrink-0">{item.date}</span>
                    
                    {/* Quality Dot in History */}
                    <div className="flex items-center gap-1.5 bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                        <div className={`w-2 h-2 rounded-full ${getScoreColor(item.schema.score.total)}`}></div>
                        <span className="text-[10px] font-bold text-stone-500">Nota {item.schema.score.total}</span>
                    </div>

                  </div>
                </div>
                <button 
                  onClick={(e) => deleteHistoryItem(item.id, e)}
                  className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  title="Excluir do histórico"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-10 text-stone-300 text-xs">
         © 2024 SciScan AI
      </div>

    </div>
  );
}

export default App;