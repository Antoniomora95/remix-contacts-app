import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { createUserSession, login, signup } from "~/services/auth.server";

type ActionData = {
    formError?: string;
    fieldErrors?: {
        username: string | undefined;
        password: string | undefined;
    };
    fields?: {
        loginType: string;
        username: string;
        password: string;
    };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export async function action({ request }: ActionFunctionArgs) {

    const formData = await request.formData();
    const username = String(formData.get("username"));
    const password = String(formData.get("password"));
    const loginType = String(formData.get("loginType"));
    const fields = { username, password, loginType };

    const validateUsername = (username: string) => {
        if(typeof username !== "string" || username.length < 6) {
            return "username must be string with length 6 at least"
        }
    }

    const validatePassword = (password: string) => {
        if(typeof password !== "string" || password.length < 6) {
            return "password must be string with length 6 at least"
        }
    }

    const fieldErrors = {
        username: validateUsername(username),
        password: validatePassword(password)
    };

    if (typeof username !== "string" || typeof password !== "string") {
        return badRequest({formError: "username and password must be strings"})
    }

    if (Object.values(fieldErrors).find(Boolean)) {
        return badRequest({fieldErrors, fields })
    }

    if (loginType === "login") {
        const user = await login({ username, password });
        if (!user) {
            return badRequest({formError: "Incorrect username or password"});
        }

        return createUserSession({userId: user.id, redirectTo: '/contacts'});
    } else if (loginType === "register") {
        // register the user, verify that it does not exist
        const userCreated = await signup({username, password});
        if (!userCreated) {
            return badRequest({formError: "Could not register user, contact the administrator"});
        }
        return createUserSession({userId: userCreated.id, redirectTo: '/contacts'});
    }

    return badRequest({formError: "Login type not allowed"})
}

export default function Login() {
    const actionData = useActionData<typeof action>();
    //const fetcher = useFetcher();

    return (
        <Form
            id="form-login"
            method="post"
        >
            <label>
                <span style={{ marginRight: "2rem" }}>Username</span>
                <input
                    type="text"
                    name="username"
                    aria-label="Type your username"
                />
                <ErrorMessage name="formError" errorMessage={actionData?.fieldErrors?.username} />
            </label>
            <label>
                <span style={{ marginRight: "2rem" }}>Password</span>
                <input
                    type="password"
                    name="password"
                    aria-label="Type your password"
                />
                <ErrorMessage name="formError" errorMessage={actionData?.fieldErrors?.password} />
            </label>

            <fieldset style={{ border: 0 }}>
                <legend className="sr-only">Login or Register?</legend>
                <label style={{ marginRight: '1em' }}>
                    <input
                        type="radio"
                        name="loginType"
                        value="login"
                        defaultChecked={
                            !actionData?.fields?.loginType ||
                            actionData?.fields?.loginType === "login"
                        }
                    />{" "}
                    Login
                </label>
                <label>
                    <input
                        type="radio"
                        name="loginType"
                        value="register"
                        defaultChecked={actionData?.fields?.loginType === "register"}
                    />{" "}
                    Register
                </label>
            </fieldset>

            <div id="form-error-message">
                <ErrorMessage name="formError" errorMessage={actionData?.formError} />
            </div>
            <button type="submit">Submit</button>
        </Form>
    )
}

const ErrorMessage = ({ name, errorMessage }: { name: string, errorMessage?: string }) => {

    return errorMessage ? (<p className="form-validation-error" role="alert" id={name}>{errorMessage}</p>) : null;
}


