export type TourSlotFieldErrors = Partial<Record<string, string>>;

export interface SingleTourSlotValidationInput {
  tourTypeId: number;
  languageId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  meetingPoint: string;
  guestCount: number;
}

export interface BulkTourSlotValidationInput {
  tourTypeId: number;
  languageId: number;
  fromDate: string;
  toDate: string;
  startTime: string;
  endTime: string;
  meetingPoint: string;
  guestCount: number;
  selectedDaysCount: number;
  previewSlotCount: number;
}

function validateCommonTourFields(
  values: Pick<
    SingleTourSlotValidationInput,
    'tourTypeId' | 'languageId' | 'startTime' | 'endTime' | 'meetingPoint' | 'guestCount'
  >,
): TourSlotFieldErrors {
  const errors: TourSlotFieldErrors = {};

  if (!values.tourTypeId) {
    errors.tourTypeId = 'Tour type is required';
  }
  if (!values.languageId) {
    errors.languageId = 'Language is required';
  }
  if (!values.startTime.trim()) {
    errors.startTime = 'Start time is required';
  }
  if (!values.endTime.trim()) {
    errors.endTime = 'End time is required';
  }
  if (!values.meetingPoint.trim()) {
    errors.meetingPoint = 'Meeting point is required';
  }
  if (!values.guestCount || values.guestCount <= 0) {
    errors.guestCount = 'Group size is required';
  }

  return errors;
}

export function validateSingleTourSlot(
  values: SingleTourSlotValidationInput,
): TourSlotFieldErrors {
  const errors = validateCommonTourFields(values);

  if (!values.slotDate.trim()) {
    errors.slotDate = 'Date is required';
  }

  return errors;
}

export function validateBulkTourSlots(
  values: BulkTourSlotValidationInput,
): TourSlotFieldErrors {
  const errors = validateCommonTourFields(values);

  if (!values.fromDate.trim()) {
    errors.fromDate = 'From date is required';
  }
  if (!values.toDate.trim()) {
    errors.toDate = 'To date is required';
  }

  if (values.fromDate.trim() && values.toDate.trim()) {
    const from = new Date(values.fromDate);
    const to = new Date(values.toDate);
    if (Number.isNaN(from.getTime())) {
      errors.fromDate = 'From date is invalid';
    } else if (Number.isNaN(to.getTime())) {
      errors.toDate = 'To date is invalid';
    } else if (from > to) {
      errors.toDate = 'To date must be on or after from date';
    }
  }

  if (values.selectedDaysCount === 0) {
    errors.selectedDays = 'Select at least one day of the week';
  }

  if (
    values.previewSlotCount === 0 &&
    !errors.fromDate &&
    !errors.toDate &&
    !errors.startTime &&
    !errors.endTime &&
    !errors.selectedDays
  ) {
    errors.previewSlots = 'No slots match your date range and selected days';
  }

  return errors;
}

export function hasFieldErrors(errors: TourSlotFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
