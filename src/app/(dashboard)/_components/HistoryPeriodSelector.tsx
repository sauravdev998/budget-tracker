import { GetHistoryPeriodsResponseType } from "@/app/api/history-period/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Period, TimeFrame } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface Props {
  period: Period;
  setPeriod: (period: Period) => void;
  timeframe: TimeFrame;
  setTimeframe: (timeframe: TimeFrame) => void;
}

function HistoryPeriodSelector({
  period,
  setPeriod,
  setTimeframe,
  timeframe,
}: Props) {
  const historyPeriod = useQuery<GetHistoryPeriodsResponseType>({
    queryKey: ["overview", "history", "periods"],
    queryFn: () => fetch("/api/history-period").then((res) => res.json()),
  });
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SkeletonWrapper isLoading={historyPeriod.isFetching} fullWidth={false}>
        <Tabs
          value={timeframe}
          onValueChange={(vale) => setTimeframe(vale as TimeFrame)}
        >
          <TabsList>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </SkeletonWrapper>
      <div className="flex flex-wrap items-center gap-2">
        <SkeletonWrapper isLoading={historyPeriod.isFetching} fullWidth={false}>
          <YearSelector
            period={period}
            setPeriod={setPeriod}
            years={historyPeriod.data || []}
          />
        </SkeletonWrapper>
        {timeframe === "month" && (
          <SkeletonWrapper
            isLoading={historyPeriod.isFetching}
            fullWidth={false}
          >
            <MonthSelector period={period} setPeriod={setPeriod} />
          </SkeletonWrapper>
        )}
      </div>
    </div>
  );
}
export default HistoryPeriodSelector;

interface YearSelectorProps {
  period: Period;
  setPeriod: (period: Period) => void;
  years: GetHistoryPeriodsResponseType;
}

function YearSelector({ period, setPeriod, years }: YearSelectorProps) {
  return (
    <Select
      value={period.year.toString()}
      onValueChange={(vale) =>
        setPeriod({ month: period.month, year: parseInt(vale) })
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface MonthSelectorProps {
  period: Period;
  setPeriod: (period: Period) => void;
}

function MonthSelector({ period, setPeriod }: MonthSelectorProps) {
  return (
    <Select
      value={period.month.toString()}
      onValueChange={(vale) =>
        setPeriod({ month: parseInt(vale), year: period.year })
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((month) => {
          const monthStr = new Date(period.year, month, 1).toLocaleString(
            "default",
            { month: "long" },
          );
          return (
            <SelectItem key={month} value={month.toString()}>
              {monthStr}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
