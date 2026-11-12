export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "RA" | "PI" | "LAB_MANAGER" | "SAFETY_OFFICER";
  department: string;
  receiveLowStockAlerts: boolean;
  receiveExpiryAlerts: boolean;
  receiveRestockPRAlerts: boolean;
  active: boolean;
  createdAt: string;
}

export interface EmailDispatchLog {
  id: string;
  timestamp: string;
  recipientEmails: string[];
  recipientNames: string[];
  subject: string;
  bodyPreview: string;
  itemCount: number;
  triggerType: "LOW_STOCK" | "EXPIRY" | "RESTOCK_PR" | "CUSTOM";
}
