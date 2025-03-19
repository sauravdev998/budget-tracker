import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  let usersSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!usersSettings) {
    usersSettings = await prisma.userSettings.create({
      data: {
        currency: "INR",
        userId: user.id,
      },
    });
  }

  // revalidate the page that uses the currency
  revalidatePath("/");
  return Response.json(usersSettings);
}
