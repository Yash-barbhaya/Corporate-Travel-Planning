export interface ReimbursementClaim {
  id: number;
  employeeName: string;
  tripId: number;
  category: string;
  amount: number;
  description: string;
  receiptUrl?: string;
  receiptFilePath?: string;
}

export interface ReimbursementApprovalDTO {
  reimbursementId: number;
  isApproved: boolean;
  rejectionReason?: string;
}
