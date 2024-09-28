import { createCookieSessionStorage } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
    throw new Error("session secret is required");
}

export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "_session",
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        secrets: [sessionSecret],
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
});

export const {getSession, commitSession, destroySession} = sessionStorage;
