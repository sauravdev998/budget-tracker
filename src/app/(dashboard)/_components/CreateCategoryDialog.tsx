"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  createCategoresSchema,
  createCategoresSchemaType,
} from "@/schema/categores";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleOff, CircleOffIcon, Loader2, PlusSquare } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateCategory } from "../_actions/categorys";
import { Category } from "@prisma/client";
import { toast } from "sonner";
import { CreateTransactionSchemaType } from "@/schema/transaction";
import { useTheme } from "next-themes";

interface Props {
  type: TransactionType;
  successCallback: (category: Category) => void;
}
function CreateCategoryDialog({ type, successCallback }: Props) {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const form = useForm<createCategoresSchemaType>({
    resolver: zodResolver(createCategoresSchema),
    defaultValues: {
      type,
    },
  });
  const { mutate, isPending } = useMutation({
    mutationFn: CreateCategory,
    onSuccess: async (data: Category) => {
      form.reset({
        icon: "",
        name: "",
        type: type,
      });
      toast.success(`Category ${data.name} create successfully 🎉`, {
        id: "create-category",
      });
      successCallback(data);
      await queryClient.invalidateQueries({
        queryKey: ["category"],
      });
      setOpen((prev) => !prev);
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: "create-category",
      });
    },
  });
  const onSubmit = useCallback(
    (value: createCategoresSchemaType) => {
      toast.loading("Createing Category...", {
        id: "create-category",
      });
      mutate(value);
    },
    [mutate],
  );
  const theme = useTheme();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant="ghost"
          role="dialog"
          className="text-muted-foreground flex w-full border-separate items-center justify-start rounded-none border-b p-3"
        >
          <PlusSquare className="mr-2 h-4 w-4" />
          Create new
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create
            <span
              className={cn(
                "m-1",
                type === "income" ? "text-emerald-500" : "text-rose-500",
              )}
            ></span>
          </DialogTitle>
          <DialogDescription>
            category are used to group you transactions
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category" {...field} />
                  </FormControl>
                  <FormDescription>
                    this is how your category will appeare in the app
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger>
                        <Button variant="outline" className="h-[100px] w-full">
                          {form.watch("icon") ? (
                            <div className="flex flex-col items-center gap-2">
                              <span role="img" className="text-5xl">
                                {field.value}
                              </span>
                              <p className="text-muted-foreground text-xs">
                                Click to change
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <CircleOffIcon
                                size={48}
                                className="h-[48px] w-[48px]"
                              />
                              <p className="text-muted-foreground text-xs">
                                Click to select
                              </p>
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full">
                        <Picker
                          data={data}
                          theme={theme.resolvedTheme}
                          onEmojiSelect={(emoji: { native: string }) => {
                            field.onChange(emoji.native);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>
                    this is how your category will appeare in the app
                  </FormDescription>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                form.reset();
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {!isPending && "Create"}
            {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default CreateCategoryDialog;
