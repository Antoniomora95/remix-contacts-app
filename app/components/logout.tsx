import { Form } from "@remix-run/react"

export const Logout = () => {
    return (
        <Form action="/logout" method="POST">
            <button type="submit" id="buttton-logout">
                Logout
            </button>
        </Form>
    )
}
