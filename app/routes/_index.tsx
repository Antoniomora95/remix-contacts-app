import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { requireUserId } from "~/services/auth.server";


export const loader = async (args: LoaderFunctionArgs) => {
  await requireUserId(args.request, "/login");
  return redirect('/contacts');
}
export default function Index() {
  return (
    <p id="index-page">
        <br />
        <a href="hhtps://remix.run">The docs at remix.run</a>
    </p>
  );
}
