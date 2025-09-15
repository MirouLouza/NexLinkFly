 
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import fs from "fs";
import path from "path";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
 

export const action = async ({ request }) => {

 
//console.log("x-api-key:", process.env.CHRIS_API_KEY);

const apiKey = request.headers.get("x-api-key");
 
  if (apiKey !== process.env.CHRIS_API_KEY) {
    return json({ error: "Unauthorized" }, { status: 403 });
  }
 
const resreq  = await request.json();
const shopC = resreq.shop+".myshopify.com";
// DEB CHECK SOLDE REMINDER
//console.log("DEB CHECK SOLDE REMINDER:", shopC);
		const planOption = await prisma.PlanOption.findUnique({ where: { shop: shopC } });

 	
	if ( planOption.maxReminders <= planOption.cptReminders )
			{
				    //alert("Your follow-up credits are all used up. 💡 Upgrade your plan to keep going!");
					//return;
					return json({ error: "Your follow-up credits are all used up. 💡 Upgrade your plan to keep going!" }, { status: 409 }
						);
			};

// FIN CHECK SOLDE REMINDER

  try {
 
    
	const shop = resreq.shop;
	let BASE_URL = process.env.SHOPIFY_APP_URL || "http://localhost:3000";
	  if ( process.env.APP_ENV === "development" )
		BASE_URL = "http://localhost:3000";
	  // console.log("👋BASE_URL send ",  BASE_URL  );
	 //console.log("resreq.chatId lors send-whatsapp.ts="+resreq.chatId);
	 //console.log("👋resreq ",  resreq  );
	 //console.log("shop avant send ",  ${BASE_URL}+"/Client/sendMessage/"+shop  );
    const sendMessageResponse = await fetch(BASE_URL+"/Client/sendMessage/"+shop , {
      method: "POST",
      headers: {
        "Content-Type": "application/json", "x-api-key": "NexLinkKey", Authorization: `Bearer NexLinkKey` }, 
	  // Authorization: `Bearer NexLinkKey`, // ${process.env.CHRIS_API_KEY}
      body: JSON.stringify({
       chatId: resreq.chatId, contentType: "string", content: resreq.content
      }),
    });
	
			let sendMessageData;
			try {
			  const sendMessageText = await sendMessageResponse.text();
			  sendMessageData = sendMessageText ? JSON.parse(sendMessageText) : {};
			} catch (error) {
			  // Si le JSON est invalide, on log l'erreur mais on continue
			  console.error("Erreur de parsing JSON (mais le message est peut-être envoyé):", error);
			  return json(
				{ 
				  success: true, // Force le succès si l'envoi est confirmé côté WhatsApp
				  warning: "Réponse API malformée mais message potentiellement envoyé.",
				  debug: error.message 
				},
				{ status: 200 } // Ne renvoyez pas 500 si le message est parti
			  );
			}

			if (!sendMessageResponse.ok || sendMessageData?.success === false) {
			  console.error("Erreur API Chris:", sendMessageData?.error);
			  return json(
				{ 
				  error: "Erreur API lors de l'envoi",
				  details: sendMessageData?.error || "Unknown error",
				},
				{ status: 500 }
			  );
			}

	
	/*
	 console.log(" 👋 Envoi du message réponse texte :", sendMessageResponse);
    const sendMessageText = await sendMessageResponse.text();
	
    

    if (!sendMessageResponse.ok || sendMessageText.includes("<html>")) {
      return json(
        {
          error: "Erreur API Chris lors de l'envoi du message",
          details: sendMessageText,
        },
        { status: 500 }
      );
    }

    const sendMessageData = JSON.parse(sendMessageText);
    console.log("Envoi du message réponse data :", sendMessageData.success);
    if (sendMessageData.success !== true) {
      return json(
        {
          error:
            sendMessageData.message ||
            "Erreur API Chris lors de l'envoi du message",
        },
        { status: 500 }
      );
    } */
	
	
	
	
	// DEB LOGGER
	 const entry = {
				 resreq,
				sentAt: new Date().toISOString(),
					};
		const logPath = path.join(process.cwd(), "app", "routes", "sendLogs_"+shop+".json");
	    // Créer le fichier si besoin
		let logs = [];
		if (fs.existsSync(logPath)) {
			logs = JSON.parse(fs.readFileSync(logPath, "utf-8"));
			}

 
		logs.push(entry);
		fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
     // FIN LOGGER

	// DEB REMINDER
	const checkoutId  = resreq.name;
	const reminder =  await prisma.checkoutReminder.upsert({
		where: { checkoutId  },
		update: {},
		create: { checkoutId  },
		});

	  const updated = await prisma.PlanOption.upsert({
	  where: { shop: shopC },
	  update: { updatedAt: new Date(), cptReminders: { increment: 1 } },
	  create: { shop: shopC, cptReminders: 1 }
	  });
	  
		const updated2 = await prisma.frequency.upsert({
		  where: { shop: shopC },
		  update: { 
			updatedAt: new Date(), 
			maxReminders: { decrement: 1 } 
		  },
		  create: { 
			shop: shopC, 
			maxReminders: planOption?.maxReminders ?? 20 
		  },
		});
	
	// FIN REMINDER
    return json({
      success: true,
	  ok: true,
      message: "Message envoyé avec succès !",
    });
  } catch (err) {
    console.error("Erreur dans send-whatsapp:", err);
    return json(
      { error: "Erreur interne lors de l'envoi du message" },
      { status: 500 }
    );
  }
};

 