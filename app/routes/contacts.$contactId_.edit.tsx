import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {Form, useLoaderData, useNavigate, useNavigation} from "@remix-run/react";
import invariant from "tiny-invariant";
import { getContact, updateContact } from "~/data";
import { requireUserId } from "~/services/auth.server";

export const loader = async ({params, request}: LoaderFunctionArgs) => {
    await requireUserId(request, "/login");
    invariant(params.contactId, "Missing contactId param");
    const contact = await getContact(params.contactId);

    if (!contact) {
        throw new Response("Not Found", {status: 404});
    }
    return json({contact});
};

export const action = async ({
    params,
    request,
}: ActionFunctionArgs) => {
    invariant(params.contactId, "Missing contactId param");
    const formData = await request.formData();
    const updatedContact = Object.fromEntries(formData);
    await updateContact(params.contactId, updatedContact);
    return redirect(`/contacts/${params.contactId}`)
}

export default function EditContact() {
    const {contact} = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const navigate = useNavigate();

    const isLoading = navigation.state === "submitting" || navigation.state === "loading";

    return(
        <Form key={contact.id} id="contact-form" method="post">
            <p>
                <span>Name</span>
                <input
                    type="text"
                    name="first"
                    placeholder="First"
                    aria-label="First name"
                    defaultValue={contact.first}
                />

                <input
                    type="text"
                    name="last"
                    placeholder="Last"
                    aria-label="Last name"
                    defaultValue={contact.last}
                />
            </p>
            <label>
                <span>Twitter</span>
                <input
                    type="text"
                    name="twitter"
                    placeholder="@jack"
                    defaultValue={contact.twitter}
                />
            </label>
            <label>
                <span>Avatar URL</span>
                <img
                    src={contact.avatar}
                    alt="img-test"
                    width="40px"
                    style={{
                        borderRadius: '50%',
                        marginRight: '10px',
                        boxShadow: '0 0 5px blue',
                    }}
                    />
                <input
                    type="text"
                    name="avatar"
                    placeholder="https://example.com/avatar.jpg"
                    aria-label="Avatar URL"
                    defaultValue={contact.avatar}
                />
            </label>
            <label>
                <span>Notes</span>
                <textarea
                    name="notes"
                    rows={6}
                    defaultValue={contact.notes}
                />
            </label>
            <p>
                <button type="submit" disabled={isLoading}>{isLoading ? 'Saving' : 'Edit'}</button>
                <button type="button" onClick={() => navigate(-1)}>Cancel</button>
            </p>
        </Form>
    );
}
