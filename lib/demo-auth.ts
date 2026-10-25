export type DemoRole = "student" | "admin";

export const DEMO_ACCOUNTS = {
  student: {
    email: "student@collegefix.test",
    password: "student123",
    role: "student" as const,
  },
  admin: {
    email: "admin@collegefix.test",
    password: "admin123",
    role: "admin" as const,
  },
} as const;

const DEMO_SESSION_KEY = "collegefix-demo-session";

export function resolveDemoAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  return Object.values(DEMO_ACCOUNTS).find(
    (account) =>
      account.email.toLowerCase() === normalizedEmail &&
      account.password === normalizedPassword,
  );
}

export function getDemoSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(DEMO_SESSION_KEY);
    if (!rawSession) {
      return null;
    }

    const parsed = JSON.parse(rawSession) as {
      role?: DemoRole;
      userId?: string;
    };

    if (!parsed.role) {
      return null;
    }

    return {
      role: parsed.role,
      userId: parsed.userId ?? `${parsed.role}-demo-user`,
    };
  } catch {
    return null;
  }
}

export function setDemoSession(role: DemoRole) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    DEMO_SESSION_KEY,
    JSON.stringify({
      role,
      userId: `${role}-demo-user`,
    }),
  );
}

export function clearDemoSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DEMO_SESSION_KEY);
}
