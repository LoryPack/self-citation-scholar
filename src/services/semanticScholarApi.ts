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
    const response = await fetch(
      `${BASE_URL}/paper/${paperId}/citations?fields=paperId,title,year,authors,venue&limit=1000`
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const citations = data.data?.map((item: any) => item.citedPaper) || [];
    
    // Filter out null/undefined citations and those without proper structure
    return citations.filter((citation: any) => 
      citation && 
      citation.paperId && 
      citation.authors && 
      Array.isArray(citation.authors)
    );
  }

  static isSelfCitation(paper: Paper, citation: Citation, targetAuthorId: string): boolean {
    // Check if citation exists and has authors
    if (!citation || !citation.authors || !Array.isArray(citation.authors)) {
      return false;
    }

    // Check if the citation is by the same author
    const targetAuthor = paper.authors.find(author => author.authorId === targetAuthorId);
    if (!targetAuthor) return false;

    // Check if any author of the citation matches the target author
    return citation.authors.some(author => 
      author && (
        author.authorId === targetAuthorId || 
        (author.name && targetAuthor.name && 
         author.name.toLowerCase() === targetAuthor.name.toLowerCase())
      )
    );
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
        
        const selfCitations = citations.filter(citation => 
          this.isSelfCitation(paper, citation, authorId)
        );
        
        console.log('Self-citations found:', selfCitations.length, selfCitations);
        
        return {
          ...paper,
          citations,
          selfCitationCount: selfCitations.length
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
    const totalSelfCitations = papers.reduce((sum, paper) => sum + (paper.selfCitationCount || 0), 0);
    const papersWithSelfCitations = papers.filter(paper => (paper.selfCitationCount || 0) > 0).length;
    
    // Calculate self-citation h-index
    const sortedSelfCitations = papers
      .map(paper => paper.selfCitationCount || 0)
      .sort((a, b) => b - a);
    
    let selfCitationHIndex = 0;
    for (let i = 0; i < sortedSelfCitations.length; i++) {
      if (sortedSelfCitations[i] >= i + 1) {
        selfCitationHIndex = i + 1;
      } else {
        break;
      }
    }

    const averageSelfCitationsPerPaper = totalPapers > 0 ? totalSelfCitations / totalPapers : 0;
    const totalCitations = papers.reduce((sum, paper) => sum + paper.citationCount, 0);
    const selfCitationRate = totalCitations > 0 ? (totalSelfCitations / totalCitations) * 100 : 0;

    return {
      totalPapers,
      totalSelfCitations,
      selfCitationHIndex,
      averageSelfCitationsPerPaper,
      papersWithSelfCitations,
      selfCitationRate
    };
  }
}