import Link from "next/link";
import { schools } from "@/lib/data";
import {
  calculateSchoolStatus,
  generateRiskFlags,
} from "@/lib/rules";
import { Status, RiskCategory } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const riskCategoryLabels: Record<RiskCategory, string> = {
  [RiskCategory.Infrastructure]: "Infrastructure",
  [RiskCategory.Water]: "Water",
  [RiskCategory.Power]: "Power",
  [RiskCategory.Overcrowding]: "Overcrowding",
  [RiskCategory.Services]: "Services",
  [RiskCategory.Facilities]: "Facilities",
};

export default function RisksPage() {
  const schoolsWithRisks = schools
    .map((school) => ({
      school,
      status: calculateSchoolStatus(school),
      riskFlags: generateRiskFlags(school),
    }))
    .filter(({ riskFlags }) =>
      riskFlags.some((flag) => flag.active && flag.severity === Status.Red)
    );

  const risksByCategory = schoolsWithRisks.reduce(
    (acc, { school, riskFlags }) => {
      riskFlags
        .filter((flag) => flag.active && flag.severity === Status.Red)
        .forEach((flag) => {
          if (!acc[flag.category]) {
            acc[flag.category] = [];
          }
          if (!acc[flag.category].some((s) => s.id === school.id)) {
            acc[flag.category].push(school);
          }
        });
      return acc;
    },
    {} as Record<RiskCategory, typeof schools>
  );

  const categories = Object.values(RiskCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50/50 to-green-100/30">
      <div className="container mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-1 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Risk & Alerts
            </h1>
          </div>
          <p className="text-lg text-muted-foreground ml-16">
            Schools with urgent (Red) risk flags requiring immediate attention
          </p>
        </div>

        {/* Summary Card */}
        {Object.keys(risksByCategory).length > 0 && (
          <Card className="dashboard-card mb-8 bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-red-900">
                Urgent Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {categories.map((category) => {
                  const count = (risksByCategory[category] || []).length;
                  if (count === 0) return null;
                  return (
                    <div key={category} className="text-center p-4 rounded-lg bg-white/80">
                      <div className="text-3xl font-bold text-red-600 mb-1">{count}</div>
                      <div className="text-sm font-medium text-red-800">
                        {riskCategoryLabels[category]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Categories */}
        <div className="space-y-10">
          {categories.map((category) => {
            const schoolsInCategory = risksByCategory[category] || [];

            if (schoolsInCategory.length === 0) {
              return null;
            }

            return (
              <div key={category}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-1 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      {riskCategoryLabels[category]}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground ml-4">
                    {schoolsInCategory.length} school
                    {schoolsInCategory.length !== 1 ? "s" : ""} with urgent{" "}
                    {riskCategoryLabels[category].toLowerCase()} issues
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {schoolsInCategory.map((school) => {
                    const schoolRisks = generateRiskFlags(school).filter(
                      (flag) =>
                        flag.active &&
                        flag.severity === Status.Red &&
                        flag.category === category
                    );

                    return (
                      <Link
                        key={school.id}
                        href={`/schools/${school.id}`}
                        className="block h-full group"
                      >
                        <Card className="dashboard-card border-l-4 border-l-red-500 bg-gradient-to-br from-white to-red-50/30 hover:shadow-xl hover:border-l-red-600 transition-all duration-300 h-full">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg font-bold text-gray-900 mb-1">
                                  {school.name}
                                </CardTitle>
                                <p className="text-sm font-medium text-muted-foreground">
                                  {school.state}
                                </p>
                              </div>
                              <Badge variant="destructive" className="font-semibold">
                                Urgent
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {schoolRisks.map((risk, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 p-2 rounded-md bg-red-50/50"
                                >
                                  <span className="status-dot status-dot-red mt-1.5 flex-shrink-0" />
                                  <p className="text-sm font-medium text-red-900 leading-relaxed">
                                    {risk.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>

                {category !== categories[categories.length - 1] && (
                  <Separator className="my-10 bg-green-200" />
                )}
              </div>
            );
          })}

          {Object.keys(risksByCategory).length === 0 && (
            <Card className="dashboard-card border-2 border-green-200">
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    All Clear
                  </p>
                  <p className="text-muted-foreground">
                    No schools with urgent risk flags at this time.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
