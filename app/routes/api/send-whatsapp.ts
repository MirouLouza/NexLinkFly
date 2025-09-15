import { json } from "@remix-run/node";
 
 

export const action = async ({ request }) => {
  try {
    const { phone, message } = await request.json();

    const res = await fetch(`https://botyax.com/api/create_instance?access_token=6802af5111853&to=+212633458644&message=Bonjour`);

    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      return json({ error: data.message || "Erreur API Botyax" }, { status: 500 });
    }

    return json({ success: true, instance_id: data.instance_id });
  } catch (err) {
    console.error("Erreur dans send-whatsapp:", err);
    return json({ error: "Erreur interne" }, { status: 500 });
  }
};

