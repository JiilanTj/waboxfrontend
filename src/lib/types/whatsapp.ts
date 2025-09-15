export interface WhatsAppNumber {
  id: number;
  name: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
}

export interface WhatsAppPagination {
  currentPage: number;
  totalPages: number;
  totalNumbers: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface WhatsAppListResponse {
  whatsappNumbers: WhatsAppNumber[];
  pagination: WhatsAppPagination;
}

export interface CreateWhatsAppRequest {
  name: string;
  phoneNumber: string;
  isActive?: boolean;
}

export interface UpdateWhatsAppRequest {
  name?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface WhatsAppResponse {
  whatsappNumber: WhatsAppNumber;
}

export interface CreateWhatsAppResponse {
  message: string;
  whatsappNumber: WhatsAppNumber;
}

export interface WhatsAppDeleteResponse {
  message: string;
}

export interface WhatsAppToggleStatusResponse {
  message: string;
  whatsappNumber: WhatsAppNumber;
}

export interface WhatsAppFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
