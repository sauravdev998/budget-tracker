"use client";
import { GetBalanceStatsResponceType } from "@/app/api/stats/balance/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card } from "@/components/ui/card";
import { dateToUtcDate, getFormatterForCurrency } from "@/lib/helper";
import { UserSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { ReactNode, useCallback, useMemo } from "react";
import CountUp from "react-countup";

interface Props {
  userSettings: UserSettings;
  from: Date;
  to: Date;
}
function StateCard({ userSettings, from, to }: Props) {
  const StatsQuery = useQuery<GetBalanceStatsResponceType>({
    queryKey: ["overview", "stats", from, to],
    queryFn: async () => {
      const response = await fetch(
        `/api/stats/balance?from=${dateToUtcDate(from)}&to=${dateToUtcDate(to)}`
      );
      return response.json();
    },
  });
  const formatter = useMemo(() => {
    return getFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);
  const income = StatsQuery.data?.income || 0;
  const expense = StatsQuery.data?.expense || 0;
  const balence = income - expense;

  return (
    <div className="relative flex w-full flex-wrap gap-2 px-8 md:flex-nowrap">
      <SkeletonWrapper isLoading={StatsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={income}
          Title="Income"
          icon={
            <TrendingUp className="h-12 w-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10" />
          }
        />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={StatsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={expense}
          Title="Expense"
          icon={
            <TrendingDown className="h-12 w-12 items-center rounded-lg p-2 text-red-500 bg-red-400/10" />
          }
        />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={StatsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={balence}
          Title="Balence"
          icon={
            <Wallet className="h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10" />
          }
        />
      </SkeletonWrapper>
    </div>
  );
}
export default StateCard;

interface StatCardProps {
  formatter: Intl.NumberFormat;
  value: number;
  Title: string;
  icon: ReactNode;
}

function StatCard({ Title, formatter, icon, value }: StatCardProps) {
  const formatFn = useCallback(
    (value: number) => {
      return formatter.format(value);
    },
    [formatter]
  );
  return (
    <Card className="flex flex-row w-full items-center gap-2 px-2 py-4">
      {icon}
      <div className="flex flex-col gap-0">
        <p className="text-muted-foreground">{Title}</p>
        <CountUp
          preserveValue
          redraw={false}
          end={value}
          decimals={2}
          formattingFn={formatFn}
          className="text-2xl"
        />
      </div>
    </Card>
  );
}
