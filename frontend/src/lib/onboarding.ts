// lib/onboarding.ts

import { api } from "@/lib/api";
import {
  OnboardingRequest,
  OnboardingResponse,
} from "@/types/onboarding";

export const saveInterests = async (
  data: OnboardingRequest
): Promise<OnboardingResponse> => {
  return api<OnboardingResponse>("/api/v1/onboarding/interests", {
    method: "POST",
    body: JSON.stringify(data),
  });
};