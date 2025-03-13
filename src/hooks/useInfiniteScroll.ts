import { useEffect, useRef } from "react";

/**
 * Hook to trigger a function when an element reaches the bottom of the viewport.
 * Used for infinite scroll.
 */
export function useInfiniteScroll(callback: () => void, isFetching: boolean) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!callback) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching) {
          callback();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [callback, isFetching]);

  return loadMoreRef;
}
