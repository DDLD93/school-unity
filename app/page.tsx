import { schools } from "@/lib/data";
import { calculateNationalAggregates, calculateSchoolStatus } from "@/lib/rules";
import { formatNumber, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Status } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  StatusDistributionChart,
  RegionalComparisonChart,
  ServicesSummaryChart,
  FacilitiesSummaryChart,
} from "@/components/ui/charts";

export default function OverviewPage() {
  const aggregates = calculateNationalAggregates(schools);

  // Calculate services aggregates
  const totalTeachers = schools.reduce((sum, s) => sum + s.teacherSummary.total, 0);
  const totalQualifiedTeachers = schools.reduce((sum, s) => sum + s.teacherSummary.qualified, 0);
  const totalComputers = schools.reduce(
    (sum, s) => sum + (s.equipment.find((e) => e.category === "computers")?.totalCount || 0),
    0
  );
  const totalLabEquipment = schools.reduce(
    (sum, s) => sum + (s.equipment.find((e) => e.category === "lab_equipment")?.totalCount || 0),
    0
  );
  const totalSportsEquipment = schools.reduce(
    (sum, s) => sum + (s.equipment.find((e) => e.category === "sports_equipment")?.totalCount || 0),
    0
  );

  // Calculate facilities aggregates
  const facilitiesByType = schools.reduce((acc, school) => {
    school.facilities.forEach((facility) => {
      acc[facility.type] = (acc[facility.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Status distribution data for chart
  const statusDistributionData = [
    { name: "Schools OK", value: aggregates.schoolsByStatus.green, status: Status.Green },
    { name: "Needs Attention", value: aggregates.schoolsByStatus.amber, status: Status.Amber },
    { name: "Urgent", value: aggregates.schoolsByStatus.red, status: Status.Red },
  ];

  // Regional comparison data
  const regionalData = schools.reduce((acc, school) => {
    if (!acc[school.state]) {
      acc[school.state] = { state: school.state, green: 0, amber: 0, red: 0 };
    }
    const status = calculateSchoolStatus(school);
    if (status === Status.Green) acc[school.state].green++;
    else if (status === Status.Amber) acc[school.state].amber++;
    else acc[school.state].red++;
    return acc;
  }, {} as Record<string, { state: string; green: number; amber: number; red: number }>);

  const regionalChartData = Object.values(regionalData);

  // Services summary data
  const servicesData = [
    { category: "Teachers", count: totalTeachers },
    { category: "Qualified Teachers", count: totalQualifiedTeachers },
    { category: "Computers", count: totalComputers },
    { category: "Lab Equipment", count: totalLabEquipment },
    { category: "Sports Equipment", count: totalSportsEquipment },
  ];

  // Facilities summary data
  const facilitiesData = Object.entries(facilitiesByType).map(([type, count]) => ({
    type,
    count,
  }));

  const statusCards = [
    {
      status: Status.Green,
      count: aggregates.schoolsByStatus.green,
      label: "Schools OK",
      color: "green",
      bgGradient: "from-green-50 to-green-100/50",
      borderColor: "border-green-500",
      textColor: "text-green-700",
    },
    {
      status: Status.Amber,
      count: aggregates.schoolsByStatus.amber,
      label: "Needs Attention",
      color: "amber",
      bgGradient: "from-amber-50 to-amber-100/50",
      borderColor: "border-amber-500",
      textColor: "text-amber-700",
    },
    {
      status: Status.Red,
      count: aggregates.schoolsByStatus.red,
      label: "Urgent",
      color: "red",
      bgGradient: "from-red-50 to-red-100/50",
      borderColor: "border-red-500",
      textColor: "text-red-700",
    },
  ];

  const getStatusDot = (color: string) => {
    const classes = {
      green: "status-dot-green",
      amber: "status-dot-amber",
      red: "status-dot-red",
    };
    return <span className={`status-dot ${classes[color as keyof typeof classes]}`} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50/50 to-green-100/30">
      <div className="container mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-green-500 rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Unity Schools oversight
            </h1>
          </div>
          <p className="text-lg text-muted-foreground ml-16">
            Pilot View - For Ministry level visibility and early intervention
          </p>
        </div>

        {/* Key Metrics Grid - Power BI Style */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
          {/* Total Schools Card */}
          <Card className="dashboard-card border-l-4 border-l-green-600 bg-gradient-to-br from-white to-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Unity Schools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-value text-green-700">
                {formatNumber(aggregates.totalSchools)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Federal institutions</p>
            </CardContent>
          </Card>

          {/* Total Students Card */}
          <Card className="dashboard-card border-l-4 border-l-green-500 bg-gradient-to-br from-white to-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-value text-green-700">
                {formatNumber(aggregates.totalStudents)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Enrolled nationwide</p>
            </CardContent>
          </Card>

          {/* Status Cards */}
          {statusCards.map(({ status, count, label, color, bgGradient, borderColor, textColor }) => (
            <Card
              key={status}
              className={`dashboard-card border-l-4 ${borderColor} bg-gradient-to-br ${bgGradient} hover:shadow-lg transition-all duration-300`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </CardTitle>
                  {getStatusDot(color)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-3">
                  <div className={`text-4xl font-bold ${textColor}`}>
                    {formatNumber(count)}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge
                    variant={
                      status === Status.Green
                        ? "default"
                        : status === Status.Amber
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-xs font-semibold"
                  >
                    {getStatusLabel(status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {((count / aggregates.totalSchools) * 100).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Status Distribution Chart */}
          <Card className="dashboard-card border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatusDistributionChart data={statusDistributionData} />
            </CardContent>
          </Card>

          {/* Regional Comparison Chart */}
          <Card className="dashboard-card border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Regional Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegionalComparisonChart data={regionalChartData} />
            </CardContent>
          </Card>
        </div>

        {/* Services & Facilities Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Services Summary */}
          <Card className="dashboard-card border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Services Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ServicesSummaryChart data={servicesData} />
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-green-50/50 border border-green-200">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Total Teachers
                  </div>
                  <div className="text-xl font-bold text-green-700">{formatNumber(totalTeachers)}</div>
                </div>
                <div className="p-3 rounded-lg bg-green-50/50 border border-green-200">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Qualified
                  </div>
                  <div className="text-xl font-bold text-green-700">
                    {formatNumber(totalQualifiedTeachers)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facilities Summary */}
          <Card className="dashboard-card border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Facilities Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FacilitiesSummaryChart data={facilitiesData} />
              <div className="mt-4 p-3 rounded-lg bg-green-50/50 border border-green-200">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Total Facilities
                </div>
                <div className="text-xl font-bold text-green-700">
                  {formatNumber(Object.values(facilitiesByType).reduce((a, b) => a + b, 0))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <Card className="dashboard-card bg-gradient-to-r from-green-50/80 to-white border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              National Status Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-white/60">
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {((aggregates.schoolsByStatus.green / aggregates.totalSchools) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Operational</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/60">
                <div className="text-2xl font-bold text-amber-600 mb-1">
                  {((aggregates.schoolsByStatus.amber / aggregates.totalSchools) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Needs Attention</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/60">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {((aggregates.schoolsByStatus.red / aggregates.totalSchools) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Urgent Action</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
