import { TeacherSummary, Status } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeVariant, getStatusLabel } from "@/lib/utils";
import { calculateTeacherStatus } from "@/lib/rules";

interface TeacherSummaryProps {
  teacherSummary: TeacherSummary;
  totalStudents: number;
}

const subjectLabels: Record<string, string> = {
  science: "Science",
  arts: "Arts",
  commercial: "Commercial",
  technical: "Technical",
  languages: "Languages",
  mathematics: "Mathematics",
  social_studies: "Social Studies",
  physical_education: "Physical Education",
};

const qualificationLabels: Record<string, string> = {
  b_ed: "B.Ed",
  m_ed: "M.Ed",
  phd: "PhD",
  other: "Other",
};

export function TeacherSummaryComponent({ teacherSummary, totalStudents }: TeacherSummaryProps) {
  const status = calculateTeacherStatus(teacherSummary, totalStudents);
  const ratio = totalStudents / teacherSummary.total;
  const qualificationPercentage = (teacherSummary.qualified / teacherSummary.total) * 100;

  const getStatusDot = () => {
    if (status === Status.Green) return <span className="status-dot status-dot-green" />;
    if (status === Status.Amber) return <span className="status-dot status-dot-amber" />;
    return <span className="status-dot status-dot-red" />;
  };

  const subjectData = Object.entries(teacherSummary.bySubjectArea).map(([key, value]) => ({
    subject: key,
    count: value,
    label: subjectLabels[key] || key,
  }));

  const qualificationData = Object.entries(teacherSummary.byQualification).map(([key, value]) => ({
    qualification: key,
    count: value,
    label: qualificationLabels[key] || key,
  }));

  return (
    <Card className="dashboard-card border-2 border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusDot()}
            <CardTitle className="text-xl font-bold">Teacher Summary</CardTitle>
          </div>
          <Badge variant={getStatusBadgeVariant(status)} className="font-semibold">
            {getStatusLabel(status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-50/50 to-white border border-green-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Total Teachers
              </div>
              <div className="text-2xl font-bold text-green-700">{teacherSummary.total}</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-50/50 to-white border border-green-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Qualified
              </div>
              <div className="text-2xl font-bold text-green-700">{teacherSummary.qualified}</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-50/50 to-white border border-green-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Student:Teacher Ratio
              </div>
              <div className="text-2xl font-bold text-green-700">{ratio.toFixed(1)}:1</div>
            </div>
          </div>

          {/* Qualification Breakdown */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">By Qualification</h4>
            <div className="grid grid-cols-2 gap-2">
              {qualificationData.map((q) => (
                <div
                  key={q.qualification}
                  className="p-2 rounded-md bg-green-50/50 border border-green-200"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{q.label}</span>
                    <span className="text-sm font-bold text-green-700">{q.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Area Breakdown */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">By Subject Area</h4>
            <div className="grid grid-cols-2 gap-2">
              {subjectData
                .filter((s) => s.count > 0)
                .map((s) => (
                  <div
                    key={s.subject}
                    className="p-2 rounded-md bg-green-50/50 border border-green-200"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{s.label}</span>
                      <span className="text-sm font-bold text-green-700">{s.count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Qualification Percentage */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-green-100/50 to-green-50/50 border border-green-200">
            <div className="text-sm font-medium text-gray-900 mb-1">
              Qualification Rate
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{ width: `${qualificationPercentage}%` }}
                />
              </div>
              <span className="text-sm font-bold text-green-700">
                {qualificationPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
