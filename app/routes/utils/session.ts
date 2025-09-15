// utils/session.ts
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export async function getSessionId(request: Request) {
  const { session } = await authenticate.admin(request);
  console.log(' *** ***** sessionId:', session.shop.shop); 
  return session.shop.shop.replace(".myshopify.com", "");
  
}