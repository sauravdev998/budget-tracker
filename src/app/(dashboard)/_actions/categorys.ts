"use server";
import { prisma } from "@/lib/prisma";
import {
  createCategoresSchemaType,
  createCategoresSchema,
  deleteCategorySchemaType,
  deleteCategorySchema,
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

export async function DeleteCategory(form: deleteCategorySchemaType) {
  const parsesBody = deleteCategorySchema.safeParse(form);
  if (!parsesBody.success) {
    throw new Error("bed request");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }
  const category = prisma.category.delete({
    where: {
      name_userId_type: {
        name: parsesBody.data.name,
        type: parsesBody.data.type,
        userId: user.id,
      },
    },
  });
  return category;
}
