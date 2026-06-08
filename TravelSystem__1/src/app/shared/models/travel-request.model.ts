export type TravelStatus = 'Pending' | 'Manager Approved' | 'Finance Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Closed';

export interface Itinerary {
  id?: number;
  date: string;
  location: string;
  activityDetails: string;
  hotelOrAccommodation?: string;
  travelRequestId?: number;
}

export interface TravelRequest {
  id: number;
  userId: number;
  title: string;
  destination: string;
  purpose: string;
  startDate: string;
  endDate: string;
  estimatedBudget: number;
  status: TravelStatus;
  managerApproved: boolean;
  financeApproved: boolean;
  managerId?: number;
  rejectionReason?: string;
  employeeName?: string;
  employeeId?: string;
  email?: string;
  department?: string;
  reportingManager?: string;
  fromLocation?: string;
  createdAt: string;
  expenseBreakdown?: {
    travel: number;
    hotel: number;
    meals: number;
    other: number;
  };
  itineraries?: Itinerary[];
  managerApprovedByName?: string;
  financeApprovedByName?: string;
  adminApprovedByName?: string;
  employeeDepartment?: string;
  isOverBudget?: boolean;
}
