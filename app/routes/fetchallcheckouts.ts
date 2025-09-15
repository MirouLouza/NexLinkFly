// app/cron/fetchallcheckouts
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";


// Charger les données via graphql
export async function loader({ request }: LoaderFunctionArgs) {
  const auth = await authenticate.admin(request);
  
 
  const shop = auth.session.shop.replace(".myshopify.com", "");
  
  //console.log("💡 Shop reçu :", shop);
  
  
 
  
  let hasNextPage = true;
  let afterCursor: string | null = null;
  const allCheckouts: any[] = [];

  while (hasNextPage) {
    const query = `
      {
        abandonedCheckouts(first: 100${afterCursor ? `, after: "${afterCursor}"` : ""}) {
          edges {
            cursor
            node {
              id
              name
              abandonedCheckoutUrl
			  createdAt
              totalPriceSet {
                  presentmentMoney{amount
                  currencyCode}
                  }
               
              customer {
                firstName
                lastName
                email
                phone
              }
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
          pageInfo {
            hasNextPage
          }
        }
      }
    `;
	
 
    const response = await auth.admin.graphql(query);
    const jsonData = await response.json();

    const data = jsonData?.data?.abandonedCheckouts;

    if (!data) break;

    allCheckouts.push(...data.edges.map((e: any) => e.node));

    hasNextPage = data.pageInfo.hasNextPage;
    if (hasNextPage) {
      afterCursor = data.edges[data.edges.length - 1].cursor;
    }
  }

 

  //return json(allCheckouts);
  return json({ shop, allCheckouts });
}


export default function CheckoutsFetch() {
  const requestcheckout = useLoaderData<typeof loader>();
  const checkouts = requestcheckout.allCheckouts;
  const shop = requestcheckout.shop;
  
    return json ({ shop, checkouts });
  }
