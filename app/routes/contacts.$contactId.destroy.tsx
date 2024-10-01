import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { deleteContact } from "~/data";
import { requireUserId } from "~/services/auth.server";

export const action = async ({params, request}: ActionFunctionArgs) => {
    await requireUserId(request, "/login");
    invariant(params.contactId, "Missing contactId param");
    await deleteContact(params.contactId);
    return redirect("/");
}
