//  increment cpt d'envoie de test
//import { prisma } from "../db.server";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


import { json, ActionFunctionArgs } from "@remix-run/node";
import fs from "fs";
import path from "path";
import { authenticate } from "../shopify.server";

export async function action({ request }: ActionFunctionArgs) {
 
  const body = await request.json();
  const shop = body.shop;
    if (!shop) return json({ error: "Shop missing" }, { status: 400 });


  try {
    /* const updated = await prisma.planOption.update({
      where: { shop: shop },
      data: { cptTestSend: { increment: 1 } }
    }); */
   //console.log("my object", prisma);
	  const updated = await prisma.PlanOption.upsert({
	  where: { shop: shop },
	  update: { updatedAt: new Date(), cptTestSend: { increment: 1 } },
	  create: { shop: shop, cptTestSend: 1 }
	  });

	//console.log("🪵 après maj incrementCpt:", updated);
    return json({ success: true, data: updated });
  } catch (error) {
		//console.log("** error maj incrementCpt:", error);

    return json({ 
      success: false, 
      error: "Failed to increment counter" 
    }, { status: 500 });
  }
}