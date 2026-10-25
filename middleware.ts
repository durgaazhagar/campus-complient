import { NextResponse, type NextRequest } from "next/server";

async function getAuthenticatedRole(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const storageKey = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;
  const sessionCookie = request.cookies.get(storageKey)?.value;

  if (!sessionCookie) return null;

  let accessToken: string | undefined;
  try {
    const session = JSON.parse(decodeURIComponent(sessionCookie));
    accessToken = session?.access_token;
  } catch {
    return null;
  }

  if (!accessToken) return null;

  const response = await fetch(new URL("/auth/v1/user", supabaseUrl), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const user = (await response.json()) as {
    app_metadata?: { role?: unknown };
  };
  return user.app_metadata?.role;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const role = await getAuthenticatedRole(request);

  if (role !== "admin") {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
