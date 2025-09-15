import { useEffect, useState } from "react";
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

import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { json, LoaderFunctionArgs } from "@remix-run/node";


export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  //console.error("❌❌❌❌❌❌ session :", session);
  return json({ shop: session.shop });
} 


export default function Packages() {

  const  shop = useLoaderData<typeof loader>();
  const shopDomain = shop.shop.replace(".myshopify.com", "");
 
  	
   return (
    <Page title=" ⚡ Subscribe now →  Efficiently manage abandoned orders 🚀✨ " >
	<BlockStack gap="500">
 	 
 
					 <Button
					  variant="primary"
					  onClick={() => {
						window.open(`https://admin.shopify.com/store/${shopDomain}/charges/nexlink/pricing_plans`, '_blank');
					  }}
					 >
							Level up! Upgrade your package now 💎
					</Button>	
				
  
		
	  </BlockStack>
     </Page>
  );
}