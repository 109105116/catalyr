import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { ExtendedPost } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRef, useEffect, useState } from "react";

export const useInfinitePosts = (
  sortBy: "date" | "score" = "date",
  order: "asc" | "desc" = "desc",
  tags?: string[]
) => {
  const fetchInfinitePosts = async ({
    pageParam = 1,
  }: {
    pageParam: number;
  }) => {
    const tagsQuery = tags && tags.length > 0 ? `&tags=${tags.join(",")}` : "";

    const query =
      `/api/posts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}&sortBy=${sortBy}&order=${order}` +
      tagsQuery;

    const { data } = await axios.get(query);
    return data as ExtendedPost[];
  };

  const queryClient = useQueryClient();
  const queryKey = ["posts", sortBy, order, tags];

  const { data, isLoading, fetchNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: queryKey,
      queryFn: fetchInfinitePosts,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === INFINITE_SCROLL_PAGINATION_RESULTS
          ? allPages.length + 1
          : undefined;
      },
      initialPageParam: 1,
    });

  const lastPostRef = useRef<HTMLElement>(null);

  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry]);

  const posts = data?.pages.flatMap((page) => page) ?? [];

  const reloadPosts = async () => {
    await queryClient.removeQueries({ queryKey });
    await refetch();
  };

  return {
    posts,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    ref,
    reloadPosts,
  } as const;
};
