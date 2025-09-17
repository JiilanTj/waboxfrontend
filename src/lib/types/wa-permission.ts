import { WhatsAppNumber } from './whatsapp';

export interface WAPermission {
  id: number;
  userId: number;
  whatsappNumberId: number;
  whatsappNumber: WhatsAppNumber;
  createdAt: string;
  updatedAt: string;
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
