// app/lib/fetchAllCheckouts.ts
import { authenticate } from "../shopify.server"; // selon ton setup
import { shopifycron } from "../shopify.server";
import prisma from "../db.server";

export async function fetchAllCheckouts(session: Session) {

/*
console.log("➡️ Création client avec :", {
  shop: session.shop,
  token: session.accessToken,
});
*/

  const client = new shopifycron.clients.Graphql({   session: {
    shop:  session.shop,
    accessToken: session.accessToken  
  } });
 const shop = session.shop.replace(".myshopify.com", "");
  


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
      abandonedCheckoutUrl
      createdAt
      completedAt
      id
      name
      note
      subtotalPriceSet{
        shopMoney{
          amount
          currencyCode
        }
      } 
      totalPriceSet {
        presentmentMoney {
          amount
          currencyCode
        }
      }      
      lineItems(first: 10) {
        nodes {
          quantity
          title
          variantTitle
          originalUnitPriceSet{
            shopMoney{
              amount
              currencyCode
            }
          }
          originalTotalPriceSet{
             shopMoney{
              amount
              currencyCode
            }
          }
          discountedTotalPriceSet{
              shopMoney{
              amount
              currencyCode
            }
          }
          sku
          image{
            url
          }
          product{
            id
          }
        }
      }
      customer {
        firstName
        lastName
        numberOfOrders
        amountSpent{
          amount
          currencyCode
        }
		email
		phone
        displayName
      }
      billingAddress {
        firstName
        address1
        phone
        countryCodeV2
      }
      shippingAddress {
        firstName
        lastName
        phone
        address1
        address2
        city
        province
        provinceCode
        zip
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

    //const response = await session.admin.graphql(query);
	const res = await client.query({ data: query });
	const data = res.body.data.abandonedCheckouts;
    //const jsonData = await response.json();
    //const data = jsonData?.data?.abandonedCheckouts;

    if (!data) break;

    allCheckouts.push(...data.edges.map((e: any) => e.node));

    hasNextPage = data.pageInfo.hasNextPage;
    if (hasNextPage) {
      afterCursor = data.edges[data.edges.length - 1].cursor;
    }
  }
  
    // Template Dynamique
  const shopdomaine = session.shop;
  const messageConfig = await prisma.MessageConfig.findUnique({ where: { shop: 	shopdomaine } });
  //console.log("💡 messageConfig :", messageConfig);
  const brutMessage = messageConfig.message;

  return { brutMessage, shop, checkouts: allCheckouts };
}


export function sendWhatsAppMessage({
  name,
  customerName,
  phone,
  url,
  //checkId,
  shop,
  brutMessage,
  checkout
  
}: {
  name: string;
  phone: string;
  //country: string;
  url: string;
  //checkId: string;
}) {
  if (!phone ) {
    console.log(`Numéro manquant pour la commande : ${name}`);
     return
  }

  const formattedPhone = formatPhoneNumber(phone);
  const checkoutP = checkout;
  //alert("Numéro formaté :" + formattedPhone);
  
  //const produitList = produits?.join(", ") || "";


  //Message Dynamique
		  const transcoMessage = {
		  // Customer Variables
		  "customer.first_name": checkoutP.customer?.firstName || "Visitor",
		  "customer.last_name":  checkoutP.customer?.lastName || "Visitor",
		  "customer.email":  checkoutP.customer?.email,
		  "customer.phone":  checkoutP.customer?.phone,
		  "customer.orders_count": checkoutP.customer?.numberOfOrders,
		  "customer.total_spent": checkoutP.customer?.amountSpent.amount,
		  // Line Items (Products in Cart/Order)
		  "line_items.first.title": name, // A revoir
		  "line_item.title":  checkoutP.lineItems?.nodes?.[0]?.title,
		  "line_item.quantity":  checkoutP.lineItems?.nodes?.[0]?.quantity,
		  "line_item.price":  checkoutP.lineItems?.nodes?.[0]?.originalUnitPriceSet.shopMoney.amount,
		  "line_item.sku":  checkoutP.lineItems?.nodes?.[0]?.sku,
		  "line_item.variant_title": checkoutP.lineItems?.nodes?.[0]?.variantTitle,
		  "line_item.product_id": checkoutP.lineItems?.nodes?.[0]?.product.id,
		  "line_item.image": checkoutP.lineItems?.nodes?.[0]?.image.url,
		  // Shipping Address
		  "order.shipping_address.first_name": checkoutP.shippingAddress.firstName,
		  "order.shipping_address.last_name": checkoutP.shippingAddress.lastName,
		  "order.shipping_address.address1": checkoutP.shippingAddress.address1,
		  "order.shipping_address.city": checkoutP.shippingAddress.city,
		  "order.shipping_address.province": checkoutP.shippingAddress.province,
		  "order.shipping_address.zip": checkoutP.shippingAddress.zip,
		  "order.shipping_address.country": checkoutP.shippingAddress.country,
		  "order.shipping_address.phone": checkoutP.shippingAddress.phone,
		  // Billing Address
		  "order.billing_address.first_name": checkoutP.billingAddress.firstName,
		  "order.billing_address.address1": checkoutP.billingAddress.address1,
		  "order.billing_address.country": checkoutP.billingAddress.countryCodeV2,
		  "order.billing_address.phone": checkoutP.billingAddress.phone,
		  // Store Information
		  "shop.name": shop,
		  
		  // Abandoned Checkout
		  "checkout.abandoned_checkout_url": url,
		  "checkout_url": url, // A revoir
				//"checkout.line_items": checkoutP.lineItems?,
		  "checkout.line_items": Array.isArray(checkoutP.lineItems?.nodes)
				? checkoutP.lineItems.nodes.map((item) => `${item.title} x${item.quantity}`).join(", ")
					: ""
		  
		  // etc.
		  };
		  const netMessage = netTemplate(brutMessage, transcoMessage);
		  const netMessageWa = stripHtml(netMessage);

  //const message =  `Hello 👋 You left your cart, ${name}. Complete your order here: ${url}`; 
  const message = netMessageWa;

  // const message =  `Bonjour 👋Vous avez laissé le panier ${name}. Finalisez votre commande ici : <a href=${url}>Voir le panier</a>`
  
  //alert("message :" + message);  
   
  const BASE_URL = process.env.SHOPIFY_APP_URL || "http://localhost:3000";
  //const BASE_URL = "http://localhost:50868";

   //console.log("Avant fetch send url:", BASE_URL);

 fetch(`${BASE_URL}/send-whatsapp`, {
  method: "POST",
   headers: { "Content-Type": "application/json", "x-api-key": "NexLinkKey", Authorization: `Bearer NexLinkKey` },
 
   //body: "HELLO"
  body: JSON.stringify({ 
  //phone, message 
  chatId: formattedPhone, contentType: "string", content: message, shop, name: name
  }),
})
  .then(async (res) => {
    const contentType = res.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
	  //console.log("Retour Envoie data2:", res.ok);
	  
      if (res.ok) {
	    console.log("Message successfully sent:", res);
        //alert("✅ Message envoyé ! " );
      } else {
	    console.log("Sent Failed", res);
       // alert("❌ Erreur Donnée : " + res.ok);
      }
    } else {
      const text = await res.text();
      console.error("UNEXPECTED_RESPONSE : ", text);
      //alert("❌ Erreur : réponse non JSON");
    }
  })
  .catch((err) => {
    console.error("Fetch error:", err);
    //alert("❌ Échec de la requête : " + err.message);
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


// Récuprer le phone en bon format + priorité
export function getFormattedPhone(checkout: any): string | null {
  const customerPhone = checkout.customer?.phone;
  const billingPhone = checkout.billingAddress?.phone;
  const billingCountry = checkout.billingAddress?.countryCodeV2;
  const shippingPhone = checkout.shippingAddress?.phone;
  const shippingCountry = checkout.shippingAddress?.countryCodeV2;

  if (customerPhone) {
    return customerPhone.replace(/[^0-9]/g, ""); // Juste pour s'assurer qu'il est clean
  }

  if (billingPhone && billingCountry) {
    return formatPhone(billingPhone, billingCountry);
  }

  if (shippingPhone && shippingCountry) {
    return formatPhone(shippingPhone, shippingCountry);
  }

  return null; // Aucun numéro valide
}

  function formatPhone(phone: string, countryCode: string): string {
  const cleanedPhone = phone.replace(/[^0-9]/g, "");

  // Tu peux ajouter ici une map si tu veux un vrai indicatif à partir du pays
  const countryIndicatifMap: Record<string, string> = {
 AC: "247",
  AD: "376",
  AE: "971",
  AF: "93",
  AG: "1",
  AI: "1",
  AL: "355",
  AM: "374",
  AO: "244",
  AR: "54",
  AS: "1",
  AT: "43",
  AU: "61",
  AW: "297",
  AX: "358",
  AZ: "994",
  BA: "387",
  BB: "1",
  BD: "880",
  BE: "32",
  BF: "226",
  BG: "359",
  BH: "973",
  BI: "257",
  BJ: "229",
  BL: "590",
  BM: "1",
  BN: "673",
  BO: "591",
  BQ: "599",
  BR: "55",
  BS: "1",
  BT: "975",
  BW: "267",
  BY: "375",
  BZ: "501",
  CA: "1",
  CC: "61",
  CD: "243",
  CF: "236",
  CG: "242",
  CH: "41",
  CI: "225",
  CK: "682",
  CL: "56",
  CM: "237",
  CN: "86",
  CO: "57",
  CR: "506",
  CU: "53",
  CV: "238",
  CW: "599",
  CX: "61",
  CY: "357",
  CZ: "420",
  DE: "49",
  DJ: "253",
  DK: "45",
  DM: "1",
  DO: "1",
  DZ: "213",
  EC: "593",
  EE: "372",
  EG: "20",
  EH: "212",
  ER: "291",
  ES: "34",
  ET: "251",
  FI: "358",
  FJ: "679",
  FM: "691",
  FO: "298",
  FR: "33",
  GA: "241",
  GB: "44",
  GD: "1",
  GE: "995",
  GF: "594",
  GG: "44",
  GH: "233",
  GI: "350",
  GL: "299",
  GM: "220",
  GN: "224",
  GP: "590",
  GQ: "240",
  GR: "30",
  GT: "502",
  GU: "1",
  GW: "245",
  GY: "592",
  HK: "852",
  HM: "672",
  HN: "504",
  HR: "385",
  HT: "509",
  HU: "36",
  ID: "62",
  IE: "353",
  IL: "972",
  IM: "44",
  IN: "91",
  IO: "246",
  IQ: "964",
  IR: "98",
  IS: "354",
  IT: "39",
  JE: "44",
  JM: "1",
  JO: "962",
  JP: "81",
  KE: "254",
  KG: "996",
  KH: "855",
  KI: "686",
  KM: "269",
  KN: "1",
  KP: "850",
  KR: "82",
  KW: "965",
  KY: "1",
  KZ: "7",
  LA: "856",
  LB: "961",
  LC: "1",
  LI: "423",
  LK: "94",
  LR: "231",
  LS: "266",
  LT: "370",
  LU: "352",
  LV: "371",
  LY: "218",
  MA: "212",
  MC: "377",
  MD: "373",
  ME: "382",
  MF: "590",
  MG: "261",
  MH: "692",
  MK: "389",
  ML: "223",
  MM: "95",
  MN: "976",
  MO: "853",
  MP: "1",
  MQ: "596",
  MR: "222",
  MS: "1",
  MT: "356",
  MU: "230",
  MV: "960",
  MW: "265",
  MX: "52",
  MY: "60",
  MZ: "258",
  NA: "264",
  NC: "687",
  NE: "227",
  NF: "672",
  NG: "234",
  NI: "505",
  NL: "31",
  NO: "47",
  NP: "977",
  NR: "674",
  NU: "683",
  NZ: "64",
  OM: "968",
  PA: "507",
  PE: "51",
  PF: "689",
  PG: "675",
  PH: "63",
  PK: "92",
  PL: "48",
  PM: "508",
  PN: "64",
  PR: "1",
  PS: "970",
  PT: "351",
  PW: "680",
  PY: "595",
  QA: "974",
  RE: "262",
  RO: "40",
  RS: "381",
  RU: "7",
  RW: "250",
  SA: "966",
  SB: "677",
  SC: "248",
  SD: "249",
  SE: "46",
  SG: "65",
  SH: "290",
  SI: "386",
  SJ: "47",
  SK: "421",
  SL: "232",
  SM: "378",
  SN: "221",
  SO: "252",
  SR: "597",
  SS: "211",
  ST: "239",
  SV: "503",
  SX: "1",
  SY: "963",
  SZ: "268",
  TC: "1",
  TD: "235",
  TG: "228",
  TH: "66",
  TJ: "992",
  TK: "690",
  TL: "670",
  TM: "993",
  TN: "216",
  TO: "676",
  TR: "90",
  TT: "1",
  TV: "688",
  TW: "886",
  TZ: "255",
  UA: "380",
  UG: "256",
  US: "1",
  UY: "598",
  UZ: "998",
  VA: "39",
  VC: "1",
  VE: "58",
  VG: "1",
  VI: "1",
  VN: "84",
  VU: "678",
  WF: "681",
  WS: "685",
  YE: "967",
  YT: "262",
  ZA: "27",
  ZM: "260",
  ZW: "263"
  };

  const indicatif = countryIndicatifMap[countryCode.toUpperCase()] || "";

  // Optionnel : s'assurer que le numéro est bien dans le format attendu
  // Ex : 2126XXXXXXX => 9 chiffres après l'indicatif
  const numberPart = cleanedPhone.startsWith("0")
    ? cleanedPhone.slice(1)
    : cleanedPhone;

  return indicatif + numberPart;
}



 function netTemplate(brutMessage, transcoMessage) {
  return brutMessage.replace(/\{\{\s*(.*?)\s*\}\}/g, (_, key) => {
    return transcoMessage[key] || "";
  });
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')        // <br> or <br/> → newline
    .replace(/<\/p>/gi, '\n')             // </p> → newline
    .replace(/<p[^>]*>/gi, '')            // remove <p> tags
    .replace(/<[^>]+>/g, '')              // remove all other HTML tags
    .replace(/&nbsp;/gi, ' ')             // convert &nbsp; to space
    .replace(/\r?\n\s*\r?\n/g, '\n')      // clean multiple newlines
    .trim();
}