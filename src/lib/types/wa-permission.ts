import { WhatsAppNumber } from './whatsapp';

export interface WAPermission {
  id: number | null;
  userId: number;
  whatsappNumberId: number;
  whatsappNumber: WhatsAppNumber;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateWAPermissionRequest {
  userId: number;
  whatsappNumberId: number;
}

export interface CreateWAPermissionResponse {
  success: boolean;
  message: string;
  data: WAPermission;
}

export interface WAPermissionListResponse {
  success: boolean;
  message: string;
  data: WAPermission[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface MyWAPermissionListResponse {
  success: boolean;
  message: string;
  data: WAPermission[];
}

export interface WAPermissionByUserResponse {
  success: boolean;
  message: string;
  data: WAPermission[];
}

export interface DeleteWAPermissionResponse {
  success: boolean;
  message: string;
  data: WAPermission;
}
