// app/routes/checkouts.tsx
 import { json, LoaderFunction } from "@remix-run/node";  
 import { useLoaderData } from "@remix-run/react";
import { Box, Page, Card, Layout, Text, List, BlockStack } from "@shopify/polaris"; // Polaris pour le style
import { authenticate } from "~/shopify.server"; // ou l'import selon ton projet


const response = await fetch('https://nexlink0.myshopify.com/admin/api/2025-04/graphql.json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      {
        abandonedCheckouts(first: 5) {
          edges {
            node {
              name
              customer {
                firstName
                lastName
                email
              }
            }
          }
        }
      }
    `,
  }),
});
