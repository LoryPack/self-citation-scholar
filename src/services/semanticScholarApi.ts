import { Author, Paper, Citation, SelfCitationMetrics } from '@/types/semanticScholar';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export class SemanticScholarService {
  static async getAuthor(authorId: string): Promise<Author> {
    const response = await fetch(
      `${BASE_URL}/author/${authorId}?fields=name,url,affiliations,homepage,paperCount,citationCount,hIndex`
    );
    
    if (!response.ok) {
      throw new Error('Author not found');
    }
    
    return response.json();
  }

  static async getAuthorPapers(authorId: string): Promise<Paper[]> {
    const response = await fetch(
      `${BASE_URL}/author/${authorId}/papers?fields=paperId,title,year,authors,venue,citationCount,referenceCount,fieldsOfStudy,url,abstract&limit=100`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch papers');
    }
    
    const data = await response.json();
    return data.data || [];
  }

  static async getPaperCitations(paperId: string): Promise<Citation[]> {
    console.log('Fetching citations for paper ID:', paperId);
    
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await fetch(
      `${BASE_URL}/paper/${paperId}/citations?fields=paperId,title,year,authors,venue&limit=1000`
    );
    
    console.log('Citation API response status:', response.status, response.statusText);
    
    if (!response.ok) {
      if (response.status === 429) {
        console.log('Rate limited, waiting and retrying...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.getPaperCitations(paperId); // Retry once
      }
      console.log('Citation API error for paper', paperId, ':', response.status);
      return [];
    }
    
    const data = await response.json();
    console.log('Raw citation data for paper', paperId, ':', data);
    
    const citations = data.data?.map((item: any) => item.citingPaper) || [];
    console.log('Processed citations:', citations.length, citations);
    
    // Filter out null/undefined citations and those without proper structure
    const validCitations = citations.filter((citation: any) => 
      citation && 
      citation.paperId && 
      citation.authors && 
      Array.isArray(citation.authors)
    );
    
    console.log('Valid citations after filtering:', validCitations.length, validCitations);
    return validCitations;
  }

  // Method 1: Check if target author appears in citing paper
  static isMethod1SelfCitation(paper: Paper, citation: Citation, targetAuthorId: string): boolean {
    if (!citation || !citation.authors || !Array.isArray(citation.authors)) {
      return false;
    }

    const targetAuthor = paper.authors.find(author => author.authorId === targetAuthorId);
    if (!targetAuthor) return false;

    // Check if the target author appears in the citing paper (by ID or name match)
    return citation.authors.some(author => 
      author && (
        author.authorId === targetAuthorId || 
        (author.name && targetAuthor.name && 
         author.name.toLowerCase().trim() === targetAuthor.name.toLowerCase().trim())
      )
    );
  }

  // Method 2: Check if there's author overlap between cited and citing papers
  static isMethod2SelfCitation(paper: Paper, citation: Citation): boolean {
    if (!citation || !citation.authors || !Array.isArray(citation.authors) ||
        !paper.authors || !Array.isArray(paper.authors)) {
      return false;
    }

    // Check for author overlap using name matching
    return paper.authors.some(paperAuthor => 
      paperAuthor.name && citation.authors.some(citationAuthor => 
        citationAuthor.name && 
        paperAuthor.name.toLowerCase().trim() === citationAuthor.name.toLowerCase().trim()
      )
    );
  }

  // Legacy method for backward compatibility
  static isSelfCitation(paper: Paper, citation: Citation, targetAuthorId: string): boolean {
    return this.isMethod1SelfCitation(paper, citation, targetAuthorId);
  }

  static async analyzeSelfCitations(authorId: string): Promise<{
    author: Author;
    papers: Paper[];
    metrics: SelfCitationMetrics;
  }> {
    console.log('Starting analysis for author:', authorId);
    const author = await this.getAuthor(authorId);
    console.log('Author fetched:', author);
    
    const papers = await this.getAuthorPapers(authorId);
    console.log('Papers fetched:', papers.length, papers);
    
    // Analyze self-citations for each paper
    const analyzedPapers = await Promise.all(
      papers.map(async (paper) => {
        console.log('Analyzing paper:', paper.title);
        const citations = await this.getPaperCitations(paper.paperId);
        console.log('Citations for paper:', citations.length, citations);
        
        // Method 1: Target author in citing paper
        const method1SelfCitations = citations.filter(citation => 
          this.isMethod1SelfCitation(paper, citation, authorId)
        );
        
        // Method 2: Author overlap between papers
        const method2SelfCitations = citations.filter(citation => 
          this.isMethod2SelfCitation(paper, citation)
        );
        
        console.log('Method 1 self-citations found:', method1SelfCitations.length);
        console.log('Method 2 self-citations found:', method2SelfCitations.length);
        
        return {
          ...paper,
          citations,
          selfCitationCount: method1SelfCitations.length, // Default to method 1 for compatibility
          method1SelfCitationCount: method1SelfCitations.length,
          method2SelfCitationCount: method2SelfCitations.length
        };
      })
    );

    // Calculate metrics
    const metrics = this.calculateMetrics(analyzedPapers);
    console.log('Final metrics:', metrics);

    return {
      author,
      papers: analyzedPapers,
      metrics
    };
  }

  static calculateMetrics(papers: Paper[]): SelfCitationMetrics {
    const totalPapers = papers.length;
    const totalCitations = papers.reduce((sum, paper) => sum + paper.citationCount, 0);
    
    // Method 1 calculations
    const method1SelfCitations = papers.reduce((sum, paper) => sum + (paper.method1SelfCitationCount || 0), 0);
    const method1PapersWithSelfCitations = papers.filter(paper => (paper.method1SelfCitationCount || 0) > 0).length;
    
    const method1SortedSelfCitations = papers
      .map(paper => paper.method1SelfCitationCount || 0)
      .sort((a, b) => b - a);
    
    let method1SelfCitationHIndex = 0;
    for (let i = 0; i < method1SortedSelfCitations.length; i++) {
      if (method1SortedSelfCitations[i] >= i + 1) {
        method1SelfCitationHIndex = i + 1;
      } else {
        break;
      }
    }

    const method1AverageSelfCitationsPerPaper = totalPapers > 0 ? method1SelfCitations / totalPapers : 0;
    const method1SelfCitationRate = totalCitations > 0 ? (method1SelfCitations / totalCitations) * 100 : 0;
    
    // Method 2 calculations
    const method2SelfCitations = papers.reduce((sum, paper) => sum + (paper.method2SelfCitationCount || 0), 0);
    const method2PapersWithSelfCitations = papers.filter(paper => (paper.method2SelfCitationCount || 0) > 0).length;
    
    const method2SortedSelfCitations = papers
      .map(paper => paper.method2SelfCitationCount || 0)
      .sort((a, b) => b - a);
    
    let method2SelfCitationHIndex = 0;
    for (let i = 0; i < method2SortedSelfCitations.length; i++) {
      if (method2SortedSelfCitations[i] >= i + 1) {
        method2SelfCitationHIndex = i + 1;
      } else {
        break;
      }
    }

    const method2AverageSelfCitationsPerPaper = totalPapers > 0 ? method2SelfCitations / totalPapers : 0;
    const method2SelfCitationRate = totalCitations > 0 ? (method2SelfCitations / totalCitations) * 100 : 0;

    return {
      totalPapers,
      // Method 1 metrics
      method1SelfCitations,
      method1SelfCitationHIndex,
      method1AverageSelfCitationsPerPaper,
      method1PapersWithSelfCitations,
      method1SelfCitationRate,
      // Method 2 metrics
      method2SelfCitations,
      method2SelfCitationHIndex,
      method2AverageSelfCitationsPerPaper,
      method2PapersWithSelfCitations,
      method2SelfCitationRate,
      // Legacy fields (using Method 1 for backward compatibility)
      totalSelfCitations: method1SelfCitations,
      selfCitationHIndex: method1SelfCitationHIndex,
      averageSelfCitationsPerPaper: method1AverageSelfCitationsPerPaper,
      papersWithSelfCitations: method1PapersWithSelfCitations,
      selfCitationRate: method1SelfCitationRate
    };
  }
}