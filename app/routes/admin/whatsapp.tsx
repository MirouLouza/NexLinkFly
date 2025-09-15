// app/routes/admin/whatsapp.tsx

import { useEffect, useState } from "react";

export default function WhatsappSession() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const sessionId = "shopify-session";

  useEffect(() => {
    // Étape 1 : Démarrer la session
    fetch(`http://localhost:3000/session/start/${sessionId}`, {
      method: "POST",
    })
      .then(() => {
        // Étape 2 : Afficher le QR code après un délai
        setTimeout(() => {
          setQrUrl(`http://localhost:3000/session/qr/${sessionId}/image`);
        }, 1000);
      })
      .catch((err) => {
        console.error("Erreur lors du démarrage de la session:", err);
      });

    // Optionnel : Ajouter un polling pour vérifier si la session est connectée
    const interval = setInterval(() => {
      fetch(`http://localhost:3000/session/status/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.connected) {
            setConnected(true);
            clearInterval(interval);
          }
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1 className="text-xl font-bold mb-4">Connexion à WhatsApp</h1>
      {connected ? (
        <p className="text-green-600">✅ WhatsApp connecté !</p>
      ) : qrUrl ? (
        <>
          <p className="mb-2">Scannez le QR code ci-dessous avec WhatsApp :</p>
          <img src={qrUrl} alt="QR Code WhatsApp" className="rounded shadow-lg" />
        </>
      ) : (
        <p>Démarrage de la session en cours...</p>
      )}
    </div>
  );
}
