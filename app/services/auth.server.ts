//import { sessionStorage } from "./session.server";
import dbClient from "~/db/db";
import { hashPassword, isValidPassword } from "~/lib/isValidPassword";
import { commitSession, destroySession, getSession } from "./session.server";
import { redirect } from "@remix-run/node";

export async function login({ username, password }: { username: string, password: string }) {
    const userWithPassword = await dbClient.user.findUnique({
        where: {
            username: username
        },
        include: {
            password: true,
        },
    });

    if (!userWithPassword || !userWithPassword.password) {
        return null;
    }


    const isSamePassword = await isValidPassword(password, userWithPassword.password.hash as string);
    const hasValidCredentials = (username === userWithPassword.username && isSamePassword);

    if (!hasValidCredentials) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _ignore, ...userWithoutPassword } = userWithPassword;

    return userWithoutPassword;
}

export async function signup({ username, password }: { username: string, password: string }) {
    const user = await dbClient.user.findUnique({
        where: {username}
    });

    if (user) {
        return null;
    }

    const newUser = await dbClient.user.create({data: {username}});
    const hashedPassword = await hashPassword(password);
    await dbClient.password.create({data: {userId: newUser.id, hash: hashedPassword}});
    const userWithPassword = await dbClient.user.findUnique({where: {username}, include:{password: true}});

    if (!userWithPassword || !userWithPassword.password) {
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password: _password, ...userWithoutPassword} = userWithPassword;
    return userWithoutPassword;
}

export const createUserSession = async ({ userId, redirectTo }: { userId: string, redirectTo: string }) => {
    const session = await getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await commitSession(session, { expires: new Date(Date.now() + 60 * 60 * 24 * 1000) })
        }
    })
}

export const requireUserId = async (request: Request, redirectTo: string) => {
    console.log(redirectTo, 'requireUserId');
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");
    if (!userId) {
        throw redirect(`/login`)
    }
    return userId;
}

export async function logout(request: Request) {
    const session = await getSession(request.headers.get("Cookie"));
      return redirect("/login", {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      });
}
