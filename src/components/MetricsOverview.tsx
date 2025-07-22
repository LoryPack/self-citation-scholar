import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Quote, 
  TrendingUp, 
  BarChart3,
  Target,
  Percent,
  Minus
} from 'lucide-react';
import { SelfCitationMetrics } from '@/types/semanticScholar';

interface MetricsOverviewProps {
  metrics: SelfCitationMetrics;
}

export const MetricsOverview = ({ metrics }: MetricsOverviewProps) => {

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Self-Citation Analysis
        </h3>
        <p className="text-muted-foreground">
          Two methods of self-citation detection and analysis
        </p>
      </div>

      {/* General Overview */}
      <Card className="p-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-5 w-5 text-academic" />
            <span className="text-2xl font-bold text-foreground">{metrics.totalPapers}</span>
            <span className="text-muted-foreground">papers analyzed</span>
          </div>
        </div>
      </Card>

      {/* Method Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method 1 */}
        <Card className="p-6 border-2 border-citation-gold/20">
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Method 1: Target Author Detection
              </h4>
              <p className="text-sm text-muted-foreground">
                Citations where the searched author appears in the citing paper
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-citation-gold/5 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Quote className="h-4 w-4 text-citation-gold" />
                </div>
                <p className="text-2xl font-bold text-citation-gold">{metrics.method1SelfCitations}</p>
                <p className="text-xs text-muted-foreground">Self-Citations</p>
              </div>
              <div className="text-center p-3 bg-scholar-blue/5 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BarChart3 className="h-4 w-4 text-scholar-blue" />
                </div>
                <p className="text-xl font-bold text-scholar-blue">{metrics.method1AverageSelfCitationsPerPaper.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg per Paper</p>
              </div>
              <div className="text-center p-3 bg-metrics-green/5 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-metrics-green" />
                </div>
                <p className="text-2xl font-bold text-metrics-green">{metrics.method1SelfCitationHIndex}</p>
                <p className="text-xs text-muted-foreground">Self-Citation H-Index</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Minus className="h-4 w-4 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-600">{metrics.method1HIndexWithoutSelfCitations}</p>
                <p className="text-xs text-muted-foreground">H-Index without Self-Citations</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Percent className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-xl font-bold text-purple-600">{metrics.method1SelfCitationRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Citation Rate</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Method 2 */}
        <Card className="p-6 border-2 border-scholar-blue/20">
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Method 2: Author Overlap Detection
              </h4>
              <p className="text-sm text-muted-foreground">
                Citations with overlapping authors between cited and citing papers
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-citation-gold/5 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Quote className="h-4 w-4 text-citation-gold" />
                </div>
                <p className="text-2xl font-bold text-citation-gold">{metrics.method2SelfCitations}</p>
                <p className="text-xs text-muted-foreground">Self-Citations</p>
              </div>
              <div className="text-center p-3 bg-scholar-blue/5 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BarChart3 className="h-4 w-4 text-scholar-blue" />
                </div>
                <p className="text-xl font-bold text-scholar-blue">{metrics.method2AverageSelfCitationsPerPaper.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg per Paper</p>
              </div>
              <div className="text-center p-3 bg-metrics-green/5 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-metrics-green" />
                </div>
                <p className="text-2xl font-bold text-metrics-green">{metrics.method2SelfCitationHIndex}</p>
                <p className="text-xs text-muted-foreground">Self-Citation H-Index</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Minus className="h-4 w-4 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-600">{metrics.method2HIndexWithoutSelfCitations}</p>
                <p className="text-xs text-muted-foreground">H-Index without Self-Citations</p>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Percent className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-xl font-bold text-purple-600">{metrics.method2SelfCitationRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Citation Rate</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Comparison Insights */}
      <Card className="p-6 bg-muted/50">
        <h4 className="font-semibold mb-3 text-foreground">Method Comparison</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-foreground">Detection Difference:</span>
            <p className="text-muted-foreground">
              Method 2 found {metrics.method2SelfCitations - metrics.method1SelfCitations} additional self-citations
            </p>
          </div>
          <div>
            <span className="font-medium text-foreground">Method 1 Coverage:</span>
            <p className="text-muted-foreground">
              {((metrics.method1PapersWithSelfCitations / metrics.totalPapers) * 100).toFixed(1)}% 
              of papers contain self-citations
            </p>
          </div>
          <div>
            <span className="font-medium text-foreground">Method 2 Coverage:</span>
            <p className="text-muted-foreground">
              {((metrics.method2PapersWithSelfCitations / metrics.totalPapers) * 100).toFixed(1)}% 
              of papers contain self-citations
            </p>
          </div>
          <div>
            <span className="font-medium text-foreground">H-Index Impact:</span>
            <p className="text-muted-foreground">
              Method 1: {metrics.method1SelfCitationHIndex - metrics.method1HIndexWithoutSelfCitations} difference
            </p>
            <p className="text-muted-foreground">
              Method 2: {metrics.method2SelfCitationHIndex - metrics.method2HIndexWithoutSelfCitations} difference
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};