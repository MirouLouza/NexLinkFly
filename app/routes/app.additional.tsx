import { useEffect, useState } from "react";
import {
  Page,
  Card,
  DataTable, 
  InlineStack,
  Link,
  BlockStack, TextField,
  Text,
  Spinner,
  Image,
  Button,
} from "@shopify/polaris";

import { useLoaderData } from "@remix-run/react";
import { authenticate, MONTHLY_PLAN } from "../shopify.server";
import { json, LoaderFunctionArgs } from "@remix-run/node";

import prisma from "../db.server";
import { incrementCounter } from "../lib/updatePlan";
import  { Form, useActionData } from "@remix-run/react";
 
//import * as cron from 'node-cron';

	//Exécute tous les jours à 12H00
  //cron.schedule("*/1 10 * * *", async () => {
   //console.log("🚀   cron : Lancement auto des messages WhatsApp");

    //});

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  //console.error("❌❌❌❌❌❌ session :", session);
  const planrec = session.shop.shop;
  // EXPIRATION package
const shopRecord =  await prisma.session.findFirst({ where: { shop: planrec } });
 //console.log("❌❌❌❌❌❌ shopRecord :", shopRecord);
 
 // Lire le plan dynamiquement
  const { billing } = await authenticate.admin(request);
	const activeSubscriptions = await billing.check({
    session: session.shop, // Session Shopify  
		});

	//console.log("🔍 Abonnements actifs:", activeSubscriptions.appSubscriptions[0]);  
	
			// Config selon plan
		const appSubscriptions = activeSubscriptions.appSubscriptions[0];
		const isBasicExpired =
		appSubscriptions.status === "ACTIVE" &&
		new Date().getTime() - new Date(appSubscriptions.currentPeriodEnd).getTime() > 0;  		
  
		const planOption = await prisma.PlanOption.findUnique({ where: { shop: session.shop } });
		const confBilling = await prisma.ConfBilling.findFirst();
		let ImaxTestSend = 5; let ImaxReminders = 0;
		
		
 
		if ( !planOption || !planOption.updatedAt || new Date(planOption.updatedAt).getTime() < new Date(appSubscriptions.createdAt).getTime() )
		{	
			if (appSubscriptions.name === "Basic")
			{
				 ImaxReminders = confBilling.limitBasic;
			
			};
			if (appSubscriptions.name === "Pro")
			{
			     ImaxReminders = confBilling.limitPro;
 
			};			
			if (appSubscriptions.name === "Gold")
			{
			     ImaxReminders = confBilling.limitGold;
 
			};			
			if (appSubscriptions.name === "Advanced")
			{
			     ImaxReminders = confBilling.limitAdvanced;
 
			};			

      await prisma.PlanOption.upsert({
      where: { shop: session.shop },
      update: { 
        plan: appSubscriptions.name, 
		updatedAt: new Date(),
        maxReminders : ImaxReminders,
        cptReminders : 0,
        maxTestSend : ImaxTestSend,
        cptTestSend : 0
      },
      create: { 
        shop: session.shop, 
        plan: appSubscriptions.name, 
		updatedAt: new Date(),
        maxReminders : ImaxReminders,
        cptReminders : 0,
        maxTestSend : ImaxTestSend,
        cptTestSend : 0
      },
    });			
	
	
		};
		    //console.log("🔍 planOption.maxTestSend:", planOption.maxTestSend);
			//console.log("🔍 planOption.cptTestSend:", planOption.cptTestSend);
		const soldeTestZero = planOption.maxTestSend <= planOption.cptTestSend ;
		
  
 /* 
const isBasicExpired =
  activeSubscriptions.appSubscriptions.name === "Basic" &&
  new Date().getTime() - new Date(activeSubscriptions.appSubscriptions.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000;
  
      await prisma.PlanOption.upsert({
      where: { shop },
      update: { 
        plan: activeSubscriptions.appSubscriptions.name, 
        maxReminders : ImaxReminders,
        cptReminders : 0,
        maxTestSend : ImaxTestSend,
        cptTestSend : 0
      },
      create: { 
        shop, 
        plan: activeSubscriptions.appSubscriptions.name, 
        maxReminders : ImaxReminders,
        cptReminders : 0,
        maxTestSend : ImaxTestSend,
        cptTestSend : 0
      },
    });
  */

  
  
  
  /*
  console.log("❌❌❌❌❌❌ isBasicExpired :", isBasicExpired);
{isBasicExpired && (
  <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4">
    🚫 Votre période d’essai de 7 jours sur le forfait Basic a expiré. 
		  <a href={`https://admin.shopify.com/store/${shopRecord.shop.replace(".myshopify.com", "")}/charges/nexlink/pricing_plans`}>
		 Choose your plan
		 </a>	
  </div>
)}  
*/
// Fin EXPIRATION

	/* billing billing
  const { billing } = await authenticate.admin(request);
  const billingCheck = await billing.require({
    plans: [MONTHLY_PLAN],
    onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
  });
	console.log("🪵 Données de billing:",  billingCheck );
	 
  const { billing } = await authenticate.admin(request);
 // console.log("🪵 Données de session.shop:",  session.shop );
  // Dans votre route (ex: app.additional.tsx)
	const activeSubscriptions = await billing.check({
  session: session.shop, // Session Shopify obligatoire
		});

	console.log("🔍 Abonnements actifs:", activeSubscriptions);
	*/
	//console.log("🔍 soldeTestZero:", soldeTestZero);

  return json({ soldeTestZero: soldeTestZero, isBasicExpired: isBasicExpired, shop: session.shop });
} 

export default function Index() {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const  shopL = useLoaderData<typeof loader>();
   // 1. sessionId statique ou dynamique  
  //const sessionId = "Test";
    const sessionId = shopL.shop.replace(".myshopify.com", "");
	const isBasicExpired = shopL.isBasicExpired;
    const soldeTestZero =  shopL.soldeTestZero;


// HISTO D'ENVOIE
  /*
  const [logs, setLogs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
 
useEffect(() => {
  fetch("/LogSend")
    .then((res) => res.json())
    .then((data) => {
      //console.log("🪵 Données reçues depuis l'API:", data);
      setLogs(data);
    });
}, []);
*/

 
const ITEMS_PER_PAGE = 10;

 
  const [logs, setLogs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

useEffect(() => {
  fetch("/LogSend")
    .then((res) => res.json())
    .then((data) => {
      const now = new Date();
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(now.getMonth() - 2); // Ne pas selectionner l'histo < 2 mois
		console.log(`🚀  Fetch  LogSend?shop=${sessionId}`);
		
      const filtered = Array.isArray(data)
	 
        ? data.filter((log) => {
            const sentDate = new Date(log.sentAt);
               return (
				sentDate >= twoMonthsAgo &&
				log.resreq?.shop === sessionId //  shop actuel
					);
          })
        : [];
		
      setLogs(filtered.reverse()); // les plus récents d’abord
    })
    .catch((err) => {
      console.error("❌ Erreur fetch logs :", err);
    });
}, []);

  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);

  const paginatedLogs = logs.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  
  const rows = paginatedLogs.map((log: any) => {
    const url = log.resreq?.content?.match(/https?:\/\/\S+/)?.[0];
    return [
    log.chatId || log.resreq?.chatId.replace("@c.us", "") || "N/A",
    new Date(log.sentAt).toLocaleString(), 
	  
	   url ? (
      <a href={url} target="_blank" rel="noopener noreferrer">
         Voir le panier
      </a>
    ) : (
      "Lien introuvable"
    ),
	 
  ]}
  ); 
  
  /*
    const rows = paginatedLogs.map((log: any) => [
    log.chatId || log.resreq?.chatId.replace("@c.us", "") || "N/A",
    new Date(log.sentAt).toLocaleString(),
  ]);
  */
 
 
 

// TABS des checkouts
useEffect(() => {
  let pollingInterval: NodeJS.Timeout;

  const checkAndStartSession = async () => {
    console.log(`🟡 Vérification de la session ${sessionId}`);

    try {
      const statusRes = await fetch(`http://localhost:3000/session/status/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer NexLinkKey`,
        },
      });

      const statusData = await statusRes.json();
      console.log("📦 Données statut:", statusData);

      if (statusData.state === "CONNECTED") {
        console.log("✅ Session déjà connectée !");
        setConnected(true);
        setLoadingSession(false);
        return;
      }

      if (statusData.state === null || statusData.message === "session closed") {
        console.log("🛑 Session fermée ou inexistante, suppression...");
        await fetch(`http://localhost:3000/session/terminate/${sessionId}`, {
          method: "GET",
          headers: { Authorization: `Bearer NexLinkKey` },
        });
        console.log("✅ Session terminée.");
      }

      console.log("🚀 (Re)lancement de la session...");
      const startRes = await fetch(`http://localhost:3000/session/start/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer NexLinkKey`,
        },
      });

      if (!startRes.ok) {
        const text = await startRes.text();
        throw new Error(`Erreur HTTP ${startRes.status} : ${text}`);
      }

      console.log(`✅ Session ${sessionId} démarrée avec succès`);

      // Récupération QR initiale
      await fetchQrCode();

    } catch (err) {
      console.error("❌ Erreur dans checkAndStartSession:", err);
    }
  };

  const fetchQrCode = async () => {
    try {
      const qrRes = await fetch(`http://localhost:3000/session/qr/${sessionId}/image`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer NexLinkKey`,
        },
      });

      const qrBlob = await qrRes.blob();
      if (qrBlob.type.startsWith("image/")) {
        const url = URL.createObjectURL(qrBlob);
        setQrImage(url);
        console.log("🖼️ QR Code mis à jour.");
      } else {
        console.error("⚠️ QR non image :", qrBlob);
      }
    } catch (err) {
      console.error("❌ Erreur lors de la récupération du QR code:", err);
    } finally {
      setLoadingSession(false);
    }
  };

  // Démarre la session une fois
  checkAndStartSession();

  // Met en place le polling uniquement si non connecté
  pollingInterval = setInterval(async () => {
    if (connected) return;

    try {
      const res = await fetch(`http://localhost:3000/session/status/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer NexLinkKey`,
        },
      });

      const data = await res.json();
      console.log(`(Interval) Statut de la session ${sessionId} :`, data?.state);

      if (data?.state === "CONNECTED") {
        setConnected(true);
        console.log("✅ Connexion confirmée");
        clearInterval(pollingInterval);
      } else if (!qrImage) {
        // Si non connecté et pas encore de QR code, on tente de le recharger
        await fetchQrCode();
      }

    } catch (err) {
      console.error("❌ Erreur polling:", err);
    }
  }, 3000);

  return () => clearInterval(pollingInterval);
}, [sessionId, connected]);



	/*
  const sendTestMessage  = async () => {
  
      setLoading(true);

		//Numéro de sender
		 /*
		const ressender = await fetch(`http://localhost:3000/getSender`, {
		  headers: {
			Authorization: `Bearer NexLinkKey`
		  }
		});
		const datasender = await ressender.json();
		const senderChatId = datasender.chatId;
		 
		
    try {
      await fetch("http://localhost:3000/Client/sendMessage/"+sessionId,  {
        method: "POST",
		  headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer NexLinkKey` // ${process.env.CHRIS_API_KEY}
		  },
		  body: JSON.stringify({
		   chatId: senderChatId, contentType: "string", content: "Test Sending"
		  }),
 
      });
    } catch (err) {
      console.error("Erreur lors de l'envoi du message test:", err);
    } finally {
      setLoading(false);
    }
  };*/
 

 const sendTestMessage = async () => {
  setLoading(true);
 // const planOption = await prisma.PlanOption.findUnique({ where: { shop: shopL.shop } });

  try {
    // 🔍 Récupérer la liste des contacts
    const ressender = await fetch("http://localhost:3000/client/getContacts/"+sessionId, {
      headers: {
        Authorization: `Bearer NexLinkKey`
      }
    });
    const data = await ressender.json();

    // ✅ Trouver le contact correspondant au client connecté
    const meContact = data.contacts.find(
      (c) => c.isMe === true && c.type === "in"
    );

    if (!meContact) {
      console.error("Contact du client connecté introuvable");
      return;
    }

    const senderChatId = meContact.id._serialized;
	//console.log("senderChatId="+senderChatId);
	
		// Test si solde > 0
	/*if ( planOption.maxTestSend <= planOption.cptTestSend )
	 { alert("❌ Votre solde des messages de test est de ZERO");
	 return;
	 };*/
	
    // 📤 Envoyer le message de test
    /*await fetch(`http://localhost:3000/client/sendMessage/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer NexLinkKey`
      },
      body: JSON.stringify({
        chatId: senderChatId,
        contentType: "string",
        content: "👋 Test Sending from Sendup Whatsapp Abandoned Cart 👋"
      })
    }); */
	 const sendResponse = await fetch(`http://localhost:3000/client/sendMessage/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer NexLinkKey`
      },
      body: JSON.stringify({
        chatId: meContact.id._serialized,
        contentType: "string",
        content: "👋 Test Sending from Sendup Whatsapp Abandoned Cart 👋"
      })
    });
		//console.log("🪵 sendResponse => :", sendResponse);
		
    //if (!sendResponse.ok) throw new Error("Échec de l'envoi");
	
    //  Incrémentation du compteur (SEULEMENT si l'envoi réussit)
	//console.log("🪵 Données avant appel incrementCpt:", shopL.shop);
    const incrementResponse = await fetch('/incrementCptTest', {
      method: 'POST',
	    headers: {
			"Content-Type": "application/json",
				},
      body: JSON.stringify({ shop: shopL.shop })
    });
		//console.log("🪵 incrementResponse => :", incrementResponse);
    /*  if (!incrementResponse.ok) {
      console.warn("Incrémentation échouée (mais message envoyé)");
    }	*/

  } catch (err) {
    console.error("Erreur lors de l'envoi du message test:", err);
  } finally {
    setLoading(false);
 	
  }
     		
			// Pour MAJ compteur d'envoie WhatsApp
			/*
			try {
			const retmaj = await prisma.PlanOption.update({
			  where: { 
				shop: shopL.shop 
			  },
			  data: { 
				cptTestSend: {
				  increment: 1
				}
			  }
			});
			
			if (!retmaj.ok) throw new Error("Failed to increment");
		
		} catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  };
  */
	
	//if (planOption.maxTestSend <= planOption.cptTestSend )
	//alert("❌ Votre solde des messages de test est de ZERO");
  
};

 
  
  // nettoie l'ancien QR
  useEffect(() => {
  return () => {
    if (qrImage) {
      URL.revokeObjectURL(qrImage);
      console.log("🧹 QR Code blob URL nettoyé.");
    }
  };
}, [qrImage]);


// CLEAN log
 
const [days, setDays] = useState("60");
 
const handleCleanLogs = async () => {
  if (!window.confirm(`Supprimer les logs de plus de ${days} jours ?`)) return;

  setLoading(true);
  try {
 	
	const res = await fetch("/LogSendClean", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ days: Number(days), shop: sessionId }),
});

    const data = await res.json();
	console.log("🧹 Qdata après CLEAN:", data);
    if (data.success) {
      alert(`✅ ${data.remaining} logs restants`);
     // window.location.reload(); // ou re-fetch logs
    } else {
      alert("❌ Erreur lors du nettoyage");
    }
  } catch (err) {
    alert("❌ Impossible de contacter le serveur");
  } finally {
    setLoading(false);
  }
  
 
};




// PAGE ADD
  return (
  
  
    <Page title=" ⚡ Subscribe now →  Efficiently manage abandoned orders 🚀✨ " >
      <BlockStack gap="500">
	  

		{isBasicExpired ? (
  <div className="bg-yellow-100 text-yellow-800 p-8 rounded mb-4">
    🚫 Your plan has expired. Please upgrade your plan via 
	<> : </>
		  <a href={`https://admin.shopify.com/store/${sessionId}/charges/nexlink/pricing_plans`}>
		  Choose your plan
		 </a>	
  </div>
  
) : ( 	  
	  
	  
        <Card padding="400">
          {!connected ? (
            <>
              <Text as="h2" variant="headingMd">
                🔐 WhatsApp connection required
              </Text>
              {loadingSession || !qrImage ? (
                <Spinner accessibilityLabel="Chargement" size="large" />
              ) : (
                <>
                  <Image source={qrImage} alt="QR Code WhatsApp" />
                  <Text as="p" tone="subdued">
                    📱 Scan this QR code in WhatsApp to link your account!
                  </Text> 
                </>
              )}
            </>
          ) : (
            <>
              <Text as="p">📲 Your account is now linked to WhatsApp ✅</Text> <p className="my-10">&nbsp;</p> 
					 {!soldeTestZero ? (
					<Button 
					  onClick={async () => {
						
						await sendTestMessage();
					  }}
					>
					  ✨Try it now: Send a test message!
					</Button>
					) :(

					  <div className="bg-yellow-100 text-yellow-800 p-8 rounded mb-4">
						<p className="my-10">&nbsp;</p> 
						⚠️ Alert: You’ve used all test messages!
						<p className="my-10">&nbsp;</p> 
					  </div>


					)}
			  <p className="my-10">&nbsp;</p>	
              <Text as="p">💰 Manage abandoned orders</Text>
              <Link url="/checkouts?shop=${sessionId}"> Abandoned checkouts 🛒 View now! 	</Link>
 			  
            </>
          )}
        </Card>
		)}

 
		
      </BlockStack>
    </Page>
  );
}



 