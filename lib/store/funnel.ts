"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BureauProfile } from "@/lib/api/bureau";
import type { EligibilityAnswers, Offer, UnmatchedOffer } from "@/lib/api/offers";

type BasicDetails = {
  gender: "M" | "F" | "O";
  email: string;
  dob: string;
  pincode: string;
  panMasked: string;
};

type CachedOffers = {
  matched: Offer[];
  unmatched: UnmatchedOffer[];
};

type FunnelState = {
  phone?: string;
  phoneVerifiedAt?: number;
  authToken?: string;
  bureau?: BureauProfile;
  basicDetails?: BasicDetails;
  eligibility?: EligibilityAnswers;
  cachedOffers?: CachedOffers;
  selectedLenderId?: string;
};

type FunnelActions = {
  setPhone: (phone: string) => void;
  setAuthToken: (token: string) => void;
  setBureau: (bureau: BureauProfile) => void;
  setBasicDetails: (details: BasicDetails) => void;
  setEligibility: (eligibility: EligibilityAnswers) => void;
  setCachedOffers: (offers: CachedOffers) => void;
  setSelectedLender: (lenderId: string) => void;
  /** Clear stored eligibility + offers so the popup re-prompts the user. */
  editEligibility: () => void;
  reset: () => void;
};

const emptyState: FunnelState = {
  phone: undefined,
  phoneVerifiedAt: undefined,
  authToken: undefined,
  bureau: undefined,
  basicDetails: undefined,
  eligibility: undefined,
  cachedOffers: undefined,
  selectedLenderId: undefined,
};

export const useFunnelStore = create<FunnelState & FunnelActions>()(
  persist(
    (set) => ({
      setPhone: (phone) => set({ phone, phoneVerifiedAt: Date.now() }),
      setAuthToken: (authToken) => set({ authToken }),
      setBureau: (bureau) => set({ bureau }),
      setBasicDetails: (basicDetails) => set({ basicDetails }),
      setEligibility: (eligibility) => set({ eligibility }),
      setCachedOffers: (cachedOffers) => set({ cachedOffers }),
      setSelectedLender: (selectedLenderId) => set({ selectedLenderId }),
      editEligibility: () => set({ eligibility: undefined, cachedOffers: undefined }),
      reset: () => {
        set(emptyState);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("tm-funnel");
        }
      },
    }),
    {
      name: "tm-funnel",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
