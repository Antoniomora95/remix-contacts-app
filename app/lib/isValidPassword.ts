export async function isValidPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await hashPassword(password) === hashedPassword;
}

export async function hashPassword(password: string): Promise<string> {
    const arrayBuffer = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(password));
    const hashedPassword = Buffer.from(arrayBuffer).toString("base64");

    return hashedPassword;
}
