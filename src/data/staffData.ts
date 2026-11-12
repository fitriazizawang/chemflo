import { StaffMember, EmailDispatchLog } from "../types/staff";

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: "staff-001",
    name: "Mohd Fitri",
    email: "mfitri@lgm.gov.my",
    role: "LAB_MANAGER",
    department: "Unit Pengurusan Makmal & Penyelidikan R&D",
    receiveLowStockAlerts: true,
    receiveExpiryAlerts: true,
    receiveRestockPRAlerts: true,
    active: true,
    createdAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "staff-002",
    name: "Nurul Izzah",
    email: "nurul.izzah@chemlab.gov.my",
    role: "RA",
    department: "Makmal Biologi Molekular & Biokimia",
    receiveLowStockAlerts: true,
    receiveExpiryAlerts: true,
    receiveRestockPRAlerts: false,
    active: true,
    createdAt: "2026-02-01T09:00:00.000Z",
  },
  {
    id: "staff-003",
    name: "Dr. Siti Farhana",
    email: "dr.farhana@chemlab.gov.my",
    role: "PI",
    department: "Ketua Projek Geran FRGS & Kimia Analitikal",
    receiveLowStockAlerts: false,
    receiveExpiryAlerts: true,
    receiveRestockPRAlerts: true,
    active: true,
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "staff-004",
    name: "Farid Kamaruddin",
    email: "farid.k@chemlab.gov.my",
    role: "RA",
    department: "Makmal Sintesis Bahan Kimia & Polimer",
    receiveLowStockAlerts: true,
    receiveExpiryAlerts: false,
    receiveRestockPRAlerts: false,
    active: true,
    createdAt: "2026-03-01T08:30:00.000Z",
  },
];

const STAFF_KEY = "chemlab_staff_members_v1";
const EMAIL_LOGS_KEY = "chemlab_email_dispatch_logs_v1";

export function loadStaffMembers(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    if (!raw) {
      localStorage.setItem(STAFF_KEY, JSON.stringify(INITIAL_STAFF));
      return INITIAL_STAFF;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading staff from localStorage:", err);
    return INITIAL_STAFF;
  }
}

export function saveStaffMembers(staff: StaffMember[]): void {
  try {
    localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
  } catch (err) {
    console.error("Error saving staff to localStorage:", err);
  }
}

export function loadEmailLogs(): EmailDispatchLog[] {
  try {
    const raw = localStorage.getItem(EMAIL_LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading email logs from localStorage:", err);
    return [];
  }
}

export function recordEmailDispatch(log: EmailDispatchLog): EmailDispatchLog[] {
  const logs = loadEmailLogs();
  const updated = [log, ...logs];
  try {
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Error saving email logs:", err);
  }
  return updated;
}
