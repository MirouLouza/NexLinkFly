// app/routes/webhooks/checkout.ts

import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const rawBody = await request.text();

  let checkoutData;
  try {
    checkoutData = JSON.parse(rawBody);
  } catch (error) {
    console.error("Erreur parsing JSON:", error);
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phoneNumber = checkoutData?.shipping_address?.phone;

  if (!phoneNumber) {
    console.warn("Aucun numéro trouvé dans checkout");
    return json({ message: "No phone number" }, { status: 200 });
  }

  const formattedPhone = formatPhoneNumber(phoneNumber); // tu peux adapter

  const botyaxResponse = await fetch("https://api.botyax.com/whatsapp/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BOTYAX_API_KEY}`, // stocke la clé en variable d'env
    },
    body: JSON.stringify({
      to: formattedPhone,
      message: `Bonjour 👋 Vous avez laissé des articles dans votre panier ! Finalisez votre commande ici : [lien personnalisé] 🛒`,
    }),
  });

  if (!botyaxResponse.ok) {
    console.error("Erreur Botyax:", await botyaxResponse.text());
    return json({ error: "Botyax failed" }, { status: 500 });
  }

  return json({ success: true });
};

function formatPhoneNumber(phone: string): string {
  // Exemple : transforme 0612345678 → +33612345678
  return phone.replace(/^0/, "+33");
}
