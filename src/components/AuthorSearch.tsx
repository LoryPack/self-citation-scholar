import { useState } from 'react';
import { Search, Key, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AuthorSearchProps {
  onSearch: (authorIds: string[], apiKey?: string) => void;
  isLoading: boolean;
}

export const AuthorSearch = ({ onSearch, isLoading }: AuthorSearchProps) => {
  const [authorIds, setAuthorIds] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authorIds.trim()) {
      // Split by comma and clean up whitespace
      const ids = authorIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
      
      if (ids.length > 0) {
        onSearch(ids, apiKey.trim() || undefined);
      }
    }
  };

  return (
    <Card className="p-8 bg-academic-light border-academic/20">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Self-Citation Analysis
        </h2>
        <p className="text-muted-foreground">
          Enter a Semantic Scholar author ID to analyze self-citation patterns. You can also enter multiple IDs separated by commas to combine profiles for the same author.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        {/* Author IDs Input */}
        <div className="space-y-2">
          <Label htmlFor="author-ids" className="text-sm font-medium">
            Author IDs
          </Label>
          <div className="relative">
            <Input
              id="author-ids"
              type="text"
              placeholder="Author IDs (e.g., 2262347, 1234567)"
              value={authorIds}
              onChange={(e) => setAuthorIds(e.target.value)}
              className="pr-10"
              disabled={isLoading}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* API Key Collapsible Section */}
        <Collapsible open={isApiKeyOpen} onOpenChange={setIsApiKeyOpen}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between p-2 h-auto text-sm text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Semantic Scholar API Key (Optional)
              </span>
              {isApiKeyOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            <div className="relative">
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Semantic Scholar API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
                disabled={isLoading}
              />
              <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Providing an API key increases rate limits and allows for more comprehensive analysis.
            </p>
          </CollapsibleContent>
        </Collapsible>

        <Button 
          type="submit" 
          disabled={isLoading || !authorIds.trim()}
          className="bg-academic hover:bg-academic/90 w-full"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </form>
      
      <div className="mt-4 text-sm text-muted-foreground text-center">
        <p>
          Find author IDs at{' '}
          <a 
            href="https://www.semanticscholar.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-academic hover:underline"
          >
            semanticscholar.org
          </a>
        </p>
      </div>
    </Card>
  );
};