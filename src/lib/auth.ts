// Simple mock auth stored in localStorage. Purely client-side.
export type Role = "rh" | "candidato";

export type Session = {
  role: Role;
  name: string;
  loggedAt: string;
};

const KEY = "skyhire.session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function login(role: Role, name: string): Session {
  const s: Session = { role, name: name.trim() || (role === "rh" ? "Recrutador" : "Candidato"), loggedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

export function logout() {
  localStorage.removeItem(KEY);
}
