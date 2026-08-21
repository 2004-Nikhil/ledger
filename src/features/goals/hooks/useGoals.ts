import { useEffect, useCallback, useMemo } from "react";
import { useAppContainer } from "@/composition/AppProvider";
import { useGoalStore } from "../store/useGoalStore";
import { useAccountStore } from "@/features/accounts/store/useAccountStore";
import { computeGoalProgress } from "@/utils/goalMath";
import type { CreateGoalRequest, ContributeToGoalRequest } from "../types";

export function useGoals() {
  const { goalService, accountService } = useAppContainer();

  const goals = useGoalStore((s) => s.goals);
  const isLoading = useGoalStore((s) => s.isLoading);
  const error = useGoalStore((s) => s.error);
  const load = useGoalStore((s) => s.load);
  const add = useGoalStore((s) => s.add);
  const contribute = useGoalStore((s) => s.contribute);
  const loadAccounts = useAccountStore((s) => s.load);

  useEffect(() => {
    load(goalService);
  }, [goalService, load]);

  const addGoal = useCallback(
    (request: CreateGoalRequest) => add(goalService, request),
    [goalService, add]
  );

  const contributeToGoal = useCallback(
    async (request: ContributeToGoalRequest) => {
      await contribute(goalService, request);
      await loadAccounts(accountService);
    },
    [goalService, accountService, contribute, loadAccounts]
  );

  const progressByGoalId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeGoalProgress>>();
    for (const goal of goals) {
      map.set(goal.id, computeGoalProgress(goal));
    }
    return map;
  }, [goals]);

  const refresh = useCallback(() => load(goalService), [goalService, load]);

  return { goals, progressByGoalId, isLoading, error, addGoal, contributeToGoal, refresh };
}
