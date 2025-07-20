import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink, 
  Quote, 
  Calendar, 
  MapPin,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Paper } from '@/types/semanticScholar';

interface PapersListProps {
  papers: Paper[];
}

export const PapersList = ({ papers }: PapersListProps) => {
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'year' | 'selfCitations' | 'totalCitations'>('selfCitations');

  const sortedPapers = [...papers].sort((a, b) => {
    switch (sortBy) {
      case 'year':
        return (b.year || 0) - (a.year || 0);
      case 'selfCitations':
        return (b.selfCitationCount || 0) - (a.selfCitationCount || 0);
      case 'totalCitations':
        return b.citationCount - a.citationCount;
      default:
        return 0;
    }
  });

  const togglePaper = (paperId: string) => {
    setExpandedPaper(expandedPaper === paperId ? null : paperId);
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

                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-citation-gold/10 text-citation-gold border-citation-gold/20"
                    >
                      {paper.selfCitationCount || 0} Self-Citations
                    </Badge>
                    <Badge variant="outline">
                      {paper.citationCount} Total Citations
                    </Badge>
                    {paper.fieldsOfStudy && paper.fieldsOfStudy.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {paper.fieldsOfStudy[0]}
                      </Badge>
                    )}
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
                          {author.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-foreground">Citations:</span>
                      <p className="text-muted-foreground">{paper.citationCount}</p>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Self-Citations:</span>
                      <p className="text-citation-gold font-medium">{paper.selfCitationCount || 0}</p>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">References:</span>
                      <p className="text-muted-foreground">{paper.referenceCount}</p>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Self-Citation Rate:</span>
                      <p className="text-muted-foreground">
                        {paper.citationCount > 0 
                          ? `${(((paper.selfCitationCount || 0) / paper.citationCount) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};