import { json, ActionFunctionArgs } from "@remix-run/node";
import fs from "fs";
import path from "path";
import { authenticate } from "../shopify.server";
 
 
export async function action({ request }: ActionFunctionArgs) {
 
  const body = await request.json();
 
  const days = Number(body.days || 60);
  const shop = body.shop;
  console.log("🧹 days CLEAN:", days);
  if (!shop) return json({ success: false, error: "Missing shop" }, { status: 400 });

  const fileName = `sendLogs_${shop}.json`;
  const logPath = path.join(process.cwd(), "app", "routes", fileName);

  try {
    const logs = JSON.parse(fs.readFileSync(logPath, "utf-8"));
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const filtered = logs.filter((log: any) => {
      const sentDate = new Date(log.sentAt);
      return sentDate >= cutoff;
    });

    fs.writeFileSync(logPath, JSON.stringify(filtered, null, 2));
    return json({ success: true, remaining: filtered.length });
  } catch (err) {
    return json({ success: false, error: "Erreur lors du nettoyage" }, { status: 500 });
  }
}

 