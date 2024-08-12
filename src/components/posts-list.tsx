"use client";

import { TagsMenu } from "@/components/tags-menu";
import { useInfinitePosts } from "@/hooks/use-posts";
import type { Session } from "next-auth";
import React from "react";
import Spinner from "./spinner";
import PostItem from "./post-item";
import { useSearchParams, useRouter } from "next/navigation";
import { TAGS } from "@/config";

enum SortType {
  DATE = "date",
  SCORE = "score",
}

enum SortDirection {
  DESC = "desc",
  ASC = "asc",
}

interface PostsListProps {
  userSession: Session | null;
}

const DEFAULT_SORT_TYPE = SortType.DATE;
const DEFAULT_SORT_DIRECTION = SortDirection.DESC;
const DEFAULT_TAGS: string[] = [];

const isValidSortType = (value: string): value is SortType =>
  Object.values(SortType).includes(value as SortType);

const isValidSortDirection = (value: string): value is SortDirection =>
  Object.values(SortDirection).includes(value as SortDirection);

const isValidTag = (tag: string) => {
  return TAGS.includes(tag);
};

export default function PostsList({ userSession }: PostsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selected, setSelected] = React.useState<string[]>(() => {
    const tagsParam = searchParams.get("tags");
    if (tagsParam) {
      const tags = tagsParam.split(",").filter(isValidTag);
      return tags.length > 0 ? tags : DEFAULT_TAGS;
    }
    return DEFAULT_TAGS;
  });

  const [sortType, setSortType] = React.useState<SortType>(() => {
    const sortByParam = searchParams.get("sortby");
    return sortByParam && isValidSortType(sortByParam)
      ? sortByParam
      : DEFAULT_SORT_TYPE;
  });

  const [sortDirection, setSortDirection] = React.useState<SortDirection>(
    () => {
      const directionParam = searchParams.get("direction");
      return directionParam && isValidSortDirection(directionParam)
        ? directionParam
        : DEFAULT_SORT_DIRECTION;
    }
  );

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    const validParams = ["tags", "sortby", "direction"];

    Array.from(params.keys()).forEach((key) => {
      if (!validParams.includes(key)) {
        params.delete(key);
        hasChanges = true;
      }
    });

    if (selected.length > 0) {
      const currentTags = params.get("tags")?.split(",") || [];
      if (selected.join(",") !== currentTags.join(",")) {
        params.set("tags", selected.join(","));
        hasChanges = true;
      }
    } else if (params.has("tags")) {
      params.delete("tags");
      hasChanges = true;
    }

    const currentSortType = params.get("sortby");
    if (!isValidSortType(currentSortType || "")) {
      params.set("sortby", sortType);
      hasChanges = true;
    }

    const currentDirection = params.get("direction");
    if (!isValidSortDirection(currentDirection || "")) {
      params.set("direction", sortDirection);
      hasChanges = true;
    }

    if (hasChanges) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }

    reloadPosts();
  }, [sortType, sortDirection, selected, searchParams, router]);

  const { posts, isLoading, isFetchingNextPage, ref, reloadPosts } =
    useInfinitePosts(sortType, sortDirection, selected);

  return (
    <div className="h-full w-[50vw]">
      <div className="h-fit w-fit mb-8 ml-3">Home</div>
      <div className="flex flex-col items-end justify-start mb-8">
        <button
          onClick={() => reloadPosts()}
          className="underline cursor-pointer"
        >
          refetch
        </button>
        <div className="flex justify-between gap-2">
          <span>sort by: </span>
          <button
            className="underline"
            onClick={() => {
              const newSortType =
                sortType === SortType.DATE ? SortType.SCORE : SortType.DATE;
              setSortType(newSortType);
            }}
          >
            {sortType}
          </button>
          <button
            className="underline"
            onClick={() => {
              const newSortDirection =
                sortDirection === SortDirection.DESC
                  ? SortDirection.ASC
                  : SortDirection.DESC;
              setSortDirection(newSortDirection);
            }}
          >
            {sortDirection}
          </button>
        </div>
        <div className="flex justify-between gap-2">
          <span>filter by:</span>
          <TagsMenu selected={selected} setSelected={setSelected} />
        </div>
      </div>

      <div className="flex flex-col col-span-2 group">
        {posts.length > 0 ? (
          <>
            {posts.map((post, index) => {
              if (index === posts.length - 1) {
                return (
                  <div key={index} ref={ref} className="border-b border-border">
                    <PostItem session={userSession} post={post} />
                  </div>
                );
              } else {
                return (
                  <PostItem session={userSession} key={index} post={post} />
                );
              }
            })}

            {isFetchingNextPage && (
              <div className="flex justify-center items-center h-[80px]">
                <Spinner className="w-6 h-6" />
              </div>
            )}
          </>
        ) : (
          !isLoading && (
            <li className="flex justify-center items-center h-[80px]">
              There are no posts yet.
            </li>
          )
        )}

        {isLoading && (
          <li className="flex justify-center items-center h-[80px]">
            <Spinner className="w-6 h-6" />
          </li>
        )}
      </div>
    </div>
  );
}
