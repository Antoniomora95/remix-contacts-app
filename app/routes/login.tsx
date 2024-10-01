import { z } from "zod";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { createUserSession, login, signup } from "~/services/auth.server";

type ActionData = {
    formErrors?: string[];
    fieldErrors?: {
        username?: string[];
        password?: string[];
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

    const loginSchema = z.object({
        username: z.string().min(6),
        password: z.string().min(6),
        loginType: z.enum(["login", "register"]),
    }).strict();

    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (result.success === false) {
        const formErrors = result.error?.formErrors.formErrors;
        const fieldErrors = result.error?.formErrors.fieldErrors;
        return badRequest({ formErrors, fieldErrors });
    }

    const { loginType, username, password } = result.data;

    if (loginType === "login") {
        const user = await login({ username, password });
        if (!user) {
            return badRequest({ formErrors: ["Incorrect username or password"] });
        }
        return createUserSession({ userId: user.id, redirectTo: '/contacts' });
    } else if (loginType === "register") {
        // register the user, verify that it does not exist
        const userCreated = await signup({ username, password });
        if (!userCreated) {
            return badRequest({ formErrors: ["Could not register user, contact the administrator"] });
        }
        return createUserSession({ userId: userCreated.id, redirectTo: '/contacts' });
    }

    return badRequest({ formErrors: ["Login type not allowed"] })
}

export default function Login() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";

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
                <ErrorMessage field="username" errorMessages={actionData?.fieldErrors?.username} />
            </label>
            <label>
                <span style={{ marginRight: "2rem" }}>Password</span>
                <input
                    type="password"
                    name="password"
                    aria-label="Type your password"
                />
                <ErrorMessage field="password" errorMessages={actionData?.fieldErrors?.password} />
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
                <ErrorMessage field="form" errorMessages={actionData?.formErrors} />
            </div>
            <button type="submit" disabled={isSubmitting}>Submit</button>
        </Form>
    )
}

const ErrorMessage = ({ field, errorMessages }: { field: string, errorMessages?: string[] }) => {

    if (!errorMessages) {
        return null
    }
    return errorMessages.map(error => {
        return (
            <p
                id={`${field}-error`}
                key={`${field}-${error}`}
                className="form-validation-error"
                role="alert"
            >
                {error}
            </p>
        )
    })
}


