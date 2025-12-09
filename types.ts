export interface AnalysisSchema {
  title: string;
  authors: string[];
  publicationDate: string;
  executiveSummarySimple: string;   // Explanatory summary
  executiveSummaryAcademic: string; // Technical summary
  freeTranslation: string;          // Portuguese translation
  researchQuestion: string;
  methodology: {
    type: string;
    description: string;
    sampleSize: string;
  };
  keyFindings: string[];
  limitations: string[];
  implications: string;
  critique: string;
  score: {
    total: number;
    methodology: number;
    novelty: number;
    clarity: number;
    justification: string;
  };
  keywords: string[];
}

export enum AnalysisType {
  PDF = 'PDF',
  TEXT = 'TEXT'
}

export interface UploadState {
  file: File | null;
  text: string;
  type: AnalysisType;
}

export type LoadingStatus = 'idle' | 'reading' | 'analyzing' | 'complete' | 'error';