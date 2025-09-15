// app/routes/frequency.tsx
import { json, redirect } from "@remix-run/node";
import prisma from "../db.server";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { useActionData } from "@remix-run/react";
import { useState } from 'react';



 import {
  Page, Layout,
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
  
export async function loader({ request }: any) {
   const { session } = await authenticate.admin(request);
   const shop = session.shop

  if (!shop) return json({ error: "Missing shop parameter" });

  const frequency = await prisma.frequency.findUnique({ where: { shop } });
  return json({ frequency, shop });
}

export const action = async ({ request }) => {
  try {
    const form = await request.formData();
    const shop = form.get("shop") as string;
    const time = form.get("time") as string;
    const days = form.getAll("days") as string[];
    const useInterval = form.get("useInterval") === "on"; // "on" quand la checkbox est cochée
    const intervalHours = form.get("intervalHours") as string;
	//const [useInterval, setUseInterval] = useState(frequency?.useInterval || false);



    if (!shop || !time || days.length === 0) {
      return json({ error: "🔴 Missing required fields." }, { status: 400 });
    }

    // Validation de l'intervalle si useInterval est coché
    if (useInterval) {
      const interval = parseInt(intervalHours);
      if (isNaN(interval)) {
        return json({ error: "❌❌ Please enter a valid interval." }, { status: 400 });
      }
      if (interval < 2 || interval > 24) {
        return json({ error: "❌❌ Interval must be between 2 and 24 hours." }, { status: 400 });
      }
    }
	
 
	const planOption = await prisma.PlanOption.findUnique({ where: { shop: shop } });
    await prisma.frequency.upsert({
      where: { shop },
      update: { 
        time, 
        days: days.join(","),
        useInterval,
        intervalHours: useInterval ? parseInt(intervalHours) : null,
		maxReminders: (planOption?.maxReminders ?? 20) - (planOption?.cptReminders ?? 0)
      },
      create: { 
        shop, 
        time, 
        days: days.join(","),
        useInterval,
        intervalHours: useInterval ? parseInt(intervalHours) : null,
        maxReminders: (planOption?.maxReminders ?? 20) - (planOption?.cptReminders ?? 0) //20 // Valeur par défaut
      },
    });

    return json({ success: true });
  } catch (error) {
    console.error("❌ Failed to save changes", error);
    return json({ success: false, error: "Failed to save changes" });
  }
};


export default function FrequencyForm() {
  const frequencyshop = useLoaderData<typeof loader>();
  console.log(" frequencyshop :", frequencyshop);
  
  const frequency = frequencyshop.frequency;
  const shop = frequencyshop.shop;
  const actionData = useActionData();
  const [useInterval, setUseInterval] = useState(frequency?.useInterval || false);


  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const selectedDays = frequency?.days?.split(",") || [];

/*
  return (
      <Page title="Configuring relaunch">
		<Card padding="400">
    <div className="p-4 max-w-md mx-auto">
 
      {actionData?.error && <p className="text-red-500">{actionData.error}</p>}

      <Form method="post" className="space-y-4">
        <input type="hidden" name="shop" value={shop || "example.myshopify.com"} />
		
       
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="useInterval"
                  defaultChecked={frequency?.useInterval || false}
                  className="form-checkbox"
                />
                <span className="font-medium">Utiliser un intervalle entre les relances</span>
              </label>
				<p></p>
              <label className="block">
                Intervalle entre les relances (heures)
                <input
                  type="number"
                  name="intervalHours"
                  min="1"
                  max="24"
                  defaultValue={frequency?.intervalHours || ""}
                  className="w-full mt-1 border px-2 py-1 rounded"
                  placeholder="Ex: 2 pour 2 heures"
                 />
              </label>
            </div>		
			<p></p>
			<p></p>
			<p></p>
			<p></p>

        <label className="block">
          Heure de lancement (HH:MM)
          <input
            type="time"
            name="time"
            defaultValue={frequency?.time || ""}
            className="w-full mt-1 border px-2 py-1 rounded"
            required
          />
        </label>

        <fieldset>
          <legend className="font-semibold mb-1">Jours</legend>
          <div className="grid grid-cols-2 gap-2">
            {daysOfWeek.map((day) => (
              <label key={day} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="days"
                  value={day}
                  defaultChecked={selectedDays.includes(day)}
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Sauvegarder
        </button>
      </Form>
	  
	   {actionData?.success && (
        <p className="text-green-600 mt-4">✅ Paramètres enregistrés avec succès.</p>
      )}
      {actionData?.success === false && (
        <p className="text-red-600 mt-4">❌ {actionData.error}</p>
      )}
	  

 
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="font-medium text-blue-800">
              Votre nombre ou solde de relance autorisé est {frequency?.maxReminders || 10} !
            </p>
            <p className="text-blue-600 mt-1">
              Ceci représente le nombre maximum de relances que vous pouvez effectuer.
            </p>
          </div>
	  
    </div>
	</Card>	  
     </Page>
  );
}
*/
 
  return (
    <Page title=" ⚙️ Configure reminders">
      <Card padding="400">
        <div className="p-4 max-w-md mx-auto space-y-8"> {/* Espacement global augmenté */}
          
          {actionData?.error && <p className="text-red-500">{actionData.error}</p>}

          <Form method="post" className="space-y-8"> {/* Espacement entre sections */}
            <input type="hidden" name="shop" value={shop || "example.myshopify.com"} />

             {/* Section Intervalle - Encadrée */}
            <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
				<h3 className="text-lg font-medium mb-4" style={{ fontWeight: 'bold', color: '#11c663' }}>🔧 Configuring automated reminders</h3>
             
			  <div className="grid grid-cols-2 gap-4">
			  <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="useInterval"
                    checked={useInterval}
                    onChange={(e) => setUseInterval(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="font-medium">⏳ Configure follow-up timing</span>
                </label>
				</div>
					
					<div>
                   <label className="block">
                    <span className="text-sm font-medium text-gray-700" style={{ marginLeft: '1cm' }}>Hours between reminders (HH: </span>
                    <input
                      type="number"
                      name="intervalHours"
                      min="2"
                      max="24"
                      defaultValue={frequency?.intervalHours || ""}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        !useInterval ? 'bg-gray-100' : ''
                      } ${
                        actionData?.fieldErrors?.intervalHours ? 'border-red-500' : 'border'
                      }`}
                      disabled={!useInterval}
                    />
                    {actionData?.fieldErrors?.intervalHours && (
                      <p className="mt-1 text-sm text-red-600">
                        {actionData.fieldErrors.intervalHours}
                      </p>
                    )}
                  </label>
				    </div>
				   
               </div>
            </div>
			
			<p className="my-10">&nbsp;</p>
			            <p className="font-medium text-blue-800" style={{ fontWeight: 'bold', color: '#059ba5' }}>
				⚠️ Important:Use either follow_up_timing OR scheduled_time parameters
			 </p>
			 <p className="my-10">&nbsp;</p>
            {/* Section Jours - Encadrée */}
            <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
              <h3 className="text-lg font-medium mb-4" style={{ fontWeight: 'bold', color: '#11c663' }}>⏰ Reminder scheduling</h3>
              
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">⏳ Scheduled time (HH:MM) : </span>
                  <input
                    type="time"
                    name="time"
                    defaultValue={frequency?.time || ""}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </label>

                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-gray-700">Reminder days</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {daysOfWeek.map((day) => (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="days"
                          value={day}
                          defaultChecked={selectedDays.includes(day)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>

			<div className="my-12"></div>
			<div className="my-12"></div>
			
			<p className="my-10">&nbsp;</p>  
            {/* Bouton de soumission */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </Form>
 
          {/* Messages de statut */}
          {actionData?.success && (
            <div className="rounded-md bg-green-50 p-4 mt-4">
              <p className="text-sm font-medium text-green-800">
                ✅ Settings saved successfully
              </p>
            </div>
          )}
          
		  <p className="my-10">&nbsp;</p>
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">

			<p className="font-medium text-blue-800" style={{ fontWeight: 'bold', color: '#059ba5' }}> 
				Your authorized reminder balance is {frequency?.maxReminders || 20} !
            </p>
            <p className="text-blue-600 mt-1" style={{ fontWeight: 'bold', color: '#059ba5' }}>
              🔄 Need more? Upgrade now in Billing Management
            </p>
          </div>
		  
        </div>
      </Card>
    </Page>
  );
}
