"use server";
import { prisma } from "@/lib/prisma";
import {
  createCategoresSchemaType,
  createCategoresSchema,
} from "@/schema/categores";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateCategory(form: createCategoresSchemaType) {
  const parsesBody = createCategoresSchema.safeParse(form);
  if (!parsesBody.success) {
    throw new Error("bed request");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { icon, name, type } = parsesBody.data;

  return await prisma.category.create({
    data: {
      icon,
      name,
      type,
      userId: user.id,
    },
  });
}
