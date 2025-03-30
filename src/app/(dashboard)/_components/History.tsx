"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFormatterForCurrency } from "@/lib/helper";
import { Period, TimeFrame } from "@/lib/types";
import { UserSettings } from "@prisma/client";
import { useCallback, useMemo, useState } from "react";
import HistoryPeriodSelector from "./HistoryPeriodSelector";
import { useQuery } from "@tanstack/react-query";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { GetHistoryDataResponseType } from "@/app/api/history-data/route";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import CountUp from "react-countup";

interface Props {
  userSettings: UserSettings;
}
function History({ userSettings }: Props) {
  const [timeframe, setTimeframe] = useState<TimeFrame>("month");
  const [period, setPeriod] = useState<Period>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  const formattor = useMemo(() => {
    return getFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  const historyDataQuery = useQuery<GetHistoryDataResponseType>({
    queryKey: ["overview", "history", timeframe, period],
    queryFn: () =>
      fetch(
        `/api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`,
      ).then((res) => res.json()),
  });
  const dataAvailable =
    historyDataQuery.data && historyDataQuery.data.length > 0;
  return (
    <div className="px-8">
      <h2 className="mt-12 text-3xl font-bold">History</h2>
      <Card className="col-span-12 mt-2 w-full">
        <CardHeader className="gap-2">
          <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
            <HistoryPeriodSelector
              period={period}
              setPeriod={setPeriod}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
            <div className="flex h-10 gap-2">
              <Badge
                variant="outline"
                className="flex items-center gap-2 text-sm"
              >
                <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
                Income
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-2 text-sm"
              >
                <div className="h-4 w-4 rounded-full bg-red-500"></div>
                Expence
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonWrapper isLoading={historyDataQuery.isFetching}>
            {dataAvailable && (
              <ResponsiveContainer width={"100%"} height={300}>
                <BarChart
                  height={300}
                  data={historyDataQuery.data}
                  barCategoryGap={5}
                >
                  <defs>
                    <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset={"0"}
                        stopColor="#10b981"
                        stopOpacity={"1"}
                      />
                      <stop
                        offset={"1"}
                        stopColor="#10b981"
                        stopOpacity={"0"}
                      />
                    </linearGradient>
                    <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset={"0"}
                        stopColor="#ef4444"
                        stopOpacity={"1"}
                      />
                      <stop
                        offset={"1"}
                        stopColor="#ef4444"
                        stopOpacity={"0"}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray={"5 5"}
                    strokeOpacity={0.2}
                    vertical={false}
                  />
                  <XAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    padding={{ left: 5, right: 5 }}
                    dataKey={(data) => {
                      const { year, month, day } = data;
                      const date = new Date(year, month, day + 1 || 1);
                      if (timeframe === "year") {
                        return date.toLocaleString("default", {
                          month: "long",
                        });
                      }
                      return date.toLocaleDateString("default", {
                        day: "2-digit",
                      });
                    }}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Bar
                    dataKey="income"
                    fontSize={12}
                    fill="url(#incomeBar)"
                    radius={4}
                    className="cursor-pointer"
                  />
                  <Bar
                    dataKey="expense"
                    fontSize={12}
                    fill="url(#expenseBar)"
                    radius={4}
                    className="cursor-pointer"
                  />
                  <Tooltip
                    cursor={{ opacity: 0.1 }}
                    content={(props) => (
                      <CustomTooltip formattor={formattor} {...props} />
                    )}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
            {!dataAvailable && (
              <Card className="bg-background flex h-[300px] flex-col items-center justify-center">
                No data for the selected period
                <p className="text-muted-foreground text-sm">
                  {" "}
                  Try selecting a different preiod or adding new transactions
                </p>
              </Card>
            )}
          </SkeletonWrapper>
        </CardContent>
      </Card>
    </div>
  );
}
export default History;

function CustomTooltip({ active, payload, formattor }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const { expense, income } = data;

  return (
    <div className="bg-background min-w-[300px] rounded border p-4">
      <TooltipRow
        formattor={formattor}
        label="Expence"
        value={expense}
        bgColor="bg-red-500"
        textColor="text-red-500"
      />
      <TooltipRow
        formattor={formattor}
        label="Income"
        value={income}
        bgColor="bg-emerald-500"
        textColor="text-emerald-500"
      />
      <TooltipRow
        formattor={formattor}
        label="Balence"
        value={income - expense}
        bgColor="bg-gray-100"
        textColor="text-foreground"
      />
    </div>
  );
}

function TooltipRow({
  bgColor,
  formattor,
  label,
  value,
  textColor,
}: {
  label: string;
  bgColor: string;
  textColor: string;
  value: number;
  formattor: Intl.NumberFormat;
}) {
  const formattingFn = useCallback(
    (value: number) => {
      return formattor.format(value);
    },
    [formattor],
  );
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-4 w-4 rounded-full", bgColor)} />
      <div className="flex w-full justify-between">
        <p className="text-muted-foreground text-sm">{label}</p>
        <div className={cn("text-sm font-black", textColor)}>
          <CountUp
            duration={0.5}
            preserveValue
            end={value}
            decimals={0}
            formattingFn={(value) => formattor.format(value)}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
