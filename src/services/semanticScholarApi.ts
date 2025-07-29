import { Author, Paper, Citation, SelfCitationMetrics } from '@/types/semanticScholar';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

// Utility: fetch with exponential backoff for 429 errors, with detailed logging
async function fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 5, initialDelay = 500): Promise<Response> {
  let attempt = 0;
  let delay = initialDelay;
  while (true) {
    console.log(`[fetchWithRetry] Attempt ${attempt + 1} for URL: ${url}`);
    const response = await fetch(url, options);
    console.log(`[fetchWithRetry] Response status: ${response.status} for URL: ${url}`);
    if (response.status !== 429 || attempt >= maxRetries) {
      if (response.status === 429) {
        console.warn(`[fetchWithRetry] Max retries reached for URL: ${url}`);
      }
      return response;
    }
    console.warn(`[fetchWithRetry] 429 received. Retrying after ${delay}ms (attempt ${attempt + 1}) for URL: ${url}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    delay *= 2;
    attempt++;
  }
}

export class SemanticScholarService {
  static async getAuthor(authorId: string): Promise<Author> {
    const url = `${BASE_URL}/author/${authorId}?fields=name,url,affiliations,homepage,paperCount,citationCount,hIndex`;
    console.log(`[getAuthor] Fetching author: ${authorId}`);
    const response = await fetchWithRetry(url);
    console.log(`[getAuthor] Response status: ${response.status}`);
    if (!response.ok) {
      console.error(`[getAuthor] Error fetching author: ${authorId}, status: ${response.status}`);
      throw new Error('Author not found');
    }
    return response.json();
  }

  static async getMultipleAuthors(authorIds: string[]): Promise<Author[]> {
    console.log(`[getMultipleAuthors] Fetching ${authorIds.length} authors`);
    const authors: Author[] = [];
    for (let i = 0; i < authorIds.length; i++) {
      const authorId = authorIds[i];
      try {
        const author = await this.getAuthor(authorId);
        authors.push(author);
      } catch (error) {
        console.error(`[getMultipleAuthors] Failed to fetch author ${authorId}:`, error);
        throw new Error(`Failed to fetch author ${authorId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      // Wait 1 second between requests to avoid API rate issues, except after the last one
      if (i < authorIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return authors;
  }

  static async getAuthorPapers(authorId: string): Promise<Paper[]> {
    const limit = 100;
    let offset = 0;
    let allPapers: Paper[] = [];
    console.log(`[getAuthorPapers] Fetching papers for author: ${authorId}`);
    while (true) {
      const url = `${BASE_URL}/author/${authorId}/papers?fields=paperId,title,year,authors,venue,citationCount,referenceCount,fieldsOfStudy,url,abstract&limit=${limit}&offset=${offset}`;
      const response = await fetchWithRetry(url);
      console.log(`[getAuthorPapers] Response status: ${response.status} (offset: ${offset})`);
      if (!response.ok) {
        console.error(`[getAuthorPapers] Error fetching papers for author: ${authorId}, status: ${response.status}`);
        throw new Error('Failed to fetch papers');
      }
      const data = await response.json();
      const papers = data.data || [];
      allPapers = allPapers.concat(papers);
      console.log(`[getAuthorPapers] Papers fetched this page: ${papers.length}, total so far: ${allPapers.length}`);
      if (papers.length < limit) break; // no more pages
      offset += limit;
    }
    return allPapers;
  }

  static async getMultipleAuthorsPapers(authorIds: string[]): Promise<Paper[]> {
    console.log(`[getMultipleAuthorsPapers] Fetching papers for ${authorIds.length} authors`);
    const allPapers: Paper[] = [];
    const paperIds = new Set<string>(); // To avoid duplicates

    for (const authorId of authorIds) {
      try {
        const papers = await this.getAuthorPapers(authorId);
        // Filter out duplicates based on paperId
        const uniquePapers = papers.filter(paper => {
          if (paperIds.has(paper.paperId)) {
            return false;
          }
          paperIds.add(paper.paperId);
          return true;
        });
        allPapers.push(...uniquePapers);
        console.log(`[getMultipleAuthorsPapers] Added ${uniquePapers.length} unique papers from author ${authorId}`);
      } catch (error) {
        console.error(`[getMultipleAuthorsPapers] Failed to fetch papers for author ${authorId}:`, error);
        throw new Error(`Failed to fetch papers for author ${authorId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`[getMultipleAuthorsPapers] Total unique papers: ${allPapers.length}`);
    return allPapers;
  }

  static async getPaperCitations(paperId: string): Promise<Citation[]> {
    const url = `${BASE_URL}/paper/${paperId}/citations?fields=paperId,title,year,authors,venue,url&limit=1000`;
    console.log(`[getPaperCitations] Fetching citations for paper: ${paperId}`);
    const response = await fetchWithRetry(url);
    console.log(`[getPaperCitations] Response status: ${response.status} for paper: ${paperId}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[getPaperCitations] Paper not found: ${paperId}`);
        return [];
      }
      console.error(`[getPaperCitations] Error fetching citations for paper: ${paperId}, status: ${response.status}`);
      return [];
    }
    const data = await response.json();
    const citations = data.data?.map((item: any) => item.citingPaper) || [];
    console.log(`[getPaperCitations] Citations fetched for paper ${paperId}: ${citations.length}`);
    // Filter out null/undefined citations and those without proper structure
    const validCitations = citations.filter((citation: any) => 
      citation && 
      citation.paperId && 
      citation.authors && 
      Array.isArray(citation.authors)
    );
    console.log(`[getPaperCitations] Valid citations after filtering for paper ${paperId}: ${validCitations.length}`);
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

  // Helper: batch process async functions with concurrency limit, with logging and delay
  static async batchProcess<T, R>(items: T[], fn: (item: T, idx: number) => Promise<R>, batchSize = 1, delayMs = 1000): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      console.log(`[batchProcess] Processing batch ${i / batchSize + 1}: items ${i} to ${i + batch.length - 1}`);
      const batchResults = await Promise.all(batch.map(async (item, idxInBatch) => {
        const idxGlobal = i + idxInBatch;
        console.log(`[batchProcess] Processing item in batch: index ${idxGlobal}`);
        return fn(item, idxGlobal);
      }));
      results.push(...batchResults);
      console.log(`[batchProcess] Finished batch ${i / batchSize + 1}`);
      if (i + batchSize < items.length) {
        console.log(`[batchProcess] Waiting ${delayMs}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    return results;
  }

  static async analyzeSelfCitations(authorIds: string | string[], progressCallback?: (current: number, total: number) => void): Promise<{
    author: Author;
    papers: Paper[];
    metrics: SelfCitationMetrics;
    originalAuthors?: Author[];
  }> {
    // Handle both single author ID (string) and multiple author IDs (array)
    const authorIdArray = Array.isArray(authorIds) ? authorIds : [authorIds];
    console.log(`[analyzeSelfCitations] Starting analysis for ${authorIdArray.length} author(s): ${authorIdArray.join(', ')}`);

    // Get all authors
    const authors = await this.getMultipleAuthors(authorIdArray);
    console.log(`[analyzeSelfCitations] Authors fetched: ${authors.map(a => a.name).join(', ')}`);

    // Create a combined author object
    const combinedAuthor = this.combineAuthors(authors);
    console.log(`[analyzeSelfCitations] Combined author: ${combinedAuthor.name}`);

    // Get all papers from all authors
    const papers = await this.getMultipleAuthorsPapers(authorIdArray);
    console.log(`[analyzeSelfCitations] Papers fetched: ${papers.length}`);

    let processed = 0;
    // Batch process citation requests (e.g., 1 at a time)
    const analyzedPapers = await this.batchProcess(
      papers,
      async (paper, idx) => {
        console.log(`[analyzeSelfCitations] Analyzing paper: ${paper.title} (${paper.paperId})`);
        const citations = await this.getPaperCitations(paper.paperId);
        
        // For multiple authors, we need to check self-citations against all author IDs
        const method1SelfCitations = citations.filter(citation => 
          authorIdArray.some(authorId => this.isMethod1SelfCitation(paper, citation, authorId))
        );
        
        const method2SelfCitations = citations.filter(citation => 
          this.isMethod2SelfCitation(paper, citation)
        );
        
        processed++;
        if (progressCallback) progressCallback(processed, papers.length);
        console.log(`[analyzeSelfCitations] Paper: ${paper.title} | Total citations: ${citations.length} | Method1 self-citations: ${method1SelfCitations.length} | Method2 self-citations: ${method2SelfCitations.length}`);
        return {
          ...paper,
          citations,
          selfCitationCount: method1SelfCitations.length, // Default to method 1 for compatibility
          method1SelfCitationCount: method1SelfCitations.length,
          method2SelfCitationCount: method2SelfCitations.length
        };
      },
      1, // batch size
      1000 // delay ms
    );
    
    // Calculate metrics
    const metrics = this.calculateMetrics(analyzedPapers);
    
    // Calculate H-index from the combined papers
    // This ensures the H-index is computed correctly when multiple author IDs are provided
    const calculatedHIndex = this.calculateHIndex(analyzedPapers);
    combinedAuthor.hIndex = calculatedHIndex;
    
    console.log(`[analyzeSelfCitations] Final metrics:`, metrics);
    console.log(`[analyzeSelfCitations] Calculated H-index from combined papers:`, calculatedHIndex);
    
    return {
      author: combinedAuthor,
      papers: analyzedPapers,
      metrics,
      originalAuthors: authors.length > 1 ? authors : undefined
    };
  }

  static combineAuthors(authors: Author[]): Author {
    if (authors.length === 0) {
      throw new Error('No authors provided');
    }
    
    if (authors.length === 1) {
      return authors[0];
    }

    // Combine multiple authors into a single author object
    const combinedAuthor: Author = {
      authorId: authors.map(a => a.authorId).join(','), // Combine IDs
      name: authors[0].name, // Use the first author's name as primary
      url: authors[0].url,
      affiliations: [...new Set(authors.flatMap(a => a.affiliations || []))], // Merge unique affiliations
      homepage: authors[0].homepage,
      paperCount: authors.reduce((sum, a) => sum + (a.paperCount || 0), 0),
      citationCount: authors.reduce((sum, a) => sum + (a.citationCount || 0), 0),
      // Note: hIndex will be calculated later based on the combined papers
      hIndex: 0
    };

    return combinedAuthor;
  }

  static calculateHIndex(papers: Paper[]): number {
    // Sort papers by citation count in descending order
    const sortedCitations = papers
      .map(paper => paper.citationCount)
      .sort((a, b) => b - a);
    
    // Calculate H-index: the largest number h such that h papers have at least h citations each
    let hIndex = 0;
    for (let i = 0; i < sortedCitations.length; i++) {
      if (sortedCitations[i] >= i + 1) {
        hIndex = i + 1;
      } else {
        break;
      }
    }
    
    return hIndex;
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

    // Calculate h-index without self-citations for both methods
    const method1CitationsWithoutSelfCitations = papers.map(paper => 
      Math.max(0, paper.citationCount - (paper.method1SelfCitationCount || 0))
    ).sort((a, b) => b - a);
    
    let method1HIndexWithoutSelfCitations = 0;
    for (let i = 0; i < method1CitationsWithoutSelfCitations.length; i++) {
      if (method1CitationsWithoutSelfCitations[i] >= i + 1) {
        method1HIndexWithoutSelfCitations = i + 1;
      } else {
        break;
      }
    }

    const method2CitationsWithoutSelfCitations = papers.map(paper => 
      Math.max(0, paper.citationCount - (paper.method2SelfCitationCount || 0))
    ).sort((a, b) => b - a);
    
    let method2HIndexWithoutSelfCitations = 0;
    for (let i = 0; i < method2CitationsWithoutSelfCitations.length; i++) {
      if (method2CitationsWithoutSelfCitations[i] >= i + 1) {
        method2HIndexWithoutSelfCitations = i + 1;
      } else {
        break;
      }
    }

    return {
      totalPapers,
      // Method 1 metrics
      method1SelfCitations,
      method1SelfCitationHIndex,
      method1AverageSelfCitationsPerPaper,
      method1PapersWithSelfCitations,
      method1SelfCitationRate,
      method1HIndexWithoutSelfCitations,
      // Method 2 metrics
      method2SelfCitations,
      method2SelfCitationHIndex,
      method2AverageSelfCitationsPerPaper,
      method2PapersWithSelfCitations,
      method2SelfCitationRate,
      method2HIndexWithoutSelfCitations,
      // Legacy fields (using Method 1 for backward compatibility)
      totalSelfCitations: method1SelfCitations,
      selfCitationHIndex: method1SelfCitationHIndex,
      averageSelfCitationsPerPaper: method1AverageSelfCitationsPerPaper,
      papersWithSelfCitations: method1PapersWithSelfCitations,
      selfCitationRate: method1SelfCitationRate
    };
  }
}