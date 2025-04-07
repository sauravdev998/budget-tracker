import { getFormatterForCurrency } from "@/lib/helper";
import { prisma } from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const { searchParams } = new URL(request.url);
  const to = searchParams.get("to");
  const from = searchParams.get("from");

  const queryParams = OverviewQuerySchema.safeParse({ to, from });
  if (!queryParams.success) {
    return Response.json(queryParams.error.message, { status: 400 });
  }

  const transactions = await getTransactionHistory(
    user.id,
    queryParams.data.to,
    queryParams.data.from,
  );
  return Response.json(transactions);
}

export type GetTransactionHistoryResponseType = Awaited<
  ReturnType<typeof getTransactionHistory>
>;

async function getTransactionHistory(id: string, to: Date, from: Date) {
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: id,
    },
  });
  if (!userSettings) {
    throw new Error("User Settings not found");
  }
  const formmator = getFormatterForCurrency(userSettings.currency);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: id,
      date: {
        gte: from,
        lte: to,
      },
    },
    orderBy: {
      date: "desc",
    },
  });
  return transactions.map((transaction) => ({
    ...transaction,
    formattedAmount: formmator.format(transaction.amount),
  }));
}
