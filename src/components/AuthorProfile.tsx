import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  ExternalLink, 
  Building, 
  FileText, 
  Quote,
  TrendingUp,
  Download
} from 'lucide-react';
import { Author, Paper, SelfCitationMetrics } from '@/types/semanticScholar';
import { downloadJson } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AuthorProfileProps {
  author: Author;
  papers?: Paper[];
  metrics?: SelfCitationMetrics;
}

export const AuthorProfile = ({ author, papers, metrics }: AuthorProfileProps) => {
  const { toast } = useToast();
  // Use the actual papers count if available, otherwise fall back to API paperCount
  const paperCount = papers ? papers.length : author.paperCount;

  const handleDownloadData = () => {
    const exportData = {
      author: {
        authorId: author.authorId,
        name: author.name,
        url: author.url,
        affiliations: author.affiliations,
        homepage: author.homepage,
        paperCount: paperCount,
        citationCount: author.citationCount,
        hIndex: author.hIndex
      },
      analysis: {
        timestamp: new Date().toISOString(),
        totalPapers: papers?.length || 0,
        metrics: metrics
      },
      papers: papers?.map(paper => ({
        paperId: paper.paperId,
        title: paper.title,
        year: paper.year,
        venue: paper.venue,
        citationCount: paper.citationCount,
        referenceCount: paper.referenceCount,
        fieldsOfStudy: paper.fieldsOfStudy,
        url: paper.url,
        abstract: paper.abstract,
        selfCitationCount: paper.selfCitationCount,
        method1SelfCitationCount: paper.method1SelfCitationCount,
        method2SelfCitationCount: paper.method2SelfCitationCount,
        authors: paper.authors.map(author => ({
          authorId: author.authorId,
          name: author.name
        }))
      })) || []
    };

    const filename = `self-citation-analysis-${author.authorId}-${new Date().toISOString().split('T')[0]}.json`;
    downloadJson(exportData, filename);
    
    toast({
      title: "Data Downloaded",
      description: `Analysis data for ${author.name} has been downloaded as ${filename}`,
    });
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-academic-light to-academic-light/70 border-academic/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-academic/10 rounded-full">
            <User className="h-6 w-6 text-academic" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{author.name}</h2>
            <p className="text-sm text-muted-foreground">Author ID: {author.authorId}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {author.url && (
            <a
              href={author.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-academic hover:text-academic/80 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Profile
            </a>
          )}
          
          {papers && papers.length > 0 && metrics && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Data
            </Button>
          )}
        </div>
      </div>

      {author.affiliations && author.affiliations.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Affiliations</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {author.affiliations.map((affiliation, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {affiliation}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paperCount !== undefined && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Papers</p>
              <p className="font-semibold text-foreground">{paperCount}</p>
            </div>
          </div>
        )}
        
        {author.citationCount !== undefined && (
          <div className="flex items-center gap-2">
            <Quote className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Citations</p>
              <p className="font-semibold text-foreground">{author.citationCount.toLocaleString()}</p>
            </div>
          </div>
        )}
        
        {author.hIndex !== undefined && (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">H-Index</p>
              <p className="font-semibold text-foreground">{author.hIndex}</p>
            </div>
          </div>
        )}
      </div>
      
      {author.homepage && (
        <div className="mt-4 pt-4 border-t border-border">
          <a
            href={author.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-academic hover:text-academic/80 text-sm"
          >
            <ExternalLink className="h-3 w-3" />
            Homepage
          </a>
        </div>
      )}
    </Card>
  );
};