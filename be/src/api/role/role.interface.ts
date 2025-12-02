export interface IRole {
  id: string;
  name: string;
  type: number;
  isSuperAdmin?: boolean;
  createdBy?: string;
  status?: number;
  permissions?: {
    id: string;
    name: string;
  }[];
}
