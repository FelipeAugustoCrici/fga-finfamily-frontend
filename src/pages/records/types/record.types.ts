export type RecordKind = 'income' | 'expense';

export type RecordStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID';

export type RecordOrigin =
  | 'expenses'
  | 'salaries'
  | 'extras'
  | 'incomes'
  | 'budgets'
  | 'categories'
  | 'credit-cards'
  | 'goals';

export type RecordCategory = {
  id: string;
  name: string;
};

export type ExpensePayment = {
  id: string;
  expenseId: string;
  amount: number;
  paidAt: string;
  note?: string | null;
  remainingAfter: number;
  createdAt: string;
};

export type UnifiedRecord = {
  id: string;
  description: string;
  value: number;
  date: string;
  month?: number;
  year?: number;
  personId: string;
  type: RecordKind;
  originalType: RecordOrigin;
  category?: RecordCategory | null;
  categoryName?: string;
  recurringId?: string | null;
  sourceId?: string | null;
  status?: RecordStatus;
  paidAmount?: number;
  originExpenseId?: string | null;
  originMonth?: number | null;
  originYear?: number | null;
};

export interface Record {
  id: string;
  description: string;
  value: number;
  date: string;
  personId: string;
  type: RecordKind;
  categoryId?: string;
  category?: RecordCategory;
  familyId?: string;
  recurringId?: string;
  status?: RecordStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRecordDTO {
  description: string;
  value: number;
  date: string;
  personId: string;
  type: RecordKind;
  categoryId?: string;
  familyId?: string;
  recurringId?: string;
  status?: RecordStatus;
}

export interface UpdateRecordDTO {
  description?: string;
  value?: number;
  date?: string;
  personId?: string;
  type?: RecordKind;
  categoryId?: string;
  familyId?: string;
  status?: RecordStatus;
}
