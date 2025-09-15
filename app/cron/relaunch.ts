// app/cron/relaunch.ts
import cron from "node-cron";
import prisma from "../db.server";
import { fetchAllCheckouts } from "../lib/fetchAllCheckouts";
import { sendWhatsAppMessage } from "../lib/fetchAllCheckouts";
import { getFormattedPhone } from "../lib/fetchAllCheckouts";
 

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


import { fetch, Headers, Request, Response } from "undici";

(globalThis as any).fetch = fetch;
(globalThis as any).Headers = Headers;
(globalThis as any).Request = Request;
(globalThis as any).Response = Response;


import dotenv from "dotenv";
dotenv.config();

/*
cron.schedule("* * * * *", async () => {
console.log("⏰ Cron task lancée auto 24");

  try {
  
    const session = await prisma.session.findFirst(); // je dois la changer par boucle
    if (!session) throw new Error("❌ Aucune session trouvée");
    // console.log("Session trouvée:",session);
    const checkoutsData = await fetchAllCheckouts(session);
    const { checkouts, shop } = checkoutsData;

    for (const checkout of checkouts) {
      await sendWhatsAppMessage({
        name: checkout.name,
        phone: getFormattedPhone(checkout),
        url: checkout.abandonedCheckoutUrl,
        shop,
      });
    }

    console.log("✅ Relance quotidienne envoyée à 18h");
  } catch (error) {
    console.error("❌ Erreur dans la tâche cron :", error);
  }
});
*/

/*

async function setupDynamicCrons() {
  const shops = await prisma.session.findMany();
  console.log("⏰ Cron task lancée auto ");
  for (const { shop } of shops) {
  
    console.log("⏰⏰⏰ Cron task lancée auto pour le shop", shop);
    const frequency = await prisma.frequency.findUnique({ where: { shop } });
	
	console.log(" frequency lue:",frequency);
    if (!frequency) continue;

    const [hour, minute] = frequency.time.split(":");
    const daysMap = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6,
    };
	const dayNames = frequency.days.split(","); 
	const dayNumbers = dayNames.map(day => daysMap[day.trim()]);
    //const dayNumbers = frequency.days.map(day => daysMap[day]);
 
    const cronExprs = dayNumbers.map(day =>
      `${minute} ${hour} * * ${day}`
    );

    for (const expr of cronExprs) {
	  console.log(" cronExprs:",expr);
      cron.schedule(expr, async () => {
        const session = await prisma.session.findFirst({ where: { shop } });
		console.log(" session:",session);
        if (session) {
          // Call your fetchAllCheckouts(session) 
		      const checkoutsData = await fetchAllCheckouts(session);
              const { checkouts, shop } = checkoutsData;
			  const  shopWa = checkoutsData.shop.replace(".myshopify.com", "");
			 

			for (const checkout of checkouts) {
			  if (checkout.name === "#38625562657088") continue;

				console.log("✅ Sending WhatsApp to:", checkout.name);
			  await sendWhatsAppMessage({
				name: checkout.name,
				phone: getFormattedPhone(checkout),
				url: checkout.abandonedCheckoutUrl,
				shop: shopWa,
			  });
			}

 
        }
      });
    }
  } // FIN BOUCLE SHOPS
}
*/

async function setupDynamicCrons() {
  const shops = await prisma.session.findMany();
  console.log("⏰ Initialisation des tâches cron dynamiques");

  for (const { shop } of shops) {
    console.log(`⏰ Configuration pour le shop: ${shop}`);
    const frequency = await prisma.frequency.findUnique({ where: { shop } });
    
    if (!frequency) continue;

    console.log("Configuration trouvée:", frequency);

    // Cas normal (useInterval = false)
    if (!frequency.useInterval) {
      const [hour, minute] = frequency.time.split(":");
      const daysMap = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
        Thursday: 4, Friday: 5, Saturday: 6,
      };
      const dayNames = frequency.days.split(","); 
      const dayNumbers = dayNames.map(day => daysMap[day.trim()]);

      const cronExprs = dayNumbers.map(day => `${minute} ${hour} * * ${day}`);

      for (const expr of cronExprs) {
        console.log("Planification cron:", expr);
        cron.schedule(expr, createCronTask(shop));
      }
    } 
    // Cas avec intervalle (useInterval = true)
    else {
      if (!frequency.intervalHours) {
        console.error("Intervalle non défini pour", shop);
        continue;
      }

      const maxReminders = frequency.maxReminders || 10;
      const intervalHours = frequency.intervalHours;

      console.log(`Planification avec intervalle: toutes les ${intervalHours}h, max ${maxReminders} rappels`);

      // Planification initiale
      const initialCron = `0 */${intervalHours} * * *`;
      console.log("Planification initiale:", initialCron);

      let remindersSent = 0;
      const task = cron.schedule(initialCron, async () => {
        if (remindersSent >= maxReminders) {
          console.log(`Max de ${maxReminders} rappels atteint pour ${shop}`);
          task.stop();
          return;
        }

        remindersSent++;
        console.log(`Envoi du rappel ${remindersSent}/${maxReminders} pour ${shop}`);

        const session = await prisma.session.findFirst({ where: { shop } });
        if (session) {
          await executeCheckoutProcess(session);
        }
      });
    }
  }
}

// Fonction helper pour créer la tâche cron
function createCronTask(shop: string) {
  return async () => {
    console.log(`Exécution cron pour ${shop}`);
    const session = await prisma.session.findFirst({ where: { shop } });
    if (session) {
      await executeCheckoutProcess(session);
    }
  };
}

// Fonction helper pour le processus de checkout
async function executeCheckoutProcess(session: any) {
  try {
    const checkoutsData = await fetchAllCheckouts(session);
    const { checkouts, shop, brutMessage } = checkoutsData;
    const shopWa = shop.replace(".myshopify.com", "");

    for (const checkout of checkouts) {
      if (checkout.name === "#38625562657088") continue;

      console.log("✅ Envoi WhatsApp à:", checkout.name);
      await sendWhatsAppMessage({
        name: checkout.name,
		customerName: checkout.customer?.firstName || checkout.customer?.lastName,
        phone: getFormattedPhone(checkout),
        url: checkout.abandonedCheckoutUrl,
        shop: shopWa,
		brutMessage,
		checkout
      });
    }
  } catch (error) {
    console.error("Erreur dans executeCheckoutProcess:", error);
  }
}

setupDynamicCrons();

 
/*
async function setupDynamicCrons() {
  const shops = await prisma.session.findMany();
  console.log("⏰ Initialisation des tâches cron dynamiques");

  for (const { shop } of shops) {
    const frequency = await prisma.frequency.findUnique({ where: { shop } });
    if (!frequency) continue;

    // Réinitialisation si c'est un nouveau jour (optionnel)
    await resetDailyCounterIfNeeded(frequency);

    if (!frequency.useInterval) {
      // Mode normal (planification fixe)
      await setupFixedSchedule(shop, frequency);
    } else {
      // Mode intervalle
      await setupIntervalSchedule(shop, frequency);
    }
  }
}

async function resetDailyCounterIfNeeded(frequency: any) {
  const now = new Date();
  const lastUpdated = frequency.updatedAt;
  
  if (lastUpdated.getDate() !== now.getDate() || 
      lastUpdated.getMonth() !== now.getMonth() || 
      lastUpdated.getFullYear() !== now.getFullYear()) {
    await prisma.frequency.update({
      where: { id: frequency.id },
      data: { sentReminders: 0 }
    });
  }
}

async function setupFixedSchedule(shop: string, frequency: any) {
  const [hour, minute] = frequency.time.split(':');
  const daysMap = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };
  const dayNumbers = frequency.days.split(',').map(day => daysMap[day.trim()]);

  for (const day of dayNumbers) {
    const cronExpr = `${minute} ${hour} * * ${day}`;
    cron.schedule(cronExpr, async () => {
      await executeAndTrackReminders(shop, frequency.id);
    });
  }
}

async function setupIntervalSchedule(shop: string, frequency: any) {
  if (!frequency.intervalHours) return;

  *************const task = cron.schedule(`0 ${frequency.intervalHours} * * *`, async () => {
    await executeAndTrackReminders(shop, frequency.id);
  });
}

async function executeAndTrackReminders(shop: string, frequencyId: number) {
  const frequency = await prisma.frequency.findUnique({ where: { id: frequencyId } });
  if (!frequency || (frequency.useInterval && frequency.sentReminders >= (frequency.maxReminders || 10))) {
    return;
  }

  const session = await prisma.session.findFirst({ where: { shop } });
  if (!session) return;

  try {
    // Exécution du processus de relance
    const checkoutsData = await fetchAllCheckouts(session);
    const { checkouts, shop: shopName } = checkoutsData;
    const shopWa = shopName.replace(".myshopify.com", "");

    for (const checkout of checkouts) {
      if (checkout.name === "#38625562657088") continue;
      
      await sendWhatsAppMessage({
        name: checkout.name,
        phone: getFormattedPhone(checkout),
        url: checkout.abandonedCheckoutUrl,
        shop: shopWa,
      });
    }

    // Mise à jour du compteur
    await prisma.frequency.update({
      where: { id: frequencyId },
      data: {
        sentReminders: (frequency.sentReminders || 0) + 1,
        updatedAt: new Date()
      }
    });

    console.log(`Relance ${frequency.sentReminders + 1}/${frequency.maxReminders} effectuée pour ${shop}`);

  } catch (error) {
    console.error(`Erreur lors de la relance pour ${shop}:`, error);
  }
}
*/

 