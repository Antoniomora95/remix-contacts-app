import { json, redirect } from '@remix-run/node';
import { FormEvent, useEffect, type FunctionComponent } from "react";
import {
    Form,
    NavLink,
    Outlet,
    useLoaderData,
    useNavigation,
    useSubmit
} from "@remix-run/react";
import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { ContactRecord, createEmptyContact, getContacts } from '~/data';
import { Logout } from '~/components/logout';
import { requireUserId } from '~/services/auth.server';

export const action = async () => {
    const contact = await createEmptyContact();
    return redirect(`/contacts/${contact.id}/edit`)
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
    await requireUserId(args.request, "/login");
    const url = new URL(args.request.url);
    const query = url.searchParams.get("q");
    const contacts = await getContacts(query);
    return json({ contacts, query });
}

export default function Contacts() {
    const {contacts, query} = useLoaderData<typeof loader>();
    const navigation = useNavigation();

    console.log(navigation.state, 'state navigation');
    // programatically execute a form submission
    const submit = useSubmit();

    /*
    When nothing is happening, navigation.location will be undefined,
    but when the user navigates it will be populated with the next location while data loads.
    Then we check if they're searching with location.search.
     */

    const searching = new URLSearchParams(navigation.location?.search).has("q");

    useEffect(() => {
        const searchField = document.getElementById("q");
        if (searchField instanceof HTMLInputElement) {
            searchField.value = query || "";
        }
    }, [query])


    return (
        <div id="container">
            <div id="sidebar">
                <h1>Remix Contacts <Logout /></h1>
                <div>
                    <Form
                        id="search-form"
                        role="search"
                        onChange={(evt: FormEvent<HTMLFormElement>) => {
                            const isFirstSearch = query === null;
                            submit(evt.currentTarget,
                                { replace: !isFirstSearch }
                            );
                        }}
                    >
                        <input
                            id="q"
                            defaultValue={query || ""}
                            className={searching ? "loading" : ""}
                            aria-label="Search contacts"
                            placeholder="Search"
                            type="search"
                            name="q"
                        />
                        <div
                            id="search-spinner"
                            aria-hidden
                            hidden={!searching}
                        />
                    </Form>
                    <Form method="post">
                        <button type="submit">New</button>
                    </Form>
                </div>
                <nav>
                    <ContactsList contacts={contacts} />
                </nav>
            </div>

            <div
                id="detail"
                className={navigation.state === 'loading' && !searching ? 'loading' : ""}
            >
                <Outlet />
            </div>

        </div>
    );
}

type ContactsListProps = {
    contacts: ContactRecord[],
};

const ContactsList: FunctionComponent<ContactsListProps> = ({ contacts }) => {
    return (
        contacts.length ? (
            <ul>
                {
                    contacts.map((contact) => {
                        return (
                            <li key={contact.id}>
                                <NavLink
                                    to={`/contacts/${contact.id}`}
                                    className={({ isActive, isPending }) => {
                                        return isActive ? 'active' : isPending ? 'pending' : ""
                                    }}
                                >
                                    <img
                                        src={contact.avatar}
                                        alt="img"
                                        width="25px"
                                        style={{
                                            borderRadius: '50%',
                                            marginRight: '5px',
                                            boxShadow: '0 0 5px blue',
                                        }}
                                    />
                                    {
                                        contact.first || contact.last ? (
                                            <>
                                                {contact.first} {contact.last}
                                            </>
                                        ) : (
                                            <i>No name</i>
                                        )}{" "}
                                    {contact.favorite ? (
                                        <span>★</span>
                                    ) : null}
                                </NavLink>
                            </li>
                        )
                    })
                }
            </ul>
        ) : (
            <p><i>No contacts</i></p>
        )
    )
}
