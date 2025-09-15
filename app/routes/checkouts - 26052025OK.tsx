// app/routes/checkouts.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

import {
  Page,
  Layout,
  Card,
  Text,
  IndexTable,
  Link,
  useIndexResourceState,
} from "@shopify/polaris";

// Charger les données (mockées ici)
export async function loader({ request }: LoaderFunctionArgs) {
  const auth = await authenticate.admin(request);
    
   
  const response = await auth.admin.graphql(`
    {
      abandonedCheckouts(first: 5) {
        edges {
          node {
            id
            name
            customer {
              firstName
              lastName
              email
			  phone
 
			  
            } 
			abandonedCheckoutUrl
			
			
			billingAddress {
				phone
				countryCodeV2
			}
			shippingAddress {
				phone
				countryCodeV2
			}
			
			
          }
        }
      }
    }
  `);

  const jsonData = await response.json();
  return json(jsonData?.data?.abandonedCheckouts?.edges || []);
}

export default function CheckoutsPage() {
  const checkouts = useLoaderData<typeof loader>();
  //console.log (checkouts);
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(checkouts);

  return (
    <Page title="Paniers abandonnés">
      <Layout>
        <Layout.Section>
          <Card>
            <IndexTable
              resourceName={{ singular: "checkout", plural: "checkouts" }}
              itemCount={checkouts.length}
              selectedItemsCount={
                allResourcesSelected ? "All" : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: "Nom" },
                { title: "Client" },
                { title: "Email" },
				{ title: "Phone" },
				{ title: "Check/Envoie" },
              ]}
            >
              {checkouts.map(({ node }, index) => (
                <IndexTable.Row
                  id={node.id}
                  key={node.id}
                  selected={selectedResources.includes(node.id)}
                  position={index}
                >
                  <IndexTable.Cell>{node.name}</IndexTable.Cell>
                  <IndexTable.Cell>
                    {node.customer?.firstName} {node.customer?.lastName}
                  </IndexTable.Cell>
                  <IndexTable.Cell>{node.customer?.email}</IndexTable.Cell>
				  <IndexTable.Cell>{node.customer?.phone}</IndexTable.Cell>

				  <IndexTable.Cell>
				  
				    <Link
                     url={node.abandonedCheckoutUrl}
                 
                   >
                     Voir
                   </Link>
				   
				   <button
				   
				       onClick={() =>
                       sendWhatsAppMessage({
                         name: node.name,
                         phone: node.customer?.phone,
                         url: node.abandonedCheckoutUrl 
                          
                       })
                     }
				       style={{
						backgroundColor: "#25D366",
						color: "white",
						border: "none",
						borderRadius: 4,
						padding: "4px 8px",
						cursor: "pointer",
						}}
						>
						WhatsApp
				   </button>
				  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function sendWhatsAppMessage({
  name,
  phone,
  url
  
}: {
  name: string;
  phone: string;
  //country: string;
  url: string;
  //produits: string[];
}) {
  if (!phone ) {
    alert("Numéro ou pays manquant" + phone );
     return
  }

  const formattedPhone = formatPhoneNumber(phone);
  alert("Numéro formaté :" + formattedPhone);
  
  //const produitList = produits?.join(", ") || "";

  const message =  `Bonjour 👋Vous avez laissé le panier ${name}. Finalisez votre commande ici : ${url}`
  
  alert("message :" + message);  
   
 fetch("/send-whatsapp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  //Authorization: `Bearer NexLinkKey`,
   //body: "HELLO"
  body: JSON.stringify({ 
  //phone, message 
  chatId: formattedPhone, contentType: "string", content: message
  }),
})
  .then(async (res) => {
    const contentType = res.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (res.ok) {
        alert("✅ Message envoyé ! Instance ID : " + data.instance_id);
      } else {
        alert("❌ Erreur : " + data.error);
      }
    } else {
      const text = await res.text();
      console.error("Réponse inattendue : ", text);
      alert("❌ Erreur : réponse non JSON");
    }
  })
  .catch((err) => {
    console.error("Fetch error:", err);
    alert("❌ Échec de la requête : " + err.message);
  });


}

function formatPhoneNumber(phone: string): string {
  // Supprimer tous les caractères non numériques sauf +
  let cleaned = phone.trim();

  // Supprimer le "+" s'il est au début
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  return `${cleaned}@c.us`;
}