import React, { useState } from 'react';
import { AnalysisSchema } from '../types';
import { ArrowLeftIcon, LanguageIcon, ScaleIcon } from './Icons';

interface Props {
  data: AnalysisSchema;
  onReset: () => void;
}

const ProgressBar = ({ label, value }: { label: string, value: number }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
      <span>{label}</span>
      <span>{value}/10</span>
    </div>
    <div className="w-full bg-stone-200 rounded-full h-1.5">
      <div 
        className="bg-[#0f172a] h-1.5 rounded-full transition-all duration-1000" 
        style={{ width: `${value * 10}%` }}
      ></div>
    </div>
  </div>
);

const QualityIndicator = ({ score }: { score: number }) => {
  let color = 'bg-amber-500';
  let label = 'Mediana';
  
  if (score >= 8) {
    color = 'bg-emerald-500';
    label = 'Ótima';
  } else if (score < 5) {
    color = 'bg-red-500';
    label = 'Baixa';
  }

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
      <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-lg animate-pulse`}></div>
      <span className="text-white text-xs font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
};

const Section = ({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) => (
  <div className={`mb-10 ${className}`}>
    <h3 className="text-xl font-serif font-bold text-[#0f172a] mb-4 pb-2 border-b border-stone-200 flex items-center gap-3">
      {title}
    </h3>
    <div className="text-stone-700 leading-relaxed font-light text-lg">
      {children}
    </div>
  </div>
);

const MethodologyCard = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm">
    <div className="text-[10px] font-bold uppercase tracking-widest text-[#b45309] mb-2">{label}</div>
    <div className="font-medium text-stone-800 text-sm leading-snug">{value}</div>
  </div>
);

export const AnalysisResult: React.FC<Props> = ({ data, onReset }) => {
  const [viewMode, setViewMode] = useState<'simple' | 'academic'>('simple');
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <div className="max-w-5xl mx-auto w-full animate-fade-in pb-20">
      
      {/* Navigation */}
      <div className="mb-6">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-stone-500 hover:text-[#0f172a] transition-colors font-bold text-sm uppercase tracking-wider"
        >
          <ArrowLeftIcon />
          Voltar para Início
        </button>
      </div>

      <div className="bg-white rounded-none md:rounded-xl shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header - Academic Journal Style */}
        <div className="bg-[#0f172a] text-white p-10 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <span className="bg-[#b45309] text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-sm">
                   Artigo Analisado
                 </span>
                 <span className="text-stone-300 font-mono text-sm border-l border-stone-600 pl-3">
                   {data.publicationDate || "Data N/A"}
                 </span>
               </div>
               <QualityIndicator score={data.score.total} />
            </div>
            
            <div className="flex flex-col items-start gap-4 mb-6">
              <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight text-white tracking-wide max-w-4xl transition-all">
                {showTranslation ? data.freeTranslation : data.title}
              </h1>
              
              <button 
                onClick={() => setShowTranslation(!showTranslation)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold uppercase tracking-wide text-stone-200 transition-all"
              >
                <LanguageIcon />
                {showTranslation ? 'Ver Original (Inglês)' : 'Traduzir Título'}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-stone-300 text-sm font-light italic">
              {data.authors.map((author, idx) => (
                <span key={idx} className="border-b border-stone-600 pb-0.5">
                  {author}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Content - Paper look */}
        <div className="p-8 md:p-14 bg-white">
          
          {/* Executive Summary with Toggle */}
          <div className="mb-12 bg-[#fafaf9] border-l-4 border-[#b45309] p-6 md:p-8 rounded-r-lg shadow-sm relative group">
             <div className="flex items-center justify-between mb-6">
               <h4 className="text-xs font-bold uppercase text-[#b45309] tracking-widest">
                 {viewMode === 'simple' ? 'Resumo Didático' : 'Resumo Técnico'}
               </h4>
               
               {/* Complexity Toggle */}
               <div className="flex bg-white rounded-lg p-1 border border-stone-200 shadow-sm">
                  <button 
                    onClick={() => setViewMode('simple')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'simple' ? 'bg-[#b45309] text-white' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    Explicativo
                  </button>
                  <button 
                    onClick={() => setViewMode('academic')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'academic' ? 'bg-[#0f172a] text-white' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    Técnico
                  </button>
               </div>
             </div>
             
             <p className="text-xl md:text-2xl font-serif text-[#0f172a] leading-relaxed transition-all duration-300">
              "{viewMode === 'simple' ? data.executiveSummarySimple : data.executiveSummaryAcademic}"
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-12">
            
            {/* Left Column (Main Info) */}
            <div className="md:col-span-8">
               
               <Section title="Questão de Pesquisa">
                  <p>{data.researchQuestion}</p>
               </Section>

               <div className="mb-10">
                  <h3 className="text-xl font-serif font-bold text-[#0f172a] mb-6 pb-2 border-b border-stone-200 flex items-center gap-3">
                    Metodologia
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-6 rounded-xl border border-stone-100">
                    <MethodologyCard label="Tipo de Estudo" value={data.methodology.type} />
                    <MethodologyCard label="Amostra" value={data.methodology.sampleSize} />
                    <div className="md:col-span-2 bg-white p-4 rounded-lg border border-stone-200 shadow-sm">
                       <div className="text-[10px] font-bold uppercase tracking-widest text-[#b45309] mb-2">Descrição dos Procedimentos</div>
                       <p className="text-sm text-stone-600 leading-relaxed">{data.methodology.description}</p>
                    </div>
                  </div>
               </div>

               <Section title="Principais Descobertas">
                <ul className="space-y-4">
                  {data.keyFindings.map((finding, idx) => (
                    <li key={idx} className="flex gap-4 items-start group">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full border border-stone-300 text-stone-400 group-hover:border-[#b45309] group-hover:text-[#b45309] group-hover:bg-[#fff7ed] flex items-center justify-center text-sm font-serif font-bold mt-0.5 transition-colors">
                        {idx + 1}
                      </span>
                      <span className="text-stone-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            {/* Right Column (Meta & Details) */}
            <div className="md:col-span-4 space-y-10">
               
               {/* Minimalist Impact Analysis */}
               <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-lg relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0f172a] to-[#b45309]"></div>
                 
                 <div className="flex items-baseline justify-between mb-6">
                    <h3 className="font-serif font-bold text-[#0f172a] text-lg">
                      Impacto
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold font-serif text-[#0f172a]">{data.score.total}</span>
                      <span className="text-xs text-stone-400 font-bold uppercase">/ 10</span>
                    </div>
                 </div>
                 
                 <div className="space-y-4 pt-2 border-t border-stone-100 mt-2">
                   <ProgressBar label="Rigor Metodológico" value={data.score.methodology} />
                   <ProgressBar label="Inovação" value={data.score.novelty} />
                   <ProgressBar label="Clareza" value={data.score.clarity} />
                 </div>

                 <div className="mt-6 pt-4 border-t border-stone-100">
                    <p className="text-xs text-stone-500 italic leading-snug text-center">
                      "{data.score.justification}"
                    </p>
                 </div>
               </div>

               <div className="pt-6 border-t border-stone-200">
                <h4 className="text-xs font-bold uppercase text-stone-400 mb-4 tracking-wider">Palavras-chave</h4>
                <div className="flex flex-wrap gap-2">
                  {data.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white border border-stone-200 text-stone-600 rounded text-xs font-medium hover:border-stone-400 transition-colors cursor-default">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Unified Critical Analysis Section */}
          <div className="mt-16 pt-10 border-t border-stone-200">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-[#b45309] text-white rounded-full">
                  <ScaleIcon />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#0f172a]">
                  Veredito Científico
                </h3>
             </div>

             <div className="grid md:grid-cols-2 gap-8">
                {/* Critique */}
                <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 md:col-span-2">
                   <h4 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4">Crítica Técnica</h4>
                   <p className="text-stone-700 leading-relaxed">
                     {data.critique}
                   </p>
                </div>

                {/* Limitations */}
                <div className="bg-white p-6 rounded-xl border border-stone-200 border-l-4 border-l-red-400">
                   <h4 className="text-sm font-bold uppercase tracking-widest text-red-800 mb-4">Pontos de Atenção (Limitações)</h4>
                   <ul className="space-y-2">
                      {data.limitations.map((lim, idx) => (
                        <li key={idx} className="flex gap-2 text-stone-600 text-sm">
                          <span className="text-red-400">•</span>
                          {lim}
                        </li>
                      ))}
                   </ul>
                </div>

                {/* Implications */}
                <div className="bg-white p-6 rounded-xl border border-stone-200 border-l-4 border-l-emerald-400">
                   <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-800 mb-4">Implicações Práticas</h4>
                   <p className="text-stone-600 text-sm italic leading-relaxed">
                     "{data.implications}"
                   </p>
                </div>
             </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-stone-50 border-t border-stone-200 flex justify-center">
          <button 
            onClick={onReset}
            className="px-8 py-3 bg-white border border-stone-300 text-stone-600 font-bold uppercase tracking-widest text-sm rounded hover:bg-[#0f172a] hover:text-white hover:border-[#0f172a] transition-all shadow-sm"
          >
            Analisar Outro Artigo
          </button>
        </div>
      </div>
    </div>
  );
};