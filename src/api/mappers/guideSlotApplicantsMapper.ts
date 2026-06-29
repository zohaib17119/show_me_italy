import type { GuideSlotApplicantsResponse } from '@/api/types';
import { mapSlotSummary, type SlotSummaryRow } from '@/api/mappers/slotSummaryMapper';
import { mapSlotApplicants, type SlotApplicantRow } from '@/api/mappers/slotApplicantMapper';

export interface GuideSlotApplicantsResult {
  slotSummary: SlotSummaryRow | null;
  applicants: SlotApplicantRow[];
}

export function mapGuideSlotApplicantsResponse(
  payload: GuideSlotApplicantsResponse | null | undefined,
): GuideSlotApplicantsResult {
  if (!payload) {
    return { slotSummary: null, applicants: [] };
  }

  return {
    slotSummary: mapSlotSummary(payload.slotSummary),
    applicants: mapSlotApplicants(payload.applicants ?? []),
  };
}
