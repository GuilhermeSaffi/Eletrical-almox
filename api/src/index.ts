import express, { Request, Response } from "express";
import { PrismaClient, MovementType, OrderStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Basic health
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

// Ensure an admin exists for first login
async function ensureSeed() {
  const adminEmail = "admin@local";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: { name: "Administrador", email: adminEmail, passwordHash, role: UserRole.ADMIN }
    });
  }
}
ensureSeed().catch(console.error);

// Auth (demo)
app.post("/api/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ ok: false, error: "email e password são obrigatórios" });

  const user = await prisma.user.findUnique({ where: { email: String(email) } });
  if (!user) return res.status(401).json({ ok: false, error: "Credenciais inválidas" });

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ ok: false, error: "Credenciais inválidas" });

  return res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Categories
app.get("/api/categories", async (_req: Request, res: Response) => {
  const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(rows);
});

app.post("/api/categories", async (req: Request, res: Response) => {
  const { name, description } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "name é obrigatório" });
  const created = await prisma.category.create({ data: { name: String(name), description: description ? String(description) : null } });
  res.status(201).json(created);
});

// Items
app.get("/api/items", async (_req: Request, res: Response) => {
  const rows = await prisma.inventoryItem.findMany({ orderBy: { name: "asc" } });
  res.json(rows.map(r => ({
    id: r.id,
    name: r.name,
    sku: r.sku,
    categoryId: r.categoryId,
    quantity: r.quantity,
    minQuantity: r.minQuantity,
    price: Number(r.price),
    lastUpdated: r.lastUpdated.toISOString(),
  })));
});

app.post("/api/items", async (req: Request, res: Response) => {
  const b = req.body ?? {};
  const required = ["name","sku","categoryId","quantity","minQuantity","price"];
  for (const k of required) if (b[k] === undefined || b[k] === null || b[k] === "") {
    return res.status(400).json({ error: `${k} é obrigatório` });
  }
  const created = await prisma.inventoryItem.create({
    data: {
      name: String(b.name),
      sku: String(b.sku),
      categoryId: String(b.categoryId),
      quantity: Number(b.quantity),
      minQuantity: Number(b.minQuantity),
      price: String(b.price),
    }
  });
  res.status(201).json({
    id: created.id,
    name: created.name,
    sku: created.sku,
    categoryId: created.categoryId,
    quantity: created.quantity,
    minQuantity: created.minQuantity,
    price: Number(created.price),
    lastUpdated: created.lastUpdated.toISOString(),
  });
});

app.put("/api/items/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const b = req.body ?? {};
  const updated = await prisma.inventoryItem.update({
    where: { id },
    data: {
      name: b.name !== undefined ? String(b.name) : undefined,
      sku: b.sku !== undefined ? String(b.sku) : undefined,
      categoryId: b.categoryId !== undefined ? String(b.categoryId) : undefined,
      quantity: b.quantity !== undefined ? Number(b.quantity) : undefined,
      minQuantity: b.minQuantity !== undefined ? Number(b.minQuantity) : undefined,
      price: b.price !== undefined ? String(b.price) : undefined,
    }
  });
  res.json({
    id: updated.id,
    name: updated.name,
    sku: updated.sku,
    categoryId: updated.categoryId,
    quantity: updated.quantity,
    minQuantity: updated.minQuantity,
    price: Number(updated.price),
    lastUpdated: updated.lastUpdated.toISOString(),
  });
});

app.delete("/api/items/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.inventoryItem.delete({ where: { id } });
  res.status(204).send();
});

// Users
app.get("/api/users", async (_req: Request, res: Response) => {
  const rows = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  res.json(rows.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
});

app.post("/api/users", async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body ?? {};
  if (!name || !email || !password) return res.status(400).json({ error: "name, email e password são obrigatórios" });
  const passwordHash = await bcrypt.hash(String(password), 10);
  const created = await prisma.user.create({
    data: { name: String(name), email: String(email), passwordHash, role: role === "ADMIN" ? UserRole.ADMIN : UserRole.USER }
  });
  res.status(201).json({ id: created.id, name: created.name, email: created.email, role: created.role });
});

app.put("/api/users/:id/password", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.body ?? {};
  if (!password) return res.status(400).json({ error: "password é obrigatório" });
  const passwordHash = await bcrypt.hash(String(password), 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  res.json({ ok: true });
});

// Movements (also update stock)
app.get("/api/movements", async (_req: Request, res: Response) => {
  const rows = await prisma.productMovement.findMany({ orderBy: { createdAt: "desc" } });
  res.json(rows.map(m => ({
    id: m.id, itemId: m.itemId, type: m.type, quantity: m.quantity, reason: m.reason, createdAt: m.createdAt.toISOString()
  })));
});

app.post("/api/movements", async (req: Request, res: Response) => {
  const { itemId, type, quantity, reason } = req.body ?? {};
  if (!itemId || !type || quantity === undefined) return res.status(400).json({ error: "itemId, type, quantity são obrigatórios" });
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ error: "quantity inválido" });

  const movType = type === "EXIT" ? MovementType.EXIT : MovementType.ENTRY;

  // Update stock atomically
  const item = await prisma.inventoryItem.findUnique({ where: { id: String(itemId) } });
  if (!item) return res.status(404).json({ error: "Item não encontrado" });

  const newQty = movType === MovementType.ENTRY ? item.quantity + qty : item.quantity - qty;
  if (newQty < 0) return res.status(400).json({ error: "Estoque não pode ficar negativo" });

  await prisma.inventoryItem.update({ where: { id: item.id }, data: { quantity: newQty } });

  const created = await prisma.productMovement.create({
    data: { itemId: item.id, type: movType, quantity: qty, reason: reason ? String(reason) : "Ajuste" }
  });

  res.status(201).json({ id: created.id, itemId: created.itemId, type: created.type, quantity: created.quantity, reason: created.reason, createdAt: created.createdAt.toISOString() });
});

// Purchase orders
app.get("/api/purchase-orders", async (_req: Request, res: Response) => {
  const rows = await prisma.purchaseOrder.findMany({ orderBy: { createdAt: "desc" } });
  res.json(rows.map(o => ({
    id: o.id,
    supplier: o.supplier,
    status: o.status,
    items: o.items,
    totalValue: Number(o.totalValue),
    createdAt: o.createdAt.toISOString(),
    receivedAt: o.receivedAt ? o.receivedAt.toISOString() : null
  })));
});

app.post("/api/purchase-orders", async (req: Request, res: Response) => {
  const { supplier, lines } = req.body ?? {};
  if (!supplier || !Array.isArray(lines) || lines.length === 0) return res.status(400).json({ error: "supplier e lines são obrigatórios" });

  // build order lines with current item data
  const itemIds = [...new Set(lines.map((l:any) => String(l.itemId)))];
  const dbItems = await prisma.inventoryItem.findMany({ where: { id: { in: itemIds } } });
  const map = new Map(dbItems.map(i => [i.id, i]));
  const orderLines = lines.map((l:any) => {
    const it = map.get(String(l.itemId));
    if (!it) throw new Error(`Item não encontrado: ${l.itemId}`);
    const q = Number(l.quantity);
    if (!Number.isFinite(q) || q <= 0) throw new Error(`Quantidade inválida para ${it.sku}`);
    return { itemId: it.id, sku: it.sku, name: it.name, quantity: q, unitPrice: Number(it.price) };
  });

  const totalValue = orderLines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);

  const created = await prisma.purchaseOrder.create({
    data: {
      supplier: String(supplier),
      status: OrderStatus.PENDING,
      items: orderLines as any,
      totalValue: String(totalValue)
    }
  });

  res.status(201).json({
    id: created.id,
    supplier: created.supplier,
    status: created.status,
    items: created.items,
    totalValue: Number(created.totalValue),
    createdAt: created.createdAt.toISOString(),
    receivedAt: created.receivedAt ? created.receivedAt.toISOString() : null
  });
});

app.post("/api/purchase-orders/:id/receive", async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
  if (order.status !== OrderStatus.PENDING) return res.status(400).json({ error: "Pedido não está PENDING" });

  const lines = order.items as any[];
  // apply stock updates + movements
  for (const l of lines) {
    const it = await prisma.inventoryItem.findUnique({ where: { id: String(l.itemId) } });
    if (!it) continue;
    const qty = Number(l.quantity);
    await prisma.inventoryItem.update({ where: { id: it.id }, data: { quantity: it.quantity + qty } });
    await prisma.productMovement.create({ data: { itemId: it.id, type: MovementType.ENTRY, quantity: qty, reason: `Recebimento pedido ${order.id.slice(-8)}` } });
  }

  const updated = await prisma.purchaseOrder.update({ where: { id }, data: { status: OrderStatus.RECEIVED, receivedAt: new Date() } });
  res.json({ ok: true, status: updated.status });
});

app.post("/api/purchase-orders/:id/cancel", async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
  if (order.status !== OrderStatus.PENDING) return res.status(400).json({ error: "Pedido não está PENDING" });

  const updated = await prisma.purchaseOrder.update({ where: { id }, data: { status: OrderStatus.CANCELLED } });
  res.json({ ok: true, status: updated.status });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => console.log(`API listening on :${port}`));
