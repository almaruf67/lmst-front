export type ApiUser = {
  id: number;
  name: string;
  email: string;
  user_type: string;
  phone: string | null;
  class_name: string | null;
  section: string | null;
  employee_code: string | null;
  subject_specialization: string | null;
  qualification: string | null;
  date_of_joining: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ManagedUser = {
  id: number;
  name: string;
  email: string;
  userType: string;
  phone: string | null;
  employeeCode: string | null;
  className: string | null;
  section: string | null;
  subjectSpecialization: string | null;
  qualification: string | null;
  dateOfJoining: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PaginatedMeta = {
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
};

export type PaginatedUsersResponse = {
  users?: ApiUser[];
  meta?: PaginatedMeta;
};
