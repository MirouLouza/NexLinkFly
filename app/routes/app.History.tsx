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
import { authenticate } from "../shopify.server";
import { json, LoaderFunctionArgs } from "@remix-run/node";

 
export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  //console.error("❌❌❌❌❌❌ session :", session);
  return json({ shop: session.shop });
} 

export default function Index() {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const  shop = useLoaderData<typeof loader>();
   // 1. sessionId statique ou dynamique  
  //const sessionId = "Test";
    const sessionId = shop.shop.replace(".myshopify.com", "");

 
 
const ITEMS_PER_PAGE = 7;

 
  const [logs, setLogs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

useEffect(() => {
  fetch("/LogSend")
    .then((res) => res.json())
    .then((data) => {
      const now = new Date();
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(now.getMonth() - 2); // Ne pas selectionner l'histo < 2 mois
		//console.log(`🚀  Fetch  LogSend?shop=${sessionId}`);
		
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
      console.error("❌ Error fetch logs :", err);
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
         🛒 View Order
      </a>
    ) : (
      "Link Not found"
    ),
	 
  ]}
  ); 
  
  /*
    const rows = paginatedLogs.map((log: any) => [
    log.chatId || log.resreq?.chatId.replace("@c.us", "") || "N/A",
    new Date(log.sentAt).toLocaleString(),
  ]);
  */
 
 
// CLEAN log
 
const [days, setDays] = useState("60");
 
const handleCleanLogs = async () => {
  if (!window.confirm(`Delete logs > ${days} days ?`)) return;

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
	console.log("🧹 Data after cleanup:", data);
    if (data.success) {
      alert(`✅ ${data.remaining} logs restants`);
     // window.location.reload(); // ou re-fetch logs
    } else {
      alert("❌ Failed to clean data");
    }
  } catch (err) {
    alert("❌ Server connection failed");
  } finally {
    setLoading(false);
  }
};

 


// PAGE ADD
  return (
    <Page title="📋 Log rotation and archiving settings">
      <BlockStack gap="500">
	  
	<Card title="🗑️ Clear logs">
  <InlineStack gap="200" align="center">
    <TextField
      label="🔢 Days to retain logs:"
      type="number"
      value={days}
      onChange={setDays}
      autoComplete="off"
      min={1}
	  style={{ maxWidth: 80 }}
    />
    <Button onClick={handleCleanLogs} loading={loading} tone="critical" size="slim">
      🗑️ Clear logs
    </Button>
  </InlineStack>
</Card>
 	
   <Card title="📊 WhatsApp Message History">
   <Text as="p">📊 WhatsApp Message History</Text>
      <DataTable
        columnContentTypes={["text", "text"]}
        headings={["📱 Chat-Id", "⏱️ Timestamp", "🔗 URL"]}
        rows={rows}
      />

      <BlockStack gap="200" alignment="center">
        <InlineStack gap="200">
          <Button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ⬅ Previous
          </Button>
          <Text>
            Page {currentPage + 1} / {totalPages}
          </Text>
          <Button
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next ➡
          </Button>
        </InlineStack>

        <Text tone="subdued">
          Total messages sent : {logs.length}
        </Text>
      </BlockStack>
    </Card>
		
		
 
      </BlockStack>
    </Page>
  );
}



