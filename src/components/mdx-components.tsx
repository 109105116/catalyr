import React from "react";
import { MDXRemoteProps } from "next-mdx-remote/rsc";
import { cn } from "@/lib/utils";
import Image from "./ui/mdx-image";

interface ComponentWithClassNameProps {
  className?: string;
  [key: string]: any;
}

const components: MDXRemoteProps["components"] = {
  h1: ({ className, ...props }: ComponentWithClassNameProps) => (
    <h1
      className={cn(
        "mt-2 scroll-m-20 text-4xl font-bold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: ComponentWithClassNameProps) => (
    <h2
      className={cn(
        "mt-10 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: ComponentWithClassNameProps) => (
    <h3
      className={cn(
        "mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: ComponentWithClassNameProps) => (
    <h4
      className={cn(
        "mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }: ComponentWithClassNameProps) => (
    <h5
      className={cn(
        "mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }: ComponentWithClassNameProps) => (
    <h6
      className={cn(
        "mt-8 scroll-m-20 text-base font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }: ComponentWithClassNameProps) => (
    <a
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }: ComponentWithClassNameProps) => (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }: ComponentWithClassNameProps) => (
    <ul
      className={cn(
        "my-3 ml-6 list-disc marker:text-muted-foreground",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: ComponentWithClassNameProps) => (
    <ol
      className={cn(
        "my-3 ml-6 list-decimal marker:text-muted-foreground",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: ComponentWithClassNameProps) => {
    const { children } = props;
    if (typeof children === "string" && children.startsWith("[ ] ")) {
      return (
        <li className={cn("flex items-center space-x-3", className)}>
          <input type="checkbox" disabled />
          <span>{children.slice(4)}</span>
        </li>
      );
    }
    if (typeof children === "string" && children.startsWith("[x] ")) {
      return (
        <li className={cn("flex items-center space-x-3", className)}>
          <input type="checkbox" checked disabled />
          <span>{children.slice(4)}</span>
        </li>
      );
    }
    return <li className={cn("mt-2", className)} {...props} />;
  },
  blockquote: ({ className, ...props }: ComponentWithClassNameProps) => (
    <blockquote
      className={cn(
        "mt-6 border-l-2 border-accent pl-6 italic [&>*]:text-muted-foreground",
        className
      )}
      {...props}
    />
  ),
  hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-4 md:my-8 border-border" {...props} />
  ),
  table: ({
    className,
    ...props
  }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn("w-full", className)} {...props} />
    </div>
  ),
  tr: ({
    className,
    ...props
  }: React.TableHTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className={cn("m-0 border-t border-border p-0 even:bg-muted", className)}
      {...props}
    />
  ),
  th: ({
    className,
    ...props
  }: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
    <th
      className={cn(
        "border border-border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),
  td: ({
    className,
    ...props
  }: React.TdHTMLAttributes<HTMLTableDataCellElement>) => (
    <td
      className={cn(
        "border border-border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className={cn("p-4 rounded-lg", className)} {...props} />
  ),
  code: ({ className, ...props }: ComponentWithClassNameProps) => (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className
      )}
      {...props}
    />
  ),
  em: ({ className, ...props }: ComponentWithClassNameProps) => (
    <em className={cn("italic", className)} {...props} />
  ),
  sup: ({ className, ...props }: ComponentWithClassNameProps) => (
    <sup
      className={cn("text-sm font-medium leading-tight", className)}
      {...props}
    />
  ),
  "footnote-ref": ({ className, ...props }: ComponentWithClassNameProps) => (
    <sup className={cn("text-sm font-medium leading-tight", className)}>
      <a {...props} className="no-underline" />
    </sup>
  ),
  "footnote-def": ({ className, ...props }: ComponentWithClassNameProps) => (
    <div
      className={cn("text-sm mt-6 pt-4 border-t border-gray-200", className)}
      {...props}
    />
  ),
  img: Image,
  // Callout,
  // Card: MdxCard,
};

export default components;
