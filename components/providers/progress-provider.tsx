"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useActiveAccount } from "thirdweb/react";
import { getAllItems, getWeekItems } from "@/lib/progress";

interface ProgressContextValue {
  completedItems: Set<string>;
  isComplete: (itemId: string) => boolean;
  toggleComplete: (itemId: string) => void;
  markComplete: (itemId: string) => void;
  weekProgress: (weekId: number) => { completed: number; total: number };
  overallProgress: () => { completed: number; total: number };
  isLoading: boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

async function fetchSupabaseProgress(
  walletAddress: string
): Promise<string[]> {
  const res = await fetch(
    `/api/progress?wallet=${encodeURIComponent(walletAddress)}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.completions ?? [];
}

async function persistToSupabase(
  walletAddress: string,
  items: Set<string>
): Promise<void> {
  await fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: walletAddress,
      completions: [...items],
    }),
  });
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const isSyncing = useRef(false);
  const account = useActiveAccount();
  const walletAddress = account?.address;

  // On wallet connect: fetch from Supabase
  useEffect(() => {
    if (!walletAddress) {
      setCompletedItems(new Set());
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    isSyncing.current = true;
    setIsLoading(true);

    (async () => {
      try {
        const supabaseItems = await fetchSupabaseProgress(walletAddress);
        if (cancelled) return;
        setCompletedItems(new Set(supabaseItems));
      } catch (err) {
        console.error("Failed to fetch progress from Supabase:", err);
      } finally {
        if (!cancelled) {
          isSyncing.current = false;
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [walletAddress]);

  const toggleComplete = useCallback(
    (itemId: string) => {
      if (!walletAddress) return;
      setCompletedItems((prev) => {
        const next = new Set(prev);
        if (next.has(itemId)) {
          next.delete(itemId);
        } else {
          next.add(itemId);
        }
        persistToSupabase(walletAddress, next).catch((err) =>
          console.error("Failed to persist to Supabase:", err)
        );
        return next;
      });
    },
    [walletAddress]
  );

  const markComplete = useCallback(
    (itemId: string) => {
      if (!walletAddress) return;
      setCompletedItems((prev) => {
        if (prev.has(itemId)) return prev;
        const next = new Set(prev);
        next.add(itemId);
        persistToSupabase(walletAddress, next).catch((err) =>
          console.error("Failed to persist to Supabase:", err)
        );
        return next;
      });
    },
    [walletAddress]
  );

  const isComplete = useCallback(
    (itemId: string) => completedItems.has(itemId),
    [completedItems]
  );

  const weekProgress = useCallback(
    (weekId: number) => {
      const items = getWeekItems(weekId);
      const completed = items.filter((id) => completedItems.has(id)).length;
      return { completed, total: items.length };
    },
    [completedItems]
  );

  const overallProgress = useCallback(() => {
    const items = getAllItems();
    const completed = items.filter((id) => completedItems.has(id)).length;
    return { completed, total: items.length };
  }, [completedItems]);

  return (
    <ProgressContext.Provider
      value={{
        completedItems,
        isComplete,
        toggleComplete,
        markComplete,
        weekProgress,
        overallProgress,
        isLoading,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return ctx;
}
