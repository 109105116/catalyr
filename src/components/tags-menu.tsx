"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TAGS } from "@/config";

import React from "react";

interface TagsMenuProps {
  selected: string[];
  setSelected: (newData: string[]) => void;
}

const MAX_TAGS = 3;

export function TagsMenu({ selected, setSelected }: TagsMenuProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const tags = TAGS;

  return (
    <>
      {selected && (
        <>
          {selected.slice(0, MAX_TAGS).map((tag, index) => (
            <button
              key={index}
              onClick={() => setSelected(selected.filter((a) => a != tag))}
              className="hover:line-through"
            >
              {tag}
            </button>
          ))}
          {selected && selected.length > MAX_TAGS && (
            <Dialog>
              <DialogTrigger>...</DialogTrigger>
              <DialogContent className="p-5">
                <DialogHeader>
                  <DialogTitle className="font-normal">other tags</DialogTitle>
                  <ScrollArea className="max-h-30">
                    <div className="max-h-80">
                      {selected
                        .slice(MAX_TAGS, selected.length)
                        .map((tag, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              setSelected(selected.filter((a) => a != tag))
                            }
                            className="hover:line-through mt-1 mr-2 text-sm text-muted-foreground"
                          >
                            {tag}
                          </button>
                        ))}
                    </div>
                    <ScrollBar orientation="vertical" className="" />
                  </ScrollArea>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      <button className="underline" onClick={() => setOpen(true)}>
        add tags
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {tags.map((tag, index) => (
              <CommandItem
                key={index}
                disabled={selected?.includes(tag)}
                onSelect={(currentValue) => {
                  setSelected([...selected, currentValue]);
                  setOpen(false);
                }}
              >
                {tag}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
