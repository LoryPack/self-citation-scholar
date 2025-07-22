export interface Author {
  authorId: string;
  name: string;
  url?: string;
  affiliations?: string[];
  homepage?: string;
  paperCount?: number;
  citationCount?: number;
  hIndex?: number;
}

export interface Paper {
  paperId: string;
  title: string;
  year: number;
  authors: Author[];
  venue?: string;
  citationCount: number;
  referenceCount: number;
  fieldsOfStudy?: string[];
  url?: string;
  abstract?: string;
  citations?: Citation[];
  selfCitationCount?: number;
  method1SelfCitationCount?: number;
  method2SelfCitationCount?: number;
}

export interface Citation {
  paperId: string;
  title: string;
  year: number;
  authors: Author[];
  venue?: string;
  url?: string;
}

export interface SelfCitationMetrics {
  totalPapers: number;
  // Method 1: Target author appears in citing paper
  method1SelfCitations: number;
  method1SelfCitationHIndex: number;
  method1AverageSelfCitationsPerPaper: number;
  method1PapersWithSelfCitations: number;
  method1SelfCitationRate: number;
  method1HIndexWithoutSelfCitations: number;
  // Method 2: Author overlap between cited and citing papers
  method2SelfCitations: number;
  method2SelfCitationHIndex: number;
  method2AverageSelfCitationsPerPaper: number;
  method2PapersWithSelfCitations: number;
  method2SelfCitationRate: number;
  method2HIndexWithoutSelfCitations: number;
  // Legacy fields for backward compatibility
  totalSelfCitations: number;
  selfCitationHIndex: number;
  averageSelfCitationsPerPaper: number;
  papersWithSelfCitations: number;
  selfCitationRate: number;
}