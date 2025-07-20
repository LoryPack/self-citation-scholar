import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface AuthorSearchProps {
  onSearch: (authorId: string) => void;
  isLoading: boolean;
}

export const AuthorSearch = ({ onSearch, isLoading }: AuthorSearchProps) => {
  const [authorId, setAuthorId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authorId.trim()) {
      onSearch(authorId.trim());
    }
  };

  return (
    <Card className="p-8 bg-academic-light border-academic/20">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Self-Citation Analysis
        </h2>
        <p className="text-muted-foreground">
          Enter a Semantic Scholar author ID to analyze self-citation patterns
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Author ID (e.g., 2262347)"
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="pr-10"
            disabled={isLoading}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !authorId.trim()}
          className="bg-academic hover:bg-academic/90"
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