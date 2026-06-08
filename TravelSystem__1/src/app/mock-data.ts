import { User } from './shared/models/user.model';
import { TravelRequest } from './shared/models/travel-request.model';

export const USERS: User[] = [
  {
    id: 1,
    name: 'John Employee',
    email: 'employee@travel.com',
    password: 'password123',
    role: 'employee',
    managerId: 3
  },
  {
    id: 2,
    name: 'Jane Staff',
    email: 'employee2@travel.com',
    password: 'password123',
    role: 'employee',
    managerId: 3
  },
  {
    id: 3,
    name: 'Sarah Manager',
    email: 'manager@travel.com',
    password: 'password123',
    role: 'manager'
  },
  {
    id: 4,
    name: 'Sarah Finance',
    email: 'finance@travel.com',
    password: 'password123',
    role: 'finance'
  }
];

export const TRAVEL_REQUESTS: TravelRequest[] = [
  {
    id: 101,
    userId: 1,
    title: 'Paris Client Visit',
    destination: 'Paris, France',
    purpose: 'Client Meeting & Contract Signing',
    startDate: '2026-05-10',
    endDate: '2026-05-15',
    estimatedBudget: 2500,
    status: 'Approved',
    managerApproved: true,
    financeApproved: true,
    managerId: 3,
    createdAt: '2026-05-01'
  },
  {
    id: 102,
    userId: 1,
    title: 'TechConf NYC',
    destination: 'New York, USA',
    purpose: 'Annual Tech Conference',
    startDate: '2026-06-20',
    endDate: '2026-06-25',
    estimatedBudget: 3200,
    status: 'Approved',
    managerApproved: true,
    financeApproved: true,
    managerId: 3,
    createdAt: '2026-05-05'
  },
  {
    id: 103,
    userId: 1,
    title: 'Tokyo Audit',
    destination: 'Tokyo, Japan',
    purpose: 'Branch Office Audit',
    startDate: '2026-08-05',
    endDate: '2026-08-12',
    estimatedBudget: 4000,
    status: 'Pending',
    managerApproved: false,
    financeApproved: false,
    managerId: 3,
    createdAt: '2026-05-10'
  }
];
