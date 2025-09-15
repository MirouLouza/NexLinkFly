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

  const formattedPhone = formatPhoneNumber(phoneNumber);
  formattedPhone = "212673252887@c.us";
  const sendResponse = await fetch("http://localhost:3000/send-whatsapp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: formattedPhone,
      message: `Bonjour 👋 Vous avez laissé des articles dans votre panier ! Finalisez votre commande ici : [lien] 🛒`,
    }),
  });

  const sendText = await sendResponse.text();
  console.log("Réponse Chris :", sendText);

  if (!sendResponse.ok || sendText.includes("<html>")) {
    return json({ error: "Envoi WhatsApp échoué", details: sendText }, { status: 500 });
  }

  return json({ success: true });
};

function formatPhoneNumber(phone: string): string {
  // Transforme 0612345678 → +33612345678
  if (phone.startsWith("0")) {
    return "+33" + phone.slice(1);
  }
  return phone;
}
