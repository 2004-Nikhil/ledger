import { useEffect, useCallback, useMemo } from "react";
import { useAppContainer } from "@/composition/AppProvider";
import { useInvestmentStore } from "../store/useInvestmentStore";
import { computePortfolioSummary } from "@/utils/investmentMath";
import type { CreateInvestmentRequest, UpdateCurrentValueRequest } from "../types";

export function useInvestments() {
  const { investmentService } = useAppContainer();

  const investments = useInvestmentStore((s) => s.investments);
  const isLoading = useInvestmentStore((s) => s.isLoading);
  const error = useInvestmentStore((s) => s.error);
  const load = useInvestmentStore((s) => s.load);
  const add = useInvestmentStore((s) => s.add);
  const updateValue = useInvestmentStore((s) => s.updateValue);

  useEffect(() => {
    load(investmentService);
  }, [investmentService, load]);

  const addInvestment = useCallback(
    (request: CreateInvestmentRequest) => add(investmentService, request),
    [investmentService, add]
  );

  const updateCurrentValue = useCallback(
    (request: UpdateCurrentValueRequest) => updateValue(investmentService, request),
    [investmentService, updateValue]
  );

  const portfolioSummary = useMemo(() => computePortfolioSummary(investments), [investments]);

  const refresh = useCallback(() => load(investmentService), [investmentService, load]);

  return { investments, portfolioSummary, isLoading, error, addInvestment, updateCurrentValue, refresh };
}
