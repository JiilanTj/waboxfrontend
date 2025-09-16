export interface WhatsAppSession {
  id: string;
  whatsappNumberId: number;
  whatsappNumber: {
    id: number;
    name: string;
    phoneNumber: string;
    isActive: boolean;
    createdAt: string;
    phoneNumberFormatted?: string;
  };
  status: 'PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'PAIRING' | 'ERROR';
  qrCode: string | null;
  lastConnected: string | null;
  isActive: boolean;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionResponse {
  success: boolean;
  message: string;
  data: WhatsAppSession;
}

export interface GetSessionResponse {
  success: boolean;
  message: string;
  data: WhatsAppSession;
}

export interface GetQRCodeResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    whatsappNumber: {
      id: number;
      name: string;
      phoneNumber: string;
      isActive: boolean;
      createdAt: string;
    };
    qrCode: string;
    status: 'PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'PAIRING' | 'ERROR';
  };
}
