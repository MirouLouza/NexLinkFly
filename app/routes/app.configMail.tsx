import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from 'react';
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import EmojiPicker from 'emoji-picker-react';
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

import 'react-quill/dist/quill.snow.css';


const availableVariables = [
  // Customer Variables
  { label: "First name of the customer", value: "{{ customer.first_name }}" },
  { label: "Last name of the customer", value: "{{ customer.last_name }}" },
  { label: "Email address", value: "{{ customer.email }}" },
  { label: "Phone number", value: "{{ customer.phone }}" },
  { label: "Number of previous orders", value: "{{ customer.orders_count }}" },
  { label: "Total amount spent by customer", value: "{{ customer.total_spent }}" },

  // Order Variables
  /*
  { label: "Order name (e.g. #1001)", value: "{{ order.name }}" },
  { label: "Internal order ID", value: "{{ order.id }}" },
  { label: "Total order amount", value: "{{ order.total_price }}" },
  { label: "Price before shipping & taxes", value: "{{ order.subtotal_price }}" },
  { label: "Shipping cost", value: "{{ order.total_shipping_price_set.shop_money.amount }}" },
  { label: "Currency code (e.g. USD, MAD)", value: "{{ order.currency }}" },
  { label: "Date order was created", value: "{{ order.created_at }}" },
  { label: "Payment status (paid, pending, etc.)", value: "{{ order.financial_status }}" },
  { label: "Fulfillment status", value: "{{ order.fulfillment_status }}" },
  { label: "Note added to the order", value: "{{ order.note }}" },
  { label: "Checkout link for abandoned order", value: "{{ order.checkout_url }}" },
  */

  // Line Items (Products in Cart/Order)
  { label: "Product title", value: "{{ line_item.title }}" },
  { label: "Quantity ordered", value: "{{ line_item.quantity }}" },
  { label: "Price per unit", value: "{{ line_item.price }}" },
  { label: "SKU code", value: "{{ line_item.sku }}" },
  { label: "Variant name (if any)", value: "{{ line_item.variant_title }}" },
  { label: "Product ID", value: "{{ line_item.product_id }}" },
  { label: "Product image", value: "{{ line_item.image | img_url: 'small' }}" },

  // Shipping Address
  { label: "First name", value: "{{ order.shipping_address.first_name }}" },
  { label: "Last name", value: "{{ order.shipping_address.last_name }}" },
  { label: "Street address", value: "{{ order.shipping_address.address1 }}" },
  { label: "City", value: "{{ order.shipping_address.city }}" },
  { label: "State/Province", value: "{{ order.shipping_address.province }}" },
  { label: "ZIP/Postal Code", value: "{{ order.shipping_address.zip }}" },
  { label: "Country", value: "{{ order.shipping_address.country }}" },
  { label: "Phone number", value: "{{ order.shipping_address.phone }}" },

  // Billing Address
  { label: "First name", value: "{{ order.billing_address.first_name }}" },
  { label: "Street address", value: "{{ order.billing_address.address1 }}" },
  { label: "Country", value: "{{ order.billing_address.country }}" },
  { label: "Phone number", value: "{{ order.billing_address.phone }}" },

  // Store Information
  { label: "Store name", value: "{{ shop.name }}" },
  { label: "Store email", value: "{{ shop.email }}" },
  { label: "Store domain", value: "{{ shop.domain }}" },
  { label: "Store URL", value: "{{ shop.url }}" },

  // Abandoned Checkout
  { label: "Recovery link", value: "{{ checkout.abandoned_checkout_url }}" },
  { label: "Products left in cart", value: "{{ checkout.line_items }}" }
	//{ label: "Customer email", value: "{{ checkout.email }}" },

	/*
  // Fulfillment/Shipping Tracking
  { label: "Tracking number", value: "{{ fulfillment.tracking_number }}" },
  { label: "Tracking URL", value: "{{ fulfillment.tracking_url }}" },
  { label: "Shipping carrier (e.g. DHL)", value: "{{ fulfillment.tracking_company }}" }
  */
];




export async function loader({ request }: LoaderFunctionArgs) {

   const { session } = await authenticate.admin(request);
   const shop = session.shop

   if (!shop) return json({ error: "Missing shop parameter" });

  const config = await prisma.MessageConfig.findUnique({
    where: { shop },
  });

		 return json({ shop,
		  initialMessage: config?.message || "",
		  defaultMes: config?.defaultMes || "",
		});
}

export async function action({ request }: ActionFunctionArgs) {

   const { session } = await authenticate.admin(request);
   const shop = session.shop
   
  const formData = await request.formData();
  //const shop = new URL(request.url).searchParams.get("shop");
  console.log(" URL(request.url).searchParams.get :", shop);
  const message = formData.get("message")?.toString() || "";

  await prisma.MessageConfig.upsert({	
    where: { shop },
    update: { message },
    create: { shop, message,
				defaultMes: "<p>Hey {{ customer.first_name }}! 👋&nbsp;&nbsp;</p><p>You left your cart, {{ line_items.first.title }} is almost gone 😱</p><p><br></p><p>We saved it in your cart, but it won’t last forever…&nbsp;&nbsp;</p><p>Finish your order now and don’t miss out 🛒💨</p><p><br></p><p>👉 Complete your order here: {{ checkout_url }}</p><p><br></p><p>Need help? Just reply—we're here for you 💬</p>"
	},
  });

  return json({ success: true, message: "Message updated successfully" });

}

export default function ConfigMail() {
  const { shop, initialMessage, defaultMes } = useLoaderData<typeof loader>();
  const [message, setMessage] = useState(initialMessage);
	let defaultMesP = defaultMes;
		if (!defaultMesP) {
		  defaultMesP = "<p>Hey {{ customer.first_name }}! 👋&nbsp;&nbsp;</p><p>You left your cart,  {{ line_item.title }} is almost gone 😱</p><p><br></p><p>We saved it in your cart, but it won’t last forever…&nbsp;&nbsp;</p><p>Finish your order now and don’t miss out 🛒💨</p><p><br></p><p>👉 Complete your order here: {{ checkout_url }}</p><p><br></p><p>Need help? Just reply—we're here for you 💬</p>"
			}

  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  
  const actionData = useActionData<typeof action>();

	useEffect(() => {
	  if (actionData?.success) {
		setNotice(actionData.message);
		setTimeout(() => setNotice(""), 3000); // Efface après 3 secondes
	  }
	}, [actionData]);

const groupedVariables = [
  {
    category: "Customer",
    variables: availableVariables.filter(v => v.value.includes("customer.")),
  },
 
  {
    category: "Line Items",
    variables: availableVariables.filter(v => v.value.includes("line_item.")),
  },
  {
    category: "Shipping Address",
    variables: availableVariables.filter(v => v.value.includes("order.shipping_address")),
  },
  {
    category: "Billing Address",
    variables: availableVariables.filter(v => v.value.includes("order.billing_address")),
  },
  {
    category: "Store Information",
    variables: availableVariables.filter(v => v.value.includes("shop.")),
  },
  {
    category: "Abandoned Checkout",
    variables: availableVariables.filter(v => v.value.includes("checkout.")),
  },
 
];

// Filtre les variables selon la recherche
const filteredGroups = groupedVariables
  .map(group => ({
    ...group,
    variables: group.variables.filter(v =>
      v.label.toLowerCase().includes(search.toLowerCase())
    ),
  }))
  .filter(group => group.variables.length > 0);


  const insertVariable = (value: string) => {
    setMessage((prev) => prev + value);
  };

  return (
   <Page title=" 📬 Messaging Parameter">
    <BlockStack gap="500">
       



<Card padding="400">
  <TextField
    label="Search Shopify Dynamic Variables Reference"
    value={search}
    onChange={(value) => setSearch(value)}
    autoComplete="off"
  />

  <div className="mt-4 space-y-6">
    {filteredGroups.map(group => (
      <div key={group.category}>
        <Text as="h3" variant="headingSm" tone="subdued" className="mb-2">
          {group.category}
        </Text>
        <div className="flex flex-wrap gap-2">
          {group.variables.map(v => (
            <button
              key={v.value}
              type="button"
              className="bg-gray-100 text-sm px-1 py-1 rounded hover:bg-teal-100"
              onClick={() => insertVariable(v.value)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
</Card>

	  	{notice && (
  <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
    ✅ {notice}
  </div>
)}

			<Card padding="400">
			<Form method="post">
			  <ClientOnlyReactQuill value={message} onChange={setMessage} />

			  <input type="hidden" name="message" value={message} />

			  {defaultMesP && (
					<button
					  type="button"
					  onClick={() => {
						setMessage(defaultMesP);
						setNotice("Message reset to default successfully");
						setTimeout(() => setNotice(""), 3000);
					  }}
					  className="mt-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200"
					>
					  🔁 Reset with default message
					</button>
			  )}

			  <button
				type="submit"
				className="mt-4 bg-black text-white px-4 py-2 rounded"
			  >
				Save
			  </button>
			</Form>
			</Card>

	  
     </BlockStack>
	 </Page>


  );
}


export   function ClientOnlyReactQuill({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [ReactQuill, setReactQuill] = useState<any>(null);

  useEffect(() => {
    import("react-quill").then((mod) => {
      setReactQuill(() => mod.default);
    });
  }, []);

  if (!ReactQuill) return <div>Chargement de l’éditeur…</div>;

  return <ReactQuill value={value} onChange={onChange} />;
}