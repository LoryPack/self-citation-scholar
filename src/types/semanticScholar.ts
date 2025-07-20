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
}

export interface Citation {
  paperId: string;
  title: string;
  year: number;
  authors: Author[];
  venue?: string;
}

export interface SelfCitationMetrics {
  totalPapers: number;
  totalSelfCitations: number;
  selfCitationHIndex: number;
  averageSelfCitationsPerPaper: number;
  papersWithSelfCitations: number;
  selfCitationRate: number;
}