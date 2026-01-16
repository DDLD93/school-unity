"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { schools } from "@/lib/data";
import {
  calculateSchoolStatus,
  generateRiskFlags,
  getTotalBoardingCapacity,
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

type SortField = "status" | "name" | "students" | "capacity";
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          School List
        </h1>
        <p className="text-muted-foreground">
          All Federal Unity Schools with infrastructure status
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("name")}
                >
                  School Name
                  {sortField === "name" && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </TableHead>
                <TableHead>State</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("students")}
                >
                  Students
                  {sortField === "students" && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("capacity")}
                >
                  Boarding Capacity
                  {sortField === "capacity" && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("status")}
                >
                  Status
                  {sortField === "status" && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </TableHead>
                <TableHead>Risk Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSchools.map(({ school, status, capacity, riskFlags }) => (
                <TableRow
                  key={school.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/schools/${school.id}`)}
                >
                  <TableCell className="font-medium">
                    {school.name}
                  </TableCell>
                  <TableCell>{school.state}</TableCell>
                  <TableCell>{formatNumber(school.totalStudents)}</TableCell>
                  <TableCell>{formatNumber(capacity)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(status)}>
                      {getStatusLabel(status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {riskFlags
                        .filter((flag) => flag.active)
                        .slice(0, 2)
                        .map((flag, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {flag.category}
                          </Badge>
                        ))}
                      {riskFlags.filter((flag) => flag.active).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{riskFlags.filter((flag) => flag.active).length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
