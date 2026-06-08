export type ExpenseCategory = 'Travel' | 'Hotel' | 'Meals' | 'Taxi' | 'Other';
export type ReimbursementStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected';

export interface Expense {
  id: string;
  requestId: number;
  category: ExpenseCategory;
  amount: number;
  description: string;
  receiptUrl?: string;
  date: string;
}

export interface Reimbursement {
  id: string;
  category: string;
  totalTripBudget: number;
  requestId: number;
  requestedAmount: number;
  approvedAmount?: number;
  status: string;
  managerNotes?: string;
  date: string;
}
