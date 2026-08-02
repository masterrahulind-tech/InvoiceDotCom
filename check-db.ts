import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const client = await prisma.client.findFirst({ where: { name: 'NLIT EDU' } });
  if (!client) return console.log('Client not found');
  console.log('Client:', client.name, 'Opening Balance:', client.openingBalance, 'Type:', client.balanceType);
  const invoices = await prisma.invoice.findMany({ where: { clientId: client.id } });
  console.log('Invoices:');
  invoices.forEach(inv => console.log(inv.invoiceNo, inv.totalAmount, inv.paidAmount, inv.status));
  const txs = await prisma.partyTransaction.findMany({ where: { clientId: client.id } });
  console.log('Transactions:');
  txs.forEach(tx => console.log(tx.type, tx.amount, tx.invoiceId, tx.notes));
}
main().catch(console.error).finally(() => prisma.$disconnect());
