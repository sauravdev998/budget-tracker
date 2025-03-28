"use client";
import { GetCategoriesStatsResponceType } from "@/app/api/stats/categories/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dateToUtcDate, getFormatterForCurrency } from "@/lib/helper";
import { TransactionType } from "@/lib/types";
import { UserSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface Props {
  userSettings: UserSettings;
  from: Date;
  to: Date;
}
function CategoriesStats({ from, to, userSettings }: Props) {
  const statsQuery = useQuery<GetCategoriesStatsResponceType>({
    queryKey: ["overview", "stats", "categores", from, to],
    queryFn: () =>
      fetch(
        `/api/stats/categories?from=${dateToUtcDate(from)}&to=${dateToUtcDate(to)}`,
      ).then((res) => res.json()),
  });
  const formatter = useMemo(() => {
    return getFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);
  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          type="income"
          data={statsQuery.data || []}
        />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          type="expense"
          data={statsQuery.data || []}
        />
      </SkeletonWrapper>
    </div>
  );
}
export default CategoriesStats;

interface CategoriesCardProps {
  formatter: Intl.NumberFormat;
  type: TransactionType;
  data: GetCategoriesStatsResponceType;
}

function CategoriesCard({ data, formatter, type }: CategoriesCardProps) {
  const filteredData = data.filter((e) => e.type === type);
  const total = filteredData.reduce(
    (acc, el) => acc + (el._sum?.amount || 0),
    0,
  );
  return (
    <Card className="col-span-6 h-80 w-full">
      <CardHeader>
        <CardTitle className="text-muted-foreground grid grid-flow-row justify-between gap-2 md:grid-flow-col">
          {type === "income" ? "Income" : "Expense"} by categores
        </CardTitle>
      </CardHeader>
      <div className="flex items-center justify-center gap-2">
        {filteredData.length === 0 && (
          <div className="flex h-60 w-full flex-col items-center justify-center">
            No data for the selected period
            <p className="text-muted-foreground text-sm">
              try selecting a deffernt priod or adding new{" "}
              {type === "expense" ? "expense" : "income"}
            </p>
          </div>
        )}
        {filteredData.length > 0 && (
          <ScrollArea className="h-60 w-full px-4">
            <div className="flex w-full flex-col gap-4 p-4">
              {filteredData.map((item) => {
                const amount = item._sum.amount || 0;
                const percentage = (amount * 100) / (total || amount);
                return (
                  <div key={item.category} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-400">
                        {item.categoryIcon} {item.category}
                        <span className="text-muted-foreground ml-2 text-xs">
                          ({percentage.toFixed(0)}%)
                        </span>
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatter.format(amount)}
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      indicator={
                        type === "income" ? "bg-emerald-500" : "bg-red-500"
                      }
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}
