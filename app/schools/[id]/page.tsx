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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/schools"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Schools
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              {school.name}
            </h1>
            <p className="text-muted-foreground">{school.state}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(schoolStatus)}>
            {getStatusLabel(schoolStatus)}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mt-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Students</div>
            <div className="text-2xl font-semibold">
              {formatNumber(school.totalStudents)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Staff</div>
            <div className="text-2xl font-semibold">
              {formatNumber(school.totalStaff)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Boarding Capacity
            </div>
            <div className="text-2xl font-semibold">
              {formatNumber(capacity)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Active Risks</div>
            <div className="text-2xl font-semibold">
              {riskFlags.filter((f) => f.active).length}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Infrastructure Status</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {infrastructureItems.map((item) => (
            <Card
              key={item.name}
              className={`border-l-4 ${
                item.status === Status.Green
                  ? "border-l-green-500"
                  : item.status === Status.Amber
                  ? "border-l-amber-500"
                  : "border-l-red-500"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      <div>
        <h2 className="text-xl font-semibold mb-4">Executive Notes</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {school.notes}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
