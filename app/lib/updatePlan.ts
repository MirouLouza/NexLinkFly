// Dans vos actions serveur
import prisma from "../db.server";

export async function incrementCounter(shop: string) {
 
  return await prisma.planOption.update({
    where: { shop },
    data: { cptTestSend: { increment: 1 } }
  });
 }