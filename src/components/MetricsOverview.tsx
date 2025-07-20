import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Quote, 
  TrendingUp, 
  BarChart3,
  Target,
  Percent
} from 'lucide-react';
import { SelfCitationMetrics } from '@/types/semanticScholar';

interface MetricsOverviewProps {
  metrics: SelfCitationMetrics;
}

export const MetricsOverview = ({ metrics }: MetricsOverviewProps) => {
  const metricCards = [
    {
      title: 'Total Papers',
      value: metrics.totalPapers,
      icon: FileText,
      color: 'bg-academic-light text-academic',
      description: 'Papers analyzed'
    },
    {
      title: 'Self-Citations',
      value: metrics.totalSelfCitations,
      icon: Quote,
      color: 'bg-citation-gold/10 text-citation-gold',
      description: 'Total self-citations found'
    },
    {
      title: 'Self-Citation H-Index',
      value: metrics.selfCitationHIndex,
      icon: TrendingUp,
      color: 'bg-metrics-green/10 text-metrics-green',
      description: 'H-index based on self-citations'
    },
    {
      title: 'Average Self-Citations',
      value: metrics.averageSelfCitationsPerPaper.toFixed(1),
      icon: BarChart3,
      color: 'bg-scholar-blue/10 text-scholar-blue',
      description: 'Per paper average'
    },
    {
      title: 'Papers with Self-Citations',
      value: metrics.papersWithSelfCitations,
      icon: Target,
      color: 'bg-purple-100 text-purple-600',
      description: 'Papers containing self-citations'
    },
    {
      title: 'Self-Citation Rate',
      value: `${metrics.selfCitationRate.toFixed(1)}%`,
      icon: Percent,
      color: 'bg-orange-100 text-orange-600',
      description: 'Of total citations'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Self-Citation Metrics
        </h3>
        <p className="text-muted-foreground">
          Comprehensive analysis of self-citation patterns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {metric.description}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-muted-foreground">
                  {metric.title}
                </h4>
                <p className="text-2xl font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-muted/50">
        <h4 className="font-semibold mb-3 text-foreground">Key Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-foreground">Self-Citation Intensity:</span>
            <p className="text-muted-foreground">
              {metrics.selfCitationRate > 10 
                ? 'High self-citation rate' 
                : metrics.selfCitationRate > 5 
                ? 'Moderate self-citation rate' 
                : 'Low self-citation rate'}
            </p>
          </div>
          <div>
            <span className="font-medium text-foreground">Coverage:</span>
            <p className="text-muted-foreground">
              {((metrics.papersWithSelfCitations / metrics.totalPapers) * 100).toFixed(1)}% 
              of papers contain self-citations
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};