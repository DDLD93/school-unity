import { schools } from "@/lib/data";
import { calculateNationalAggregates } from "@/lib/rules";
import { formatNumber, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Status } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OverviewPage() {
  const aggregates = calculateNationalAggregates(schools);

  const statusCards = [
    {
      status: Status.Green,
      count: aggregates.schoolsByStatus.green,
      label: "Schools OK",
    },
    {
      status: Status.Amber,
      count: aggregates.schoolsByStatus.amber,
      label: "Needs Attention",
    },
    {
      status: Status.Red,
      count: aggregates.schoolsByStatus.red,
      label: "Urgent",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Executive Overview
        </h1>
        <p className="text-muted-foreground">
          National snapshot of Federal Unity Schools
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Unity Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-semibold">
              {formatNumber(aggregates.totalSchools)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-semibold">
              {formatNumber(aggregates.totalStudents)}
            </div>
          </CardContent>
        </Card>

        {statusCards.map(({ status, count, label }) => (
          <Card
            key={status}
            className={`border-l-4 ${
              status === Status.Green
                ? "border-l-green-500"
                : status === Status.Amber
                ? "border-l-amber-500"
                : "border-l-red-500"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-semibold">
                  {formatNumber(count)}
                </div>
                <Badge
                  variant={
                    status === Status.Green
                      ? "default"
                      : status === Status.Amber
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {getStatusLabel(status)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
