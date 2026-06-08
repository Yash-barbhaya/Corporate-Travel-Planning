export interface EmployeeDashboardStats {
  totalRequests: number;
  approvedAmount: number;
  pendingRequests: number;
  rejectedRequests: number;
  expenseOverview: {
    travel: number;
    hotel: number;
    meals: number;
    other: number;
    total: number;
    travelPercentage: number;
    hotelPercentage: number;
    mealsPercentage: number;
    otherPercentage: number;
  };
}
