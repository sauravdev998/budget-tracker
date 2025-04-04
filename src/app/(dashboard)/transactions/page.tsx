"use client";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays, startOfMonth } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

function TransactionPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  return (
    <div className="bg-card border-b">
      <div className="flex flex-wrap items-center justify-between gap-6 p-8">
        <div>
          <p className="text-3xl font-bold">Transactions History</p>
        </div>
        <DateRangePicker
          initialDateFrom={dateRange.from}
          initialDateTo={dateRange.to}
          showCompare={false}
          onUpdate={(value) => {
            const { from, to } = value.range;
            if (!from || !to) return;
            if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
              toast.error(
                `the selected date range is too big max allowd range is ${MAX_DATE_RANGE_DAYS} days`,
              );
              return;
            }
            setDateRange({ from, to });
          }}
        />
      </div>
    </div>
  );
}

export default TransactionPage;
