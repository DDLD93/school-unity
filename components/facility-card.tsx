import { Facility, Status, Condition, OperationalStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeVariant, getStatusLabel } from "@/lib/utils";
import { calculateFacilityStatus } from "@/lib/rules";

interface FacilityCardProps {
  facility: Facility;
}

const facilityTypeLabels: Record<string, string> = {
  science_lab: "Science Lab",
  computer_lab: "Computer Lab",
  library: "Library",
  sports_center: "Sports Center",
  staff_quarters: "Staff Quarters",
  auditorium: "Auditorium",
  cafeteria: "Cafeteria",
  clinic: "Clinic",
  workshop: "Workshop",
};

export function FacilityCard({ facility }: FacilityCardProps) {
  const status = calculateFacilityStatus([facility]);
  const utilizationPercentage =
    facility.capacity > 0 ? (facility.currentUsage / facility.capacity) * 100 : 0;

  const getStatusDot = () => {
    if (status === Status.Green) return <span className="status-dot status-dot-green" />;
    if (status === Status.Amber) return <span className="status-dot status-dot-amber" />;
    return <span className="status-dot status-dot-red" />;
  };

  const borderColor =
    status === Status.Green
      ? "border-green-500"
      : status === Status.Amber
      ? "border-amber-500"
      : "border-red-500";

  const bgGradient =
    status === Status.Green
      ? "from-green-50 to-green-100/30"
      : status === Status.Amber
      ? "from-amber-50 to-amber-100/30"
      : "from-red-50 to-red-100/30";

  return (
    <Card
      className={`dashboard-card border-l-4 ${borderColor} bg-gradient-to-br ${bgGradient} hover:shadow-lg transition-all duration-300`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusDot()}
            <div>
              <CardTitle className="text-lg font-bold">
                {facility.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {facilityTypeLabels[facility.type] || facility.type}
              </p>
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(status)} className="font-semibold shadow-sm">
            {getStatusLabel(status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Capacity:</span>
            <span className="font-medium">{facility.capacity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Usage:</span>
            <span className="font-medium">{facility.currentUsage}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Utilization:</span>
            <span className="font-medium">{utilizationPercentage.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Condition:</span>
            <span className="font-medium capitalize">{facility.condition}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium capitalize">{facility.operationalStatus}</span>
          </div>
          {facility.equipmentCount !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Equipment:</span>
              <span className="font-medium">{facility.equipmentCount}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
