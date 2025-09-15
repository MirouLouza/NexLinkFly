import { LoaderFunctionArgs, json } from "@remix-run/node";

// getSender.ts
//import { sessions } from "../../../whatsapp-web-api/src/sessions.js";


export async function loader({ params }: LoaderFunctionArgs) {
  const { sessionId } = params;

  const session = sessions[sessionId];
  if (!session || !session.client) {
    return json({ error: "Session non trouvée" }, { status: 404 });
  }

  const number = session.client.info?.wid?.user;

  if (!number) {
    return json({ error: "Numéro non trouvé" }, { status: 500 });
  }

  return json({ chatId: `${number}@c.us` });
}
