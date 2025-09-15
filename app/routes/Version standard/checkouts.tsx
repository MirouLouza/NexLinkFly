// app/routes/checkouts.tsx
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, Text, BlockStack } from "@shopify/polaris";

// Remplace ceci par tes propres infos
const SHOP_DOMAIN = "nexlink0.myshopify.com";
const ACCESS_TOKEN = "b6fb84a0d0029a0a7deda0c97d232cc9-1746452054"; // ⚠️ Ne jamais exposer ce token côté client !

export const loader: LoaderFunction = async () => {
  const response = await fetch(`https://${SHOP_DOMAIN}/admin/api/2025-04/checkouts.json`, {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l’appel à l’API Shopify");
  }

  const data = await response.json();
  return json({ checkouts: data.checkouts });
};

export default function CheckoutsPage() {
  const { checkouts } = useLoaderData<typeof loader>();

  return (
    <Page title="Paniers abandonnés">
      <BlockStack gap="400">
        {checkouts.length === 0 && (
          <Text>Aucun panier abandonné trouvé.</Text>
        )}

        {checkouts.map((checkout: any) => (
          <Card key={checkout.id} padding="400">
            <Text variant="headingSm">
              Client : {checkout.customer?.first_name || "Inconnu"}
            </Text>
            <Text>Téléphone : {checkout.customer?.phone || "Non renseigné"}</Text>
            <Text>Produits :</Text>
            <ul>
              {checkout.line_items?.map((item: any, i: number) => (
                <li key={i}>{item.title} × {item.quantity}</li>
              ))}
            </ul>
            <Text as="a" url={checkout.abandoned_checkout_url} target="_blank">
              Voir le panier
            </Text>
          </Card>
        ))}
      </BlockStack>
    </Page>
  );
}
