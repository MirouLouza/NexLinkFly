 
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
 
export const action = async ({ request }) => {
  try {
 
    const resreq  = await request.json();
	const shop = resreq.shop;
	
	 console.log("resreq ",  resreq  );
	 //console.log("shop avant send ",  "http://localhost:3000/Client/sendMessage/"+shop  );
    const sendMessageResponse = await fetch("http://localhost:3000/Client/sendMessage/"+shop , {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer NexLinkKey` // ${process.env.CHRIS_API_KEY}
      }, 
      body: JSON.stringify({
       chatId: resreq.chatId, contentType: "string", content: resreq.content
      }),
    });

    const sendMessageText = await sendMessageResponse.text();
	
    //console.log("Envoi du message réponse texte :", sendMessageText);

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
    }

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

 