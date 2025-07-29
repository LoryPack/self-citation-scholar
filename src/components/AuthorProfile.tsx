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
  Download,
  AlertTriangle
} from 'lucide-react';
import { Author, Paper, SelfCitationMetrics } from '@/types/semanticScholar';
import { downloadJson } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AuthorProfileProps {
  author: Author;
  papers?: Paper[];
  metrics?: SelfCitationMetrics;
  originalAuthors?: Author[];
}

export const AuthorProfile = ({ author, papers, metrics, originalAuthors }: AuthorProfileProps) => {
  const { toast } = useToast();
  // Use the actual papers count if available, otherwise fall back to API paperCount
  const paperCount = papers ? papers.length : author.paperCount;

  // Parse author IDs and check for name differences
  const authorIds = author.authorId.split(',').map(id => id.trim());
  const hasMultipleIds = authorIds.length > 1;
  
  // Check for name differences using original authors data
  const hasNameDifferences = originalAuthors && originalAuthors.length > 1 && 
    originalAuthors.some(author => author.name !== originalAuthors[0].name);

  const getAuthorUrl = (authorId: string) => {
    return `https://www.semanticscholar.org/author/${authorId}`;
  };

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
            <div className="text-sm text-muted-foreground">
              {hasMultipleIds ? (
                <div>
                  <span>Author IDs: </span>
                  {authorIds.map((id, index) => (
                    <span key={id}>
                      <a
                        href={getAuthorUrl(id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-academic hover:text-academic/80 hover:underline"
                      >
                        {id}
                      </a>
                      {index < authorIds.length - 1 && <span>, </span>}
                    </span>
                  ))}
                </div>
              ) : (
                <span>Author ID: <a
                  href={getAuthorUrl(authorIds[0])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-academic hover:text-academic/80 hover:underline"
                >
                  {authorIds[0]}
                </a></span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
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

      {/* Warning about name differences */}
      {hasNameDifferences && originalAuthors && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <div className="text-sm text-yellow-800">
              <div className="font-medium mb-1">Note: The combined author IDs have different names:</div>
              <div className="space-y-1">
                {originalAuthors.map((originalAuthor, index) => (
                  <div key={originalAuthor.authorId} className="text-xs">
                    • {originalAuthor.name} (ID: {originalAuthor.authorId})
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs">
                This may indicate different authors or name variations. Please verify these are the same person.
              </div>
            </div>
          </div>
        </div>
      )}

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