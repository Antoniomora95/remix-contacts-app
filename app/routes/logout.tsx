import { ActionFunctionArgs } from '@remix-run/node';
import { logout } from '~/services/auth.server';

export const action = async ({ request }: ActionFunctionArgs)  => {
    return logout(request);
}
