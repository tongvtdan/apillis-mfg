import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Settings, 
  RefreshCw, 
  Bell, 
  CheckCircle, 
  XCircle,
  Target,
  Users,
  FileText,
  MessageCircle,
  ArrowRight,
  Zap,
  Timer,
  Activity
} from 'lucide-react';
import { 
  BottleneckAlert, 
  BottleneckDetectionConfig, 
  ProjectWorkflowAnalytics,
  BottleneckSeverity,
  BOTTLENECK_SEVERITY_COLORS 
} from '@/types/supplier';
import { Project, ProjectStatus } from '@/types/project';
import { useProjects } from '@/hooks/useProjects';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BottleneckDetectionSystemProps {
  className?: string;
  onProjectAction?: (projectId: string, action: string) => void;
}

interface BottleneckConfigProps {
  config: BottleneckDetectionConfig[];
  onConfigUpdate: (config: BottleneckDetectionConfig[]) => void;
}

interface RecommendationEngine {
  analyzeBottleneck: (bottleneck: BottleneckAlert, project: Project) => string[];
  generateActionPlan: (bottleneck: BottleneckAlert) => ActionPlan;
}

interface ActionPlan {
  immediate: string[];
  short_term: string[];
  long_term: string[];
  estimated_resolution_days: number;
  required_resources: string[];
}

const DEFAULT_SLA_CONFIG: BottleneckDetectionConfig[] = [
  {
    id: '1',
    stage_name: 'inquiry_received',
    sla_hours: 24,
    warning_threshold_hours: 18,
    critical_threshold_hours: 36,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    stage_name: 'technical_review',
    sla_hours: 48,
    warning_threshold_hours: 36,
    critical_threshold_hours: 72,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    stage_name: 'supplier_rfq_sent',
    sla_hours: 72,
    warning_threshold_hours: 60,
    critical_threshold_hours: 96,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    stage_name: 'quoted',
    sla_hours: 24,
    warning_threshold_hours: 18,
    critical_threshold_hours: 48,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Smart recommendation engine
const createRecommendationEngine = (): RecommendationEngine => ({
  analyzeBottleneck: (bottleneck: BottleneckAlert, project: Project) => {
    const recommendations: string[] = [];
    
    switch (bottleneck.current_stage) {
      case 'inquiry_received':
        recommendations.push('Assign to technical reviewer immediately');
        recommendations.push('Escalate to engineering lead if complex requirements detected');
        if (project.priority === 'urgent') {
          recommendations.push('Consider fast-track process for urgent priority');
        }
        break;
        
      case 'technical_review':
        recommendations.push('Schedule immediate review session with engineering team');
        recommendations.push('Check for missing technical specifications or drawings');
        recommendations.push('Consider parallel review process for complex projects');
        if (bottleneck.hours_in_stage > 72) {
          recommendations.push('Escalate to senior engineering lead');
        }
        break;
        
      case 'supplier_rfq_sent':
        recommendations.push('Contact suppliers to confirm RFQ receipt');
        recommendations.push('Send reminder notices to non-responding suppliers');
        recommendations.push('Consider adding backup suppliers to RFQ list');
        if (bottleneck.hours_in_stage > 96) {
          recommendations.push('Source additional suppliers for competitive bidding');
        }
        break;
        
      case 'quoted':
        recommendations.push('Schedule quote comparison session immediately');
        recommendations.push('Prepare procurement recommendation document');
        recommendations.push('Contact customer for final approval if needed');
        break;
        
      default:
        recommendations.push('Review project requirements and constraints');
        recommendations.push('Check for resource availability conflicts');
        break;
    }
    
    return recommendations;
  },
  
  generateActionPlan: (bottleneck: BottleneckAlert) => {
    const basePlan: ActionPlan = {
      immediate: [],
      short_term: [],
      long_term: [],
      estimated_resolution_days: 1,
      required_resources: []
    };
    
    switch (bottleneck.current_stage) {
      case 'supplier_rfq_sent':
        return {
          immediate: [
            'Contact all pending suppliers via phone',
            'Send follow-up emails with deadline reminder',
            'Identify and qualify 2-3 backup suppliers'
          ],
          short_term: [
            'Expand supplier database for this specialty',
            'Implement automated reminder system',
            'Review and optimize RFQ templates'
          ],
          long_term: [
            'Develop preferred supplier partnerships',
            'Implement supplier performance scorecards',
            'Create supplier development program'
          ],
          estimated_resolution_days: 2,
          required_resources: ['Procurement specialist', 'Supplier database access']
        };
        
      case 'technical_review':
        return {
          immediate: [
            'Assign senior engineer for review',
            'Schedule emergency review session',
            'Gather all technical documentation'
          ],
          short_term: [
            'Implement parallel review process',
            'Create technical review templates',
            'Set up automated review assignments'
          ],
          long_term: [
            'Increase engineering team capacity',
            'Implement AI-assisted technical screening',
            'Develop technical complexity scoring'
          ],
          estimated_resolution_days: 1,
          required_resources: ['Senior engineer', 'Technical documentation']
        };
        
      default:
        return basePlan;
    }
  }
});

function BottleneckConfigPanel({ config, onConfigUpdate }: BottleneckConfigProps) {
  const [editingConfig, setEditingConfig] = useState<BottleneckDetectionConfig[]>(config);

  const handleSLAUpdate = (stageId: string, field: keyof BottleneckDetectionConfig, value: number | boolean) => {
    const updatedConfig = editingConfig.map(stage => 
      stage.id === stageId 
        ? { ...stage, [field]: value, updated_at: new Date().toISOString() }
        : stage
    );
    setEditingConfig(updatedConfig);
  };

  const handleSaveConfig = () => {
    onConfigUpdate(editingConfig);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>SLA Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure service level agreement thresholds for bottleneck detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {editingConfig.map((stage) => (
          <div key={stage.id} className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium capitalize">
                {stage.stage_name.replace('_', ' ')}
              </h4>
              <Badge variant={stage.is_active ? 'default' : 'secondary'}>
                {stage.is_active ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <label className="text-muted-foreground">SLA Target (hours)</label>
                <input
                  type="number"
                  value={stage.sla_hours}
                  onChange={(e) => handleSLAUpdate(stage.id, 'sla_hours', parseInt(e.target.value))}
                  className="w-full px-3 py-1 border rounded"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-muted-foreground">Warning Threshold</label>
                <input
                  type="number"
                  value={stage.warning_threshold_hours}
                  onChange={(e) => handleSLAUpdate(stage.id, 'warning_threshold_hours', parseInt(e.target.value))}
                  className="w-full px-3 py-1 border rounded"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-muted-foreground">Critical Threshold</label>
                <input
                  type="number"
                  value={stage.critical_threshold_hours}
                  onChange={(e) => handleSLAUpdate(stage.id, 'critical_threshold_hours', parseInt(e.target.value))}
                  className="w-full px-3 py-1 border rounded"
                />
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setEditingConfig(config)}>
            Reset
          </Button>
          <Button onClick={handleSaveConfig}>
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface BottleneckRecommendationProps {
  bottleneck: BottleneckAlert;
  actionPlan: ActionPlan;
  onExecuteAction: (action: string, projectId: string) => void;
}

function BottleneckRecommendation({ bottleneck, actionPlan, onExecuteAction }: BottleneckRecommendationProps) {
  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{bottleneck.project_title}</CardTitle>
            <CardDescription>
              Stuck in <strong>{bottleneck.current_stage}</strong> for{' '}
              <strong>{Math.round(bottleneck.hours_in_stage / 24)} days</strong>
            </CardDescription>
          </div>
          <Badge className={`${BOTTLENECK_SEVERITY_COLORS[bottleneck.severity]}`}>
            {bottleneck.severity.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Issues Identified */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span>Issues Identified</span>
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6">
            {bottleneck.issues.map((issue, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-warning">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Immediate Actions */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center space-x-2">
            <Zap className="h-4 w-4 text-destructive" />
            <span>Immediate Actions (Today)</span>
          </h4>
          <div className="space-y-2">
            {actionPlan.immediate.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                <span className="text-sm">{action}</span>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => onExecuteAction(action, bottleneck.project_id)}
                >
                  Execute
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Short-term Actions */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center space-x-2">
            <Timer className="h-4 w-4 text-warning" />
            <span>Short-term Actions (This Week)</span>
          </h4>
          <div className="space-y-2">
            {actionPlan.short_term.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                <span className="text-sm">{action}</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onExecuteAction(action, bottleneck.project_id)}
                >
                  Plan
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Resolution Timeline */}
        <div className="p-4 bg-primary/10 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-primary">Estimated Resolution</span>
            <span className="text-primary">{actionPlan.estimated_resolution_days} days</span>
          </div>
          <Progress value={25} className="h-2" />
          <div className="text-xs text-primary mt-1">
            Required: {actionPlan.required_resources.join(', ')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BottleneckDetectionSystem({ className, onProjectAction }: BottleneckDetectionSystemProps) {
  const [activeTab, setActiveTab] = useState('alerts');
  const [loading, setLoading] = useState(true);
  const [bottlenecks, setBottlenecks] = useState<BottleneckAlert[]>([]);
  const [slaConfig, setSlaConfig] = useState<BottleneckDetectionConfig[]>(DEFAULT_SLA_CONFIG);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [recommendations, setRecommendations] = useState<Record<string, ActionPlan>>({});
  
  const { projects, getBottleneckAnalysis } = useProjects();
  const recommendationEngine = createRecommendationEngine();

  // Load bottleneck data
  const loadBottlenecks = useCallback(async () => {
    setLoading(true);
    try {
      const bottleneckData = await getBottleneckAnalysis();
      setBottlenecks(bottleneckData);
      
      // Generate recommendations for each bottleneck
      const newRecommendations: Record<string, ActionPlan> = {};
      bottleneckData.forEach(bottleneck => {
        newRecommendations[bottleneck.project_id] = recommendationEngine.generateActionPlan(bottleneck);
      });
      setRecommendations(newRecommendations);
      
    } catch (error) {
      console.error('Error loading bottlenecks:', error);
    } finally {
      setLoading(false);
    }
  }, [getBottleneckAnalysis, recommendationEngine]);

  useEffect(() => {
    loadBottlenecks();
  }, [loadBottlenecks]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(loadBottlenecks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadBottlenecks]);

  const handleExecuteAction = (action: string, projectId: string) => {
    // Execute the recommended action
    console.log(`Executing action: ${action} for project ${projectId}`);
    onProjectAction?.(projectId, action);
    
    // Refresh bottlenecks after action
    setTimeout(loadBottlenecks, 1000);
  };

  const handleConfigUpdate = (newConfig: BottleneckDetectionConfig[]) => {
    setSlaConfig(newConfig);
    // In real implementation, save to database
    loadBottlenecks(); // Refresh with new thresholds
  };

  const criticalBottlenecks = bottlenecks.filter(b => b.severity === 'critical');
  const warningBottlenecks = bottlenecks.filter(b => b.severity === 'warning');

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bottleneck Detection System</h1>
          <p className="text-muted-foreground">
            AI-powered workflow analysis and automated recommendations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Bell className="h-4 w-4 mr-2" />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={loadBottlenecks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Total Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
            <Activity className="h-8 w-8 ml-auto text-primary" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Critical Alerts</p>
              <p className="text-2xl font-bold text-destructive">{criticalBottlenecks.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 ml-auto text-destructive" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Warning Alerts</p>
              <p className="text-2xl font-bold text-warning">{warningBottlenecks.length}</p>
            </div>
            <Clock className="h-8 w-8 ml-auto text-warning" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">On Track</p>
              <p className="text-2xl font-bold text-success">{projects.length - bottlenecks.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 ml-auto text-success" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">
            Active Alerts ({bottlenecks.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="configuration">
            SLA Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Analyzing workflow bottlenecks...</p>
            </div>
          ) : bottlenecks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-success" />
                <h3 className="text-lg font-medium mb-2">All Clear!</h3>
                <p className="text-muted-foreground">
                  No bottlenecks detected. All projects are within SLA thresholds.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Critical Alerts */}
              {criticalBottlenecks.length > 0 && (
                <div className="space-y-4">
                  <Alert className="border-destructive/20 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-destructive">
                      {criticalBottlenecks.length} Critical Bottleneck{criticalBottlenecks.length > 1 ? 's' : ''} Detected
                    </AlertTitle>
                    <AlertDescription className="text-destructive">
                      These projects require immediate attention to prevent further delays.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    {criticalBottlenecks.map((bottleneck) => (
                      <BottleneckRecommendation
                        key={bottleneck.project_id}
                        bottleneck={bottleneck}
                        actionPlan={recommendations[bottleneck.project_id] || {
                          immediate: [],
                          short_term: [],
                          long_term: [],
                          estimated_resolution_days: 1,
                          required_resources: []
                        }}
                        onExecuteAction={handleExecuteAction}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Warning Alerts */}
              {warningBottlenecks.length > 0 && (
                <div className="space-y-4">
                  <Alert className="border-warning/20 bg-warning/10">
                    <Clock className="h-4 w-4" />
                    <AlertTitle className="text-warning">
                      {warningBottlenecks.length} Warning{warningBottlenecks.length > 1 ? 's' : ''} 
                    </AlertTitle>
                    <AlertDescription className="text-warning">
                      These projects are approaching SLA thresholds.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    {warningBottlenecks.map((bottleneck) => (
                      <BottleneckRecommendation
                        key={bottleneck.project_id}
                        bottleneck={bottleneck}
                        actionPlan={recommendations[bottleneck.project_id] || {
                          immediate: [],
                          short_term: [],
                          long_term: [],
                          estimated_resolution_days: 1,
                          required_resources: []
                        }}
                        onExecuteAction={handleExecuteAction}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
              <CardDescription>
                Smart suggestions based on historical data and workflow patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(recommendations).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4" />
                  <p>No active recommendations</p>
                  <p className="text-sm">All projects are performing optimally</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(recommendations).map(([projectId, plan]) => {
                    const bottleneck = bottlenecks.find(b => b.project_id === projectId);
                    if (!bottleneck) return null;
                    
                    return (
                      <div key={projectId} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">{bottleneck.project_title}</h4>
                        <div className="text-sm text-muted-foreground mb-3">
                          Long-term improvements to prevent similar bottlenecks
                        </div>
                        <ul className="space-y-1 text-sm">
                          {plan.long_term.map((item, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <ArrowRight className="h-3 w-3 mt-1 text-primary flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <BottleneckConfigPanel 
            config={slaConfig} 
            onConfigUpdate={handleConfigUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BottleneckDetectionSystem;