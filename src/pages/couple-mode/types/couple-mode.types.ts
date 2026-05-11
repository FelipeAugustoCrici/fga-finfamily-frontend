export type SplitType = 'equal' | 'proportional' | 'custom';

export interface CoupleModeParticipant {
  personId: string;
  proportion?: number;
  income?: number;
}

export interface CoupleModeConfig {
  id: string;
  familyId: string;
  isActive: boolean;
  splitType: SplitType;
  participants: CoupleModeParticipant[];
}

export interface ParticipantResult {
  personId: string;
  amountPaid: number;
  amountShouldPay: number;
  balance: number;
  proportion: number;
  configuredIncome: number;
  adjustmentAmount: number;
}

export interface AdjustmentSuggestion {
  fromPersonId: string;
  toPersonId: string;
  amount: number;
}

export interface ExpenseAdjustment {
  id: string;
  familyId: string;
  fromPersonId: string;
  toPersonId: string;
  amount: number;
  description: string;
  date: string;
  month: number;
  year: number;
}

export interface CoupleModeResult {
  period: { month: number; year: number };
  totalShared: number;
  splitType: SplitType;
  participants: ParticipantResult[];
  suggestions: AdjustmentSuggestion[];
  adjustments: ExpenseAdjustment[];
  totalFamilyIncome: number;
  incomeRequired: boolean;
}
