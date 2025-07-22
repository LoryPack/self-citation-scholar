import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ExternalLink, 
  Quote, 
  Calendar, 
  MapPin,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { Paper } from '@/types/semanticScholar';

interface PapersListProps {
  papers: Paper[];
  authorId: string;
}

export const PapersList = ({ papers, authorId }: PapersListProps) => {
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'year' | 'selfCitations' | 'totalCitations'>('selfCitations');

  const sortedPapers = [...papers].sort((a, b) => {
    switch (sortBy) {
      case 'year':
        return (b.year || 0) - (a.year || 0);
      case 'selfCitations':
        return (b.method1SelfCitationCount || 0) - (a.method1SelfCitationCount || 0);
      case 'totalCitations':
        return b.citationCount - a.citationCount;
      default:
        return 0;
    }
  });

  const togglePaper = (paperId: string) => {
    setExpandedPaper(expandedPaper === paperId ? null : paperId);
  };

  const isMethod1SelfCitation = (paper: Paper, citation: any) => {
    if (!citation || !citation.authors || !Array.isArray(citation.authors)) {
      return false;
    }

    const targetAuthor = paper.authors.find(author => author.authorId === authorId);
    if (!targetAuthor) return false;

    return citation.authors.some((author: any) => 
      author && (
        author.authorId === authorId || 
        (author.name && targetAuthor.name && 
         author.name.toLowerCase().trim() === targetAuthor.name.toLowerCase().trim())
      )
    );
  };

  const isMethod2SelfCitation = (paper: Paper, citation: any) => {
    if (!citation || !citation.authors || !Array.isArray(citation.authors) ||
        !paper.authors || !Array.isArray(paper.authors)) {
      return false;
    }

    return paper.authors.some(paperAuthor => 
      paperAuthor.name && citation.authors.some((citationAuthor: any) => 
        citationAuthor.name && 
        paperAuthor.name.toLowerCase().trim() === citationAuthor.name.toLowerCase().trim()
      )
    );
  };

  const getAuthorUrl = (authorId: string) => {
    return `https://www.semanticscholar.org/author/${authorId}`;
  };

  const getPaperUrl = (paperId: string) => {
    return `https://www.semanticscholar.org/paper/${paperId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground">
          Papers & Self-Citations
        </h3>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'selfCitations' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('selfCitations')}
            className={sortBy === 'selfCitations' ? 'bg-academic hover:bg-academic/90' : ''}
          >
            Self-Citations
          </Button>
          <Button
            variant={sortBy === 'totalCitations' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('totalCitations')}
            className={sortBy === 'totalCitations' ? 'bg-academic hover:bg-academic/90' : ''}
          >
            Total Citations
          </Button>
          <Button
            variant={sortBy === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('year')}
            className={sortBy === 'year' ? 'bg-academic hover:bg-academic/90' : ''}
          >
            Year
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedPapers.map((paper) => (
          <Card key={paper.paperId} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-foreground leading-tight mb-2">
                    {paper.title}
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    {paper.year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {paper.year}
                      </div>
                    )}
                    {paper.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {paper.venue}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-citation-gold/10 text-citation-gold border-citation-gold/20"
                    >
                      Method 1: {paper.method1SelfCitationCount || 0}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className="bg-scholar-blue/10 text-scholar-blue border-scholar-blue/20"
                    >
                      Method 2: {paper.method2SelfCitationCount || 0}
                    </Badge>
                    <Badge variant="outline">
                      {paper.citationCount} Total Citations
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-academic hover:text-academic/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePaper(paper.paperId)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {expandedPaper === paper.paperId ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {expandedPaper === paper.paperId && (
                <div className="pt-4 border-t border-border space-y-3">
                  {paper.abstract && (
                    <div>
                      <h5 className="font-medium text-foreground mb-2">Abstract</h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {paper.abstract}
                      </p>
                    </div>
                  )}
                  
                    <div>
                      <h5 className="font-medium text-foreground mb-2">Authors</h5>
                      <div className="flex flex-wrap gap-2">
                        {paper.authors.map((author, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {author.authorId ? (
                              <a 
                                href={getAuthorUrl(author.authorId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-academic transition-colors"
                              >
                                {author.name}
                              </a>
                            ) : (
                              author.name
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-foreground">Total Citations:</span>
                        <p className="text-muted-foreground">{paper.citationCount}</p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Method 1 Self-Citations:</span>
                        <p className="text-citation-gold font-medium">{paper.method1SelfCitationCount || 0}</p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Method 2 Self-Citations:</span>
                        <p className="text-scholar-blue font-medium">{paper.method2SelfCitationCount || 0}</p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">References:</span>
                        <p className="text-muted-foreground">{paper.referenceCount}</p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Method 1 Rate:</span>
                        <p className="text-muted-foreground">
                          {paper.citationCount > 0 
                            ? `${(((paper.method1SelfCitationCount || 0) / paper.citationCount) * 100).toFixed(1)}%`
                            : '0%'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Method 2 Rate:</span>
                        <p className="text-muted-foreground">
                          {paper.citationCount > 0 
                            ? `${(((paper.method2SelfCitationCount || 0) / paper.citationCount) * 100).toFixed(1)}%`
                            : '0%'
                          }
                        </p>
                      </div>
                    </div>

                  {paper.citations && paper.citations.length > 0 && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="citations">
                        <AccordionTrigger className="text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            View Citing Papers ({paper.citations.length})
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {paper.citations.map((citation: any, index: number) => {
                              const isMethod1SelfCite = isMethod1SelfCitation(paper, citation);
                              const isMethod2SelfCite = isMethod2SelfCitation(paper, citation);
                              
                              return (
                                <div 
                                  key={index} 
                                  className={`p-3 rounded border ${
                                    isMethod1SelfCite || isMethod2SelfCite
                                      ? 'bg-citation-gold/5 border-citation-gold/20' 
                                      : 'bg-muted/20 border-border'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <h6 className="text-sm font-medium text-foreground mb-1 line-clamp-2">
                                        {citation.url ? (
                                          <a
                                            href={citation.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-academic transition-colors"
                                          >
                                            {citation.title || 'Untitled'}
                                          </a>
                                        ) : citation.paperId ? (
                                          <a
                                            href={getPaperUrl(citation.paperId)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-academic transition-colors"
                                          >
                                            {citation.title || 'Untitled'}
                                          </a>
                                        ) : (
                                          citation.title || 'Untitled'
                                        )}
                                      </h6>
                                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                                        {citation.year && (
                                          <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {citation.year}
                                          </span>
                                        )}
                                        {citation.venue && (
                                          <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {citation.venue}
                                          </span>
                                        )}
                                      </div>
                                      {citation.authors && citation.authors.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {citation.authors.slice(0, 3).map((author: any, authorIndex: number) => (
                                            <Badge 
                                              key={authorIndex} 
                                              variant="outline" 
                                              className="text-xs px-1 py-0"
                                            >
                                              {author.authorId ? (
                                                <a 
                                                  href={getAuthorUrl(author.authorId)}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="hover:text-academic transition-colors"
                                                >
                                                  {author.name}
                                                </a>
                                              ) : (
                                                author.name
                                              )}
                                            </Badge>
                                          ))}
                                          {citation.authors.length > 3 && (
                                            <Badge variant="outline" className="text-xs px-1 py-0">
                                              +{citation.authors.length - 3} more
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {isMethod1SelfCite && (
                                        <Badge 
                                          variant="secondary" 
                                          className="bg-citation-gold/10 text-citation-gold border-citation-gold/20 text-xs"
                                        >
                                          Method 1
                                        </Badge>
                                      )}
                                      {isMethod2SelfCite && (
                                        <Badge 
                                          variant="secondary" 
                                          className="bg-scholar-blue/10 text-scholar-blue border-scholar-blue/20 text-xs"
                                        >
                                          Method 2
                                        </Badge>
                                      )}
                                      {citation.url && (
                                        <a
                                          href={citation.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-academic hover:text-academic/80"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};