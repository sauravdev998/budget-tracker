import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CreateTransactionDailog from "./_components/CreateTransactionDialog";
import Overview from "./_components/Overview";
import History from "./_components/History";

async function page() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });
  if (!userSettings) {
    redirect("/wizard");
  }
  return (
    <div className="bg-background h-full">
      <div className="bg-card border-b">
        <div className="flex flex-wrap items-center justify-between gap-6 px-8 py-8">
          <p className="text-3xl font-black">Hello, {user.firstName}! 👋</p>
          <div className="flex items-center gap-3">
            <CreateTransactionDailog type="income">
              <Button
                variant="default"
                className="border border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white"
                role="dialog"
              >
                New income
              </Button>
            </CreateTransactionDailog>

            <CreateTransactionDailog type="expense">
              <Button
                variant="default"
                className="border border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white"
                role="dialog"
              >
                New expense
              </Button>
            </CreateTransactionDailog>
          </div>
        </div>
      </div>
      <Overview userSettings={userSettings} />
      <History userSettings={userSettings} />
    </div>
  );
}
export default page;
