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
        <div className="lg:container mx-auto min-h-full flex flex-1 flex-col items-center">
            <Form
                id="form-login"
                method="post"
                className="mx-auto w-1/2 mt-20"
            >
                <h2 className="mx-auto font-bold mb-10 text-center text-xl">Sign into your account</h2>
                <label className="block mb-5">
                    <span className="mb-2 block font-medium">Username</span>
                    <input
                        type="text"
                        name="username"
                        aria-label="Type your username"
                        className="w-[100%] border-0 rounded-lg ring-1 ring-gray-300 focus:ring-inset focus:ring-violet-600 focus:ring-2"
                    />
                    <ErrorMessage field="username" errorMessages={actionData?.fieldErrors?.username} />
                </label>
                <label className="mb-5 block font-medium">
                    <span className="mb-2 block">Password</span>
                    <input
                        type="password"
                        name="password"
                        className="w-[100%] border-0 rounded-lg ring-1 ring-gray-300 focus:ring-inset focus:ring-violet-600 focus:ring-2"
                        aria-label="Type your password"
                    />
                    <ErrorMessage field="password" errorMessages={actionData?.fieldErrors?.password} />
                </label>

                <fieldset>
                    <legend className="sr-only">Login or Register?</legend>
                    <label style={{ marginRight: '1em' }}>
                        <input
                            type="radio"
                            name="loginType"
                            value="login"
                            className="checked:bg-violet-500 checked:focus:bg-violet-500 checked:ring-violet-500 focus:ring-violet-500 hover:checked:bg-violet-500 mr-1"
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
                            className="checked:bg-violet-500 checked:focus:bg-violet-500 checked:ring-violet-500 focus:ring-violet-500 hover:checked:bg-violet-500 mr-1"
                            defaultChecked={actionData?.fields?.loginType === "register"}
                        />{" "}
                        Register
                    </label>
                </fieldset>

                <div id="form-error-message">
                    <ErrorMessage field="form" errorMessages={actionData?.formErrors} />
                </div>
                <div className="mt-5">
                <button type="submit" disabled={isSubmitting} className=" bg-indigo-600 block text-white px-3 py-1 rounded-md w-full text-sm font-semibold">Submit</button>

                </div>
            </Form>
        </div>
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
                className="text-red-400 mt-1"
                role="alert"
            >
                {error}
            </p>
        )
    })
}


