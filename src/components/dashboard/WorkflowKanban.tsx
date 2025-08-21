import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Calendar, 
  User, 
  Building2,
  Clock,
  AlertTriangle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RFQCard {
  id: string;
  rfqNumber: string;
  company: string;
  projectName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate: string;
  estimatedValue: number;
  stage: string;
  daysInStage: number;
}

const mockRFQs: RFQCard[] = [
  {
    id: "1",
    rfqNumber: "RFQ-2025-001",
    company: "Acme Manufacturing",
    projectName: "Automotive Component Series A",
    priority: "high",
    assignee: "John Doe",
    dueDate: "2025-01-15",
    estimatedValue: 125000,
    stage: "inquiry",
    daysInStage: 2
  },
  {
    id: "2", 
    rfqNumber: "RFQ-2025-002",
    company: "TechCorp Industries",
    projectName: "Precision Machined Parts",
    priority: "medium",
    assignee: "Jane Smith",
    dueDate: "2025-01-20",
    estimatedValue: 75000,
    stage: "review",
    daysInStage: 5
  },
  {
    id: "3",
    rfqNumber: "RFQ-2025-003", 
    company: "Global Aerospace",
    projectName: "Titanium Brackets",
    priority: "urgent",
    assignee: "Mike Johnson",
    dueDate: "2025-01-10",
    estimatedValue: 200000,
    stage: "quote",
    daysInStage: 3
  },
  {
    id: "4",
    rfqNumber: "RFQ-2025-004",
    company: "Marine Systems Ltd",
    projectName: "Stainless Steel Fittings", 
    priority: "low",
    assignee: "Sarah Wilson",
    dueDate: "2025-02-01",
    estimatedValue: 50000,
    stage: "production",
    daysInStage: 1
  }
];

const stages = [
  { id: "inquiry", name: "New Inquiry", color: "bg-blue-100 text-blue-800" },
  { id: "review", name: "Under Review", color: "bg-orange-100 text-orange-800" },
  { id: "quote", name: "Quotation", color: "bg-purple-100 text-purple-800" },
  { id: "production", name: "Production", color: "bg-green-100 text-green-800" },
  { id: "completed", name: "Completed", color: "bg-gray-100 text-gray-800" }
];

export function WorkflowKanban() {
  const [rfqs, setRfqs] = useState<RFQCard[]>(mockRFQs);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isOverdue = (daysInStage: number) => daysInStage > 7;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">RFQ Workflow</h2>
          <p className="text-muted-foreground">Track and manage your manufacturing requests</p>
        </div>
        <Button asChild>
          <Link to="/rfq/new">
            New RFQ
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">
        {stages.map((stage) => {
          const stageRFQs = rfqs.filter(rfq => rfq.stage === stage.id);
          
          return (
            <div key={stage.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{stage.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {stageRFQs.length}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {stageRFQs.map((rfq) => (
                  <Card key={rfq.id} className="card-elevated cursor-pointer hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {rfq.rfqNumber}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Move to Next Stage</DropdownMenuItem>
                            <DropdownMenuItem>Assign to...</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(rfq.priority)}`}
                        >
                          {rfq.priority.toUpperCase()}
                        </Badge>
                        {isOverdue(rfq.daysInStage) && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-3">
                      <div>
                        <p className="font-medium text-sm">{rfq.projectName}</p>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                          <Building2 className="h-3 w-3" />
                          <span>{rfq.company}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{rfq.assignee}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(rfq.estimatedValue)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{rfq.dueDate}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{rfq.daysInStage} days</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {stageRFQs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No RFQs in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}