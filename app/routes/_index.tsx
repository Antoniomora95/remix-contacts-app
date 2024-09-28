import { redirect } from "@remix-run/node";


export const loader = async () => {
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
