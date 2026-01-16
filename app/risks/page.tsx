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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Risk & Alerts
        </h1>
        <p className="text-muted-foreground">
          Schools with urgent (Red) risk flags requiring immediate attention
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => {
          const schoolsInCategory = risksByCategory[category] || [];

          if (schoolsInCategory.length === 0) {
            return null;
          }

          return (
            <div key={category}>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  {riskCategoryLabels[category]}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {schoolsInCategory.length} school
                  {schoolsInCategory.length !== 1 ? "s" : ""} with urgent{" "}
                  {riskCategoryLabels[category].toLowerCase()} issues
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                      className="block h-full"
                    >
                      <Card className="border-l-4 border-l-red-500 cursor-pointer hover:bg-muted/50 transition-colors h-full">
                        <CardHeader>
                          <CardTitle className="text-base">
                            {school.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {school.state}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {schoolRisks.map((risk, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-muted-foreground"
                              >
                                {risk.description}
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
                <Separator className="my-8" />
              )}
            </div>
          );
        })}

        {Object.keys(risksByCategory).length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No schools with urgent risk flags at this time.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
