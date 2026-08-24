export type Role = "therapist" | "patient";

export type Profile = {
  id: string;
  role: Role;
  full_name: string;
  phone: string | null;
  street: string | null;
  zip: string | null;
  city: string | null;
  birth_date: string | null;
  notes: string | null;
  created_at: string;
};

export type AppointmentRequest = {
  id: string;
  patient_id: string;
  preferred_times: string;
  message: string | null;
  status: "pending" | "confirmed" | "declined" | "proposed";
  proposal: string | null;
  created_at: string;
  handled_at: string | null;
  profiles?: Profile;
};

export type Appointment = {
  id: string;
  patient_id: string;
  starts_at: string;
  duration_min: number;
  address: string | null;
  travel_note: string | null;
  status: "geplant" | "abgeschlossen" | "abgesagt";
  notes: string | null;
  /** Zeitpunkt, an dem der Therapeut die Fahrt gestartet hat */
  enroute_at: string | null;
  /** Beim Start geschätzte Fahrzeit in Minuten */
  eta_minutes: number | null;
  /** Zeitpunkt der Ankunft beim Patienten */
  arrived_at: string | null;
  profiles?: Profile;
};

/** Verbleibende Minuten bis zur Ankunft (0, wenn abgelaufen). */
export function restMinuten(enrouteAt: string, etaMinutes: number, jetzt = Date.now()) {
  const ziel = new Date(enrouteAt).getTime() + etaMinutes * 60_000;
  return Math.max(0, Math.ceil((ziel - jetzt) / 60_000));
}

/** Fortschritt der Anfahrt zwischen 0 und 1. */
export function fahrtFortschritt(enrouteAt: string, etaMinutes: number, jetzt = Date.now()) {
  const start = new Date(enrouteAt).getTime();
  const gesamt = etaMinutes * 60_000;
  if (gesamt <= 0) return 1;
  return Math.min(1, Math.max(0, (jetzt - start) / gesamt));
}

export type Exercise = {
  id: string;
  title: string;
  description: string | null;
  media_url: string | null;
  media_type: "image" | "video" | null;
  category: string | null;
};

export type TrainingPlan = {
  id: string;
  patient_id: string;
  title: string;
  notes: string | null;
  is_active: boolean;
  plan_items?: PlanItem[];
};

export type PlanItem = {
  id: string;
  plan_id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  frequency: string | null;
  instructions: string | null;
  position: number;
  exercises?: Exercise;
};

export type PlanFeedback = {
  id: string;
  plan_item_id: string;
  patient_id: string;
  on_date: string;
  completed: boolean;
  pain_level: number | null;
  note: string | null;
};

export type PatientDocument = {
  id: string;
  patient_id: string;
  request_id: string | null;
  file_path: string;
  file_name: string;
  content_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export type Message = {
  id: string;
  patient_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso)}, ${formatTime(iso)} Uhr`;
}
