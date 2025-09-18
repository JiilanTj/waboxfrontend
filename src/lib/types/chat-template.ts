export interface ChatTemplateVariable {
  key: string;
  label?: string;
  required?: boolean;
}

export interface ChatTemplate {
  id: number;
  name: string;
  commands: string; // e.g., "/greetings"
  content: string;
  variables?: ChatTemplateVariable[];
  isActive: boolean;
  createdBy?: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatTemplateListResponse {
  success: boolean;
  message: string;
  data: ChatTemplate[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface GetChatTemplateResponse {
  success: boolean;
  message: string;
  data: ChatTemplate;
}

export interface CreateChatTemplateRequest {
  name: string;
  content: string;
  commands: string; // include leading slash, e.g., "/greetings"
  variables?: ChatTemplateVariable[];
  isActive?: boolean;
}

export interface UpdateChatTemplateRequest {
  name?: string;
  content?: string;
  commands?: string;
  variables?: ChatTemplateVariable[];
  isActive?: boolean;
}

export interface UpsertChatTemplateResponse {
  success: boolean;
  message: string;
  data: ChatTemplate;
}

export interface DeleteChatTemplateResponse {
  success: boolean;
  message: string;
}