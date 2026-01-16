import { notFound } from "next/navigation";
import { schools } from "@/lib/data";
import {
  calculateSchoolStatus,
  calculateHostelStatus,
  calculateClassroomStatus,
  calculateWaterStatus,
  calculatePowerStatus,
  generateRiskFlags,
  getTotalBoardingCapacity,
  calculateTeacherStatus,
  calculateEquipmentStatus,
  calculateFacilityStatus,
  calculateComputerLabStatus,
} from "@/lib/rules";
import {
  formatNumber,
  getStatusColor,
  getStatusBadgeVariant,
  getStatusLabel,
} from "@/lib/utils";
import { Status } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { TeacherSummaryComponent } from "@/components/teacher-summary";
import { EquipmentStatus } from "@/components/equipment-status";
import { FacilityCard } from "@/components/facility-card";
import {
  TeacherDistributionChart,
  TeacherQualificationChart,
  EquipmentStatusChart,
  FacilityUtilizationChart,
  ComputerLabStatusChart,
} from "@/components/ui/charts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SchoolDetailPage({ params }: PageProps) {
  const { id } = await params;
  const school = schools.find((s) => s.id === id);

  if (!school) {
    notFound();
  }

  const schoolStatus = calculateSchoolStatus(school);
  const capacity = getTotalBoardingCapacity(school);
  const riskFlags = generateRiskFlags(school);

  const hostelStatuses = school.hostels.map(calculateHostelStatus);
  const worstHostelStatus =
    hostelStatuses.includes(Status.Red)
      ? Status.Red
      : hostelStatuses.includes(Status.Amber)
      ? Status.Amber
      : Status.Green;

  const classroomStatuses = school.classrooms.map(calculateClassroomStatus);
  const worstClassroomStatus =
    classroomStatuses.includes(Status.Red)
      ? Status.Red
      : classroomStatuses.includes(Status.Amber)
      ? Status.Amber
      : Status.Green;

  const waterStatus = calculateWaterStatus(school.waterSources);
  const powerStatus = calculatePowerStatus(school.powerSources);
  const teacherStatus = calculateTeacherStatus(school.teacherSummary, school.totalStudents);
  const equipmentStatus = calculateEquipmentStatus(school.equipment);
  const facilityStatus = calculateFacilityStatus(school.facilities);
  const computerLabStatus = calculateComputerLabStatus(school.computerLabs);

  // Prepare chart data
  const teacherSubjectData = Object.entries(school.teacherSummary.bySubjectArea)
    .filter(([_, count]) => count > 0)
    .map(([subject, count]) => ({ subject, count }));

  const teacherQualificationData = Object.entries(school.teacherSummary.byQualification)
    .filter(([_, count]) => count > 0)
    .map(([qualification, count]) => ({ qualification, count }));

  const equipmentChartData = school.equipment.map((eq) => ({
    category: eq.category,
    functional: eq.functionalCount,
    nonFunctional: eq.totalCount - eq.functionalCount,
  }));

  const facilityUtilizationData = school.facilities.map((facility) => ({
    name: facility.name,
    utilization: facility.currentUsage,
    capacity: facility.capacity,
  }));

  const totalComputers = school.computerLabs.reduce((sum, lab) => sum + lab.totalComputers, 0);
  const functionalComputers = school.computerLabs.reduce(
    (sum, lab) => sum + lab.functionalComputers,
    0
  );
  const nonFunctionalComputers = totalComputers - functionalComputers;

  const getStatusDot = (status: Status) => {
    if (status === Status.Green) return <span className="status-dot status-dot-green" />;
    if (status === Status.Amber) return <span className="status-dot status-dot-amber" />;
    return <span className="status-dot status-dot-red" />;
  };

  const infrastructureItems = [
    {
      name: "Hostels",
      status: worstHostelStatus,
      summary: `${school.hostels.length} hostel${school.hostels.length !== 1 ? "s" : ""}, ${formatNumber(capacity)} total capacity, ${formatNumber(school.hostels.reduce((sum, h) => sum + h.currentOccupancy, 0))} occupied`,
    },
    {
      name: "Classrooms",
      status: worstClassroomStatus,
      summary: `${school.classrooms.length} classroom${school.classrooms.length !== 1 ? "s" : ""}, ${formatNumber(school.classrooms.reduce((sum, c) => sum + c.seatingCapacity, 0))} total capacity`,
    },
    {
      name: "Water",
      status: waterStatus,
      summary: `${school.waterSources.length} source${school.waterSources.length !== 1 ? "s" : ""}, ${school.waterSources.filter(ws => ws.functionalStatus).length} functional`,
    },
    {
      name: "Power",
      status: powerStatus,
      summary: `${school.powerSources.length} source${school.powerSources.length !== 1 ? "s" : ""}, ${school.powerSources.filter(ps => ps.operationalStatus).length} operational`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50/50 to-green-100/30">
      <div className="container mx-auto px-6 py-10">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/schools"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Schools
          </Link>
        </div>

        {/* School Header */}
        <div className="mb-10">
          <Card className="dashboard-card border-2 border-green-200 bg-gradient-to-r from-white to-green-50/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-green-500 rounded-full" />
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                      {school.name}
                    </h1>
                  </div>
                  <p className="text-lg font-medium text-muted-foreground ml-16">
                    {school.state}
                  </p>
                </div>
                <Badge 
                  variant={getStatusBadgeVariant(schoolStatus)}
                  className="text-base px-4 py-2 font-semibold shadow-sm"
                >
                  {getStatusLabel(schoolStatus)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4 mt-6">
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50/50 to-white border border-green-200">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Students
                  </div>
                  <div className="text-3xl font-bold text-green-700">
                    {formatNumber(school.totalStudents)}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50/50 to-white border border-green-200">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Staff
                  </div>
                  <div className="text-3xl font-bold text-green-700">
                    {formatNumber(school.totalStaff)}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50/50 to-white border border-green-200">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Boarding Capacity
                  </div>
                  <div className="text-3xl font-bold text-green-700">
                    {formatNumber(capacity)}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50/50 to-white border border-green-200">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Active Risks
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    {riskFlags.filter((f) => f.active).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Infrastructure Status */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-green-500 rounded-full" />
            <h2 className="text-3xl font-bold text-gray-900">
              Infrastructure Status
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {infrastructureItems.map((item) => {
              const borderColor = 
                item.status === Status.Green
                  ? "border-green-500"
                  : item.status === Status.Amber
                  ? "border-amber-500"
                  : "border-red-500";
              const bgGradient =
                item.status === Status.Green
                  ? "from-green-50 to-green-100/30"
                  : item.status === Status.Amber
                  ? "from-amber-50 to-amber-100/30"
                  : "from-red-50 to-red-100/30";

              return (
                <Card
                  key={item.name}
                  className={`dashboard-card border-l-4 ${borderColor} bg-gradient-to-br ${bgGradient} hover:shadow-lg transition-all duration-300`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusDot(item.status)}
                        <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
                      </div>
                      <Badge 
                        variant={getStatusBadgeVariant(item.status)}
                        className="font-semibold shadow-sm"
                      >
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      {item.summary}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-green-500 rounded-full" />
            <h2 className="text-3xl font-bold text-gray-900">Services</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <TeacherSummaryComponent
              teacherSummary={school.teacherSummary}
              totalStudents={school.totalStudents}
            />
            <EquipmentStatus equipment={school.equipment} />
          </div>

          {/* Computer Labs */}
          {school.computerLabs.length > 0 && (
            <Card className="dashboard-card border-2 border-green-200 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusDot(computerLabStatus)}
                    <CardTitle className="text-xl font-bold">Computer Labs</CardTitle>
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(computerLabStatus)}
                    className="font-semibold"
                  >
                    {getStatusLabel(computerLabStatus)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {school.computerLabs.map((lab) => (
                    <div
                      key={lab.id}
                      className="p-4 rounded-lg bg-gradient-to-br from-green-50/50 to-white border border-green-200"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">{lab.name}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium">{lab.totalComputers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Functional:</span>
                          <span className="font-medium text-green-700">
                            {lab.functionalComputers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">Non-Functional:</span>
                          <span className="font-medium text-red-600">
                            {lab.totalComputers - lab.functionalComputers}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services Charts */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card className="dashboard-card border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Teacher Distribution by Subject
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TeacherDistributionChart data={teacherSubjectData} />
              </CardContent>
            </Card>

            <Card className="dashboard-card border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Teacher Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TeacherQualificationChart data={teacherQualificationData} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="dashboard-card border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Equipment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EquipmentStatusChart data={equipmentChartData} />
              </CardContent>
            </Card>

            {totalComputers > 0 && (
              <Card className="dashboard-card border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Computer Lab Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ComputerLabStatusChart
                    functional={functionalComputers}
                    nonFunctional={nonFunctionalComputers}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Facilities Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-green-500 rounded-full" />
            <h2 className="text-3xl font-bold text-gray-900">Facilities</h2>
          </div>

          <Card className="dashboard-card border-2 border-green-200 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusDot(facilityStatus)}
                  <CardTitle className="text-xl font-bold">Facilities Overview</CardTitle>
                </div>
                <Badge variant={getStatusBadgeVariant(facilityStatus)} className="font-semibold">
                  {getStatusLabel(facilityStatus)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <FacilityUtilizationChart data={facilityUtilizationData} />
            </CardContent>
          </Card>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {school.facilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        </div>

        {/* Executive Notes */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-green-500 rounded-full" />
            <h2 className="text-3xl font-bold text-gray-900">
              Executive Notes
            </h2>
          </div>
          <Card className="dashboard-card border-2 border-green-200 bg-gradient-to-br from-white to-green-50/50">
            <CardContent className="pt-8 pb-8">
              <p className="text-base leading-relaxed text-muted-foreground font-medium">
                {school.notes}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
