"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { schools } from "@/lib/data";
import {
  calculateSchoolStatus,
  generateRiskFlags,
  getTotalBoardingCapacity,
  calculateTeacherStatus,
  calculateEquipmentStatus,
  calculateFacilityStatus,
} from "@/lib/rules";
import { formatNumber, getStatusBadgeVariant, getStatusLabel } from "@/lib/utils";
import { Status } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SortField = "status" | "name" | "students" | "capacity" | "teachers" | "equipment" | "facilities";
type SortDirection = "asc" | "desc";

export default function SchoolsPage() {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedSchools = useMemo(() => {
    const schoolsWithStatus = schools.map((school) => ({
      school,
      status: calculateSchoolStatus(school),
      capacity: getTotalBoardingCapacity(school),
      riskFlags: generateRiskFlags(school),
      teacherStatus: calculateTeacherStatus(school.teacherSummary, school.totalStudents),
      equipmentStatus: calculateEquipmentStatus(school.equipment),
      facilityStatus: calculateFacilityStatus(school.facilities),
    }));

    return [...schoolsWithStatus].sort((a, b) => {
      let comparison = 0;

      if (sortField === "status") {
        const statusOrder = { [Status.Red]: 0, [Status.Amber]: 1, [Status.Green]: 2 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
      } else if (sortField === "name") {
        comparison = a.school.name.localeCompare(b.school.name);
      } else if (sortField === "students") {
        comparison = a.school.totalStudents - b.school.totalStudents;
      } else if (sortField === "capacity") {
        comparison = a.capacity - b.capacity;
      } else if (sortField === "teachers") {
        const statusOrder = { [Status.Red]: 0, [Status.Amber]: 1, [Status.Green]: 2 };
        comparison = statusOrder[a.teacherStatus] - statusOrder[b.teacherStatus];
      } else if (sortField === "equipment") {
        const statusOrder = { [Status.Red]: 0, [Status.Amber]: 1, [Status.Green]: 2 };
        comparison = statusOrder[a.equipmentStatus] - statusOrder[b.equipmentStatus];
      } else if (sortField === "facilities") {
        const statusOrder = { [Status.Red]: 0, [Status.Amber]: 1, [Status.Green]: 2 };
        comparison = statusOrder[a.facilityStatus] - statusOrder[b.facilityStatus];
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50/50 to-green-100/30">
      <div className="container mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-green-500 rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              School List
            </h1>
          </div>
          <p className="text-lg text-muted-foreground ml-16">
            All Federal Unity Schools with infrastructure status
          </p>
        </div>

        {/* Table Card - Power BI Style */}
        <Card className="dashboard-card border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Schools Directory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-green-100/50 to-green-50/30 hover:bg-green-100/50">
                    <TableHead
                      className="cursor-pointer hover:bg-green-100/70 font-semibold text-gray-900 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        School Name
                        {sortField === "name" && (
                          <span className="text-green-700">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">State</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-green-100/70 font-semibold text-gray-900 transition-colors"
                      onClick={() => handleSort("students")}
                    >
                      <div className="flex items-center gap-2">
                        Students
                        {sortField === "students" && (
                          <span className="text-green-700">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-green-100/70 font-semibold text-gray-900 transition-colors"
                      onClick={() => handleSort("capacity")}
                    >
                      <div className="flex items-center gap-2">
                        Boarding Capacity
                        {sortField === "capacity" && (
                          <span className="text-green-700">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-green-100/70 font-semibold text-gray-900 transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {sortField === "status" && (
                          <span className="text-green-700">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-green-100/70 font-semibold text-gray-900 transition-colors"
                      onClick={() => handleSort("teachers")}
                    >
                      <div className="flex items-center gap-2">
                        Teachers
                        {sortField === "teachers" && (
                          <span className="text-green-700">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-green-100/70 font-semibold text-gray-900 transition-colors"
                      onClick={() => handleSort("equipment")}
                    >
                      <div className="flex items-center gap-2">
                        Equipment
                        {sortField === "equipment" && (
                          <span className="text-green-700">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-green-100/70 font-semibold text-gray-900 transition-colors"
                      onClick={() => handleSort("facilities")}
                    >
                      <div className="flex items-center gap-2">
                        Facilities
                        {sortField === "facilities" && (
                          <span className="text-green-700">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">Risk Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSchools.map(({ school, status, capacity, riskFlags, teacherStatus, equipmentStatus, facilityStatus }, index) => (
                    <TableRow
                      key={school.id}
                      className={`cursor-pointer transition-all duration-150 ${
                        index % 2 === 0 
                          ? "bg-white hover:bg-green-50/50" 
                          : "bg-green-50/30 hover:bg-green-50/50"
                      } border-b border-green-200/50`}
                      onClick={() => router.push(`/schools/${school.id}`)}
                    >
                      <TableCell className="font-semibold text-gray-900">
                        {school.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{school.state}</TableCell>
                      <TableCell className="font-medium">{formatNumber(school.totalStudents)}</TableCell>
                      <TableCell className="font-medium">{formatNumber(capacity)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(status)}
                          className="font-semibold shadow-sm"
                        >
                          {getStatusLabel(status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(teacherStatus)}
                          className="font-semibold shadow-sm text-xs"
                        >
                          {getStatusLabel(teacherStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(equipmentStatus)}
                          className="font-semibold shadow-sm text-xs"
                        >
                          {getStatusLabel(equipmentStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(facilityStatus)}
                          className="font-semibold shadow-sm text-xs"
                        >
                          {getStatusLabel(facilityStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 flex-wrap">
                          {riskFlags
                            .filter((flag) => flag.active)
                            .slice(0, 2)
                            .map((flag, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs font-medium border-gray-300"
                              >
                                {flag.category}
                              </Badge>
                            ))}
                          {riskFlags.filter((flag) => flag.active).length > 2 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs font-medium border-gray-300"
                            >
                              +{riskFlags.filter((flag) => flag.active).length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
