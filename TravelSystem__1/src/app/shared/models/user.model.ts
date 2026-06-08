export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'employee' | 'manager' | 'finance' | 'admin';
  managerId?: number;
  managerName?: string;
  department?: string;
  avatar?: string;
  token?: string;
  isActive?: boolean;
  createdAt?: string;
}
