"use client";

import { GetTransactionHistoryResponseType } from "@/app/api/transaction-history/route";
import { dateToUtcDate } from "@/lib/helper";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { DataTableColumnHeader } from "@/components/dataTable/ColumnHeader";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DataTableFacetedFilter } from "@/components/dataTable/FacetedFilters";

interface Props {
  from: Date;
  to: Date;
}
type TransactionHistoryRow = GetTransactionHistoryResponseType[0];

const emptyData: any[] = [];

export const columns: ColumnDef<TransactionHistoryRow>[] = [
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader className="m-2" column={column} title="Category" />
    ),
    cell: ({ row }) => (
      <div className="flex gap-2 capitalize">
        {row.original.categoryIcon}{" "}
        <div className="capitalize">{row.original.category}</div>{" "}
      </div>
    ),
  },
  {
    accessorKey: "deccription",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="m-2"
        column={column}
        title="Disciption"
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.original.deccription} </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",

    cell: ({ row }) => {
      const date = new Date(row.original.date);
      const formatedDate = date.toLocaleDateString("default", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return <div className="text-muted-foreground">{formatedDate} </div>;
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader className="m-2" column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <div
        className={cn(
          "rounded-lg p-2 text-center capitalize",
          row.original.type === "income"
            ? "bg-emerald-500/10 text-emerald-500"
            : "bg-red-500/10 text-red-500",
        )}
      >
        {row.original.type}{" "}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader className="m-2" column={column} title="Amount" />
    ),
    cell: ({ row }) => (
      <p className="text-md rounded-lg bg-gray-500/5 p-2 text-center font-medium">
        {row.original.formattedAmount}
      </p>
    ),
  },
];

function TransactionTable({ from, to }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const histoy = useQuery<GetTransactionHistoryResponseType>({
    queryKey: ["transaction", "history", from, to],
    queryFn: () =>
      fetch(
        `api/transaction-history?from=${dateToUtcDate(from)}&to=${dateToUtcDate(to)}`,
      ).then((res) => res.json()),
  });

  const table = useReactTable({
    data: histoy.data || emptyData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const categorysOptions = useMemo(() => {
    const categorysMap = new Map<string, { value: string; label: string }>();
    histoy.data?.forEach((transaction) => {
      categorysMap.set(transaction.category, {
        value: transaction.category,
        label: `${transaction.categoryIcon} ${transaction.category}`,
      });
    });
    const uniqueCategorys = new Set(categorysMap);
    const temp = Array.from(uniqueCategorys);
    return temp.map((item) => {
      return { value: item[1].value, label: item[1].label };
    });
  }, [histoy.data]);
  return (
    <div className="w-full p-8">
      <div className="flex flex-wrap items-end justify-between gap-2 py-4">
        <div className="flex gap-2">
          {table.getColumn("category") && (
            <DataTableFacetedFilter
              title="Category"
              column={table.getColumn("category")}
              options={categorysOptions}
            />
          )}
        </div>
      </div>
      <SkeletonWrapper isLoading={histoy.isFetching}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </SkeletonWrapper>
    </div>
  );
}

export default TransactionTable;
