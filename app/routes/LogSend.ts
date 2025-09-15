// app/routes/logs 
 

import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import fs from "fs";
import path from "path";
import { authenticate } from "../shopify.server";


export async function loader({ request }: LoaderFunctionArgs) {

  const auth = await authenticate.admin(request);
  const shop = auth.session.shop.replace(".myshopify.com", "");
  //const url = new URL(request.url);
  //const shop = url.searchParams.get("shop");
  // console.log(  "===>shop LogSend:" , shop );

  if (!shop) {
    return json({ error: "Missing shop" }, { status: 400 });
  }

  const fileName = `sendLogs_${shop}.json`;
  const logPath = path.join(process.cwd(), "app", "routes", fileName);

  try {
    const logs = JSON.parse(fs.readFileSync(logPath, "utf-8"));
    return json(logs);
  } catch (err) {
    return json({ error: "Fichier non trouvé ou illisible" }, { status: 404 });
  }
}
