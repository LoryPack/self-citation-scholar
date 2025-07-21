import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthorSearch } from '@/components/AuthorSearch';
import { AuthorProfile } from '@/components/AuthorProfile';
import { MetricsOverview } from '@/components/MetricsOverview';
import { PapersList } from '@/components/PapersList';
import { SemanticScholarService } from '@/services/semanticScholarApi';
import { Author, Paper, SelfCitationMetrics } from '@/types/semanticScholar';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const SelfCitationAnalyzer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [author, setAuthor] = useState<Author | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [metrics, setMetrics] = useState<SelfCitationMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentAuthorId, setCurrentAuthorId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (authorId: string) => {
    setIsLoading(true);
    setError(null);
    setAuthor(null);
    setPapers([]);
    setMetrics(null);
    setCurrentAuthorId(authorId);

    try {
      toast({
        title: "Starting Analysis",
        description: "Fetching author data and analyzing self-citations...",
      });

      const result = await SemanticScholarService.analyzeSelfCitations(authorId);
      
      setAuthor(result.author);
      setPapers(result.papers);
      setMetrics(result.metrics);

      toast({
        title: "Analysis Complete",
        description: `Found ${result.metrics.totalSelfCitations} self-citations across ${result.papers.length} papers.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze author';
      setError(errorMessage);
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-academic/10 rounded-lg">
              <GraduationCap className="h-6 w-6 text-academic" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Self-Citation Scholar
              </h1>
              <p className="text-muted-foreground">
                Analyze self-citation patterns in academic research
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Search Section */}
        <AuthorSearch onSearch={handleSearch} isLoading={isLoading} />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {author && metrics && papers.length > 0 && (
          <div className="space-y-8">
            {/* Author Profile */}
            <AuthorProfile author={author} />

            {/* Metrics Overview */}
            <MetricsOverview metrics={metrics} />

            {/* Papers List */}
            {currentAuthorId && <PapersList papers={papers} authorId={currentAuthorId} />}
          </div>
        )}

        {/* Info Section */}
        {!author && !isLoading && (
          <div className="text-center py-12">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-academic/10 rounded-full flex items-center justify-center text-academic font-bold mx-auto">
                    1
                  </div>
                  <p>Enter a Semantic Scholar author ID</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-academic/10 rounded-full flex items-center justify-center text-academic font-bold mx-auto">
                    2
                  </div>
                  <p>We analyze citations for each paper</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-academic/10 rounded-full flex items-center justify-center text-academic font-bold mx-auto">
                    3
                  </div>
                  <p>View self-citation metrics and H-index</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <a 
              href="https://www.semanticscholar.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-academic hover:underline"
            >
              Semantic Scholar API
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};