import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const progressData = [
  {
    label: "Project Processing",
    value: 75,
    color: "bg-blue-500"
  },
  {
    label: "Purchase Orders",
    value: 60,
    color: "bg-green-500"
  },
  {
    label: "Vendor Onboarding",
    value: 90,
    color: "bg-purple-500"
  }
];

export function MonthlyProgress() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Monthly Progress Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {progressData.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">{item.value}%</span>
            </div>
            <Progress value={item.value} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}