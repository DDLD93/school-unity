import { Equipment, EquipmentCategory, Status } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeVariant, getStatusLabel } from "@/lib/utils";
import { calculateEquipmentStatus } from "@/lib/rules";

interface EquipmentStatusProps {
  equipment: Equipment[];
}

const categoryLabels: Record<EquipmentCategory, string> = {
  computers: "Computers",
  lab_equipment: "Lab Equipment",
  sports_equipment: "Sports Equipment",
  furniture: "Furniture",
  library_books: "Library Books",
  audio_visual: "Audio Visual",
  other: "Other",
};

export function EquipmentStatus({ equipment }: EquipmentStatusProps) {
  const overallStatus = calculateEquipmentStatus(equipment);

  const getStatusDot = () => {
    if (overallStatus === Status.Green) return <span className="status-dot status-dot-green" />;
    if (overallStatus === Status.Amber) return <span className="status-dot status-dot-amber" />;
    return <span className="status-dot status-dot-red" />;
  };

  const equipmentByCategory = equipment.map((eq) => {
    const functionalPercentage =
      eq.totalCount > 0 ? (eq.functionalCount / eq.totalCount) * 100 : 0;
    return {
      ...eq,
      functionalPercentage,
      nonFunctionalCount: eq.totalCount - eq.functionalCount,
    };
  });

  return (
    <Card className="dashboard-card border-2 border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusDot()}
            <CardTitle className="text-xl font-bold">Equipment Status</CardTitle>
          </div>
          <Badge variant={getStatusBadgeVariant(overallStatus)} className="font-semibold">
            {getStatusLabel(overallStatus)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {equipmentByCategory.map((eq) => (
            <div
              key={eq.id}
              className="p-4 rounded-lg bg-gradient-to-r from-green-50/50 to-white border border-green-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">
                  {categoryLabels[eq.category] || eq.category}
                </h4>
                <span className="text-sm text-muted-foreground">
                  {eq.functionalPercentage.toFixed(1)}% functional
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">{eq.totalCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Functional:</span>
                  <span className="font-medium text-green-700">{eq.functionalCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Non-Functional:</span>
                  <span className="font-medium text-red-600">{eq.nonFunctionalCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Condition:</span>
                  <span className="font-medium capitalize">{eq.condition}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
