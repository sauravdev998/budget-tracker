"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TransactionType } from "@/lib/types";
import { Category } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import CreateCategoryDialog from "./CreateCategoryDialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  type: TransactionType;
  onChange: (value: string) => void;
}

function CategoryPicker({ type, onChange }: Props) {
  const [Open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!value) return;
    onChange(value);
  }, [value]);
  const categoryQuery = useQuery({
    queryKey: ["category", type],
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then((response) => response.json()),
  });
  const selectedCategory = categoryQuery.data?.find(
    (category: Category) => category.name === value,
  );
  const succesCallback = useCallback(
    (category: Category) => {
      setValue(category.name);
      setOpen((prv) => !prv);
    },
    [setValue, setOpen],
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={Open}
          className="justify-between"
        >
          {selectedCategory ? (
            <CategoryRow category={selectedCategory} />
          ) : (
            "Select category"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <CommandInput placeholder="search category..." />
          <CreateCategoryDialog type={type} successCallback={succesCallback} />
          <CommandEmpty>
            <p>Category not found</p>
            <p className="text-muted-foreground text-xs"></p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {categoryQuery.data &&
                categoryQuery.data.map((category: Category) => (
                  <CommandItem
                    key={category.name}
                    onSelect={(currentValue) => {
                      setValue(category.name);
                      setOpen((prv) => !prv);
                    }}
                  >
                    <CategoryRow category={category} />
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 opacity-0",
                        value === category.name && "opacity-100",
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CategoryPicker;

function CategoryRow({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-2">
      <span role="img">{category.icon}</span>
      <span>{category.name}</span>
    </div>
  );
}
