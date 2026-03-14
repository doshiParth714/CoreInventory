const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export type OperationType = "RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT";
export type PickingStatus = "DRAFT" | "CONFIRM" | "READY" | "DONE" | "CANCELLED";
export type MoveStatus = "DRAFT" | "WAITING" | "READY" | "DONE" | "CANCELLED";

export interface Profile {
  id: string;
  loginId: string;
  email: string;
  password: string;
}

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address: string;
}

export interface Location {
  id: string;
  name: string;
  shortCode: string;
  warehouseId: string;
  warehouse?: Warehouse;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  unitOfMeasure: string;
  reorderPoint: number;
  costPrice: number;
  category?: ProductCategory;
  stocks?: ProductStock[];
}

export interface ProductStock {
  productId: string;
  locationId: string;
  onHand: number;
  reserved: number;
  product?: Product;
  location?: Location;
}

export interface StockPicking {
  id: string;
  reference: string;
  operationType: OperationType;
  status: PickingStatus;
  fromLocationId: string | null;
  toLocationId: string | null;
  responsibleId: string | null;
  contactName: string | null;
  scheduledDate: string | null;
  operationTypeLabel: string | null;
  doneAt: string | null;
  createdAt?: string;
  fromLocation?: Location | null;
  toLocation?: Location | null;
  responsible?: Profile | null;
  lines: StockMoveLine[];
}

export interface StockMoveLine {
  id: string;
  pickingId: string;
  productId: string;
  locationId: string | null;
  demandQty: number;
  doneQty: number;
  status: MoveStatus;
  product?: Product;
  location?: Location | null;
}

export interface StockLedgerEntry {
  id: string;
  reference: string;
  operationType: OperationType;
  productId: string;
  productName: string;
  fromLocation: string | null;
  toLocation: string | null;
  quantity: number;
  userId: string | null;
  userLoginId: string | null;
  createdAt: string;
}

export interface InventoryAdjustment {
  id: string;
  reference: string;
  status: PickingStatus;
  locationId: string;
  responsibleId: string | null;
  notes: string | null;
  createdAt: string;
  scheduledDate: string | null;
  location?: Location;
  responsible?: Profile | null;
  lines: InventoryAdjustmentLine[];
}

export interface InventoryAdjustmentLine {
  id: string;
  adjustmentId: string;
  productId: string;
  expectedQty: number;
  countedQty: number;
  diffQty: number;
  product?: Product;
}

export interface StoreState {
  profiles: Profile[];
  warehouses: Warehouse[];
  locations: Location[];
  categories: ProductCategory[];
  products: Product[];
  productStocks: ProductStock[];
  pickings: StockPicking[];
  moveLines: StockMoveLine[];
  ledger: StockLedgerEntry[];
  adjustments: InventoryAdjustment[];
  adjustmentLines: InventoryAdjustmentLine[];
  pickingSeq: { RECEIPT: number; DELIVERY: number; TRANSFER: number; ADJUSTMENT: number };
}

function seedWarehouse(): { warehouses: Warehouse[]; locations: Location[] } {
  const wh: Warehouse = { id: uid(), name: "Main Warehouse", shortCode: "WH1", address: "123 Factory Rd" };
  const loc1: Location = { id: uid(), name: "Rack A", shortCode: "RA", warehouseId: wh.id, warehouse: wh };
  const loc2: Location = { id: uid(), name: "Rack B", shortCode: "RB", warehouseId: wh.id, warehouse: wh };
  return { warehouses: [wh], locations: [loc1, loc2] };
}

const { warehouses: seedWh, locations: seedLoc } = seedWarehouse();
const seedCat: ProductCategory = { id: uid(), name: "Groceries" };
const seedAdmin: Profile = { id: uid(), loginId: "admin", email: "admin@inventra.com", password: "admin123" };

function generateSeedData() {
  const products: Product[] = [];
  const productStocks: ProductStock[] = [];
  const pickings: StockPicking[] = [];
  const moveLines: StockMoveLine[] = [];
  const ledger: StockLedgerEntry[] = [];
  const adjustments: InventoryAdjustment[] = [];
  const adjustmentLines: InventoryAdjustmentLine[] = [];
  const categories: ProductCategory[] = [seedCat, { id: uid(), name: "Household" }, { id: uid(), name: "Apparel" }, { id: uid(), name: "Electronics" }];

  const locA = seedLoc[0].id;
  const locB = seedLoc[1].id;

  const realProductNames = [
    "Aashirvaad Whole Wheat Atta 5kg", "India Gate Basmati Rice 5kg", "Fortune Soyabean Oil 1L", "Tata Salt 1kg", "Madhur Sugar 1kg", "Maggi 2-Minute Noodles 140g", "Surf Excel Easy Wash Detergent 1.5kg", "Vim Dishwash Liquid 500ml", "Dettol Original Soap 125g (Pack of 4)", "Colgate MaxFresh Toothpaste 150g",
    "Dove Intense Repair Shampoo 340ml", "Parachute Coconut Oil 300ml", "Amul Butter 500g", "Gowardhan Ghee 1L", "Britannia Good Day Cashew Cookies 250g", "Parle-G Gold 1kg", "Haldiram's Bhujia Sev 400g", "Lays India's Magic Masala 52g", "Kurkure Masala Munch 90g", "Cadbury Dairy Milk Silk 60g",
    "Everest Garam Masala 100g", "MDH Chana Masala 100g", "Catch Coriander Powder 200g", "Brooke Bond Red Label Tea 500g", "Nescafe Classic Coffee 100g", "Kissan Mixed Fruit Jam 500g", "Patanjali Honey 500g", "Saffola Gold Blended Oil 1L", "Ariel Matic Front Load Detergent 1kg", "Tide Plus Double Power 1.5kg",
    "Harpic Power Plus Toilet Cleaner 500ml", "Lizol Floral Floor Cleaner 1L", "Comfort Fabric Conditioner 860ml", "Pepsodent GermiCheck Toothpaste 150g", "Pears Soft & Fresh Soap 125g", "Lifebuoy Total 10 Soap 125g", "Head & Shoulders Anti Dandruff Shampoo 340ml", "Sunsilk Black Shine Shampoo 340ml", "Nivea Soft Light Moisturiser 200ml", "Vaseline Intensive Care Lotion 400ml",
    "Gillette Mach3 Razor", "Oral-B Cavity Defense Toothbrush", "Stayfree Secure Cottony Sanitary Pads", "Whisper Choice Ultra Wings", "Pampers Active Baby Diapers (L)", "Huggies Wonder Pants (M)", "Horlicks Classic Malt 500g", "Bournvita Health Drink 500g", "Cerelac Wheat Apple 300g", "Pediasure Vanilla Delight 400g",
    "Real Fruit Power Tropicana 1L", "Paper Boat Aamras 250ml", "Bisleri Mineral Water 1L", "Kinley Club Soda 750ml", "Coca-Cola Original 2.25L", "Sprite Lemon-Lime 2.25L", "Thums Up 2.25L", "Red Bull Energy Drink 250ml", "Gatorade Sports Drink 500ml", "Britannia NutriChoice Digestive 250g",
    "Sunfeast Dark Fantasy Choco Fills 300g", "Bikano Aloo Bhujia 400g", "Snickers Chocolate Bar 50g", "Kinder Joy For Boys 20g", "Ferrero Rocher Chocolates 200g", "Kellogg's Corn Flakes 475g", "Saffola Oats 1kg", "Pillsbury Chakki Fresh Atta 5kg", "Dawat Rozana Basmati Rice 5kg", "Dhara Mustard Oil 1L",
    "Gemini Sunflower Oil 1L", "Everest Turmeric Powder 200g", "MDH Meat Masala 100g", "Society Tea 500g", "Bru Green Label Coffee 500g", "Nutella Hazelnut Spread 350g", "Peanut Butter Disano Creamy 340g", "Mapro Rose Syrup 700ml", "Rooh Afza Sharbat 750ml", "Gowardhan Paneer 200g",
    "Mother Dairy Mishti Doi 400g", "Amul Cheese Slices 200g", "Patanjali Dant Kanti 200g", "Dabur Red Paste 200g", "Meswak Toothpaste 200g", "Himalaya Purifying Neem Wash 150ml", "Garnier Men Face Wash 100g", "Pond's White Beauty Cream 50g", "Godrej No.1 Sandalwood Soap 100g", "Cinthol Original Soap 100g",
    "Fiama Di Wills Gel Bar 125g", "Engage Pocket Perfume 18ml", "Fogg Master Body Spray 150ml", "Axe Dark Temptation Deodorant 150ml", "Odomos Mosquito Repellent 50g", "Good Knight Gold Flash Machine", "All Out Ultra Refill", "Hit Flying Insect Killer 400ml", "Mortein PowerGard Coil", "Zandu Balm 25ml"
  ];

  const suppliers = [
    "Hindustan Unilever Ltd", "ITC Enterprises", "Nestle India", "Procter & Gamble", "Britannia Industries", 
    "Parle Products", "Adani Wilmar", "Amul (GCMMF)", "Patanjali Ayurved", "Dabur India",
    "Godrej Consumer", "Marico Ltd", "Haldiram Snacks", "PepsiCo India", "Coca-Cola India",
    "Mondelez India", "Tata Consumer", "Kansai Nerolac", "Johnson & Johnson", "Colgate-Palmolive"
  ];

  const customers = [
    "Rajesh Kumar", "Priya Sharma", "Amit Singh", "Neha Gupta", "Vikram Patel",
    "Anita Desai", "Rahul Verma", "Sneha Reddy", "Arjun Malhotra", "Kavita Rao",
    "Suresh Joshi", "Pooja Trivedi", "Karthik Iyer", "Anjali Menon", "Sanjay Kapoor",
    "Meera Nair", "Deepak Chawla", "Ritu Agarwal", "Anil Chauhan", "Swati Mishra"
  ];

  // 100 Products
  for (let i = 1; i <= 100; i++) {
    const pId = uid();
    // Seed random dates across last 30 days
    const randomDateOffset = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
    const creationDate = new Date(Date.now() - randomDateOffset).toISOString();
    const pName = realProductNames[i - 1] || `DMart Item ${i}`;

    products.push({
      id: pId,
      name: pName,
      sku: `PRD-${String(i).padStart(4, "0")}`,
      categoryId: categories[i % categories.length].id,
      unitOfMeasure: "pcs",
      reorderPoint: Math.floor(Math.random() * 50) + 10,
      costPrice: Math.floor(Math.random() * 500) + 10,
    });
    
    // Give all products initial stock, but forcefully make the first 15 items OUT OF STOCK / LOW STOCK
    const oh = i <= 15 ? (i <= 5 ? 0 : Math.floor(Math.random() * 5)) : Math.floor(Math.random() * 500) + 50;
    productStocks.push({ productId: pId, locationId: locA, onHand: oh, reserved: 0 });
    
    // Record initial ledger stock
    if (oh > 0 || i <= 5) {
      ledger.push({
      id: uid(),
      reference: `DMart Initial Stock`,
      operationType: "ADJUSTMENT",
      productId: pId,
      productName: pName,
      fromLocation: null,
      toLocation: locA,
      quantity: oh,
      userId: seedAdmin.id,
      userLoginId: seedAdmin.loginId,
      createdAt: creationDate,
    });
    }
  }

  const statuses: PickingStatus[] = ["DRAFT", "CONFIRM", "READY", "DONE"];

  // 100 Receipts
  for (let i = 1; i <= 100; i++) {
    const op = "RECEIPT";
    const status = statuses[i % 4];
    const pId = uid();
    const prod = products[i % products.length];
    const demand = Math.floor(Math.random() * 50) + 5;
    
    const creationDate = new Date(Date.now() - Math.floor(Math.random() * 20 * 24 * 60 * 60 * 1000));
    pickings.push({
      id: pId,
      reference: `REC/${new Date().getFullYear()}/Operation/${String(i).padStart(4, "0")}`,
      operationType: op,
      status,
      fromLocationId: null,
      toLocationId: locA,
      responsibleId: seedAdmin.id,
      contactName: suppliers[i % suppliers.length],
      scheduledDate: new Date(creationDate.getTime() + (Math.random() * 10 * 86400000)).toISOString(),
      operationTypeLabel: null,
      doneAt: status === "DONE" ? new Date(creationDate.getTime() + 86400000).toISOString() : null,
      createdAt: creationDate.toISOString(),
      lines: [],
    });

    moveLines.push({
      id: uid(),
      pickingId: pId,
      productId: prod.id,
      locationId: locA,
      demandQty: demand,
      doneQty: status === "DONE" ? demand : 0,
      status: status as any,
    });
  }

  // 100 Deliveries
  for (let i = 1; i <= 100; i++) {
    const op = "DELIVERY";
    const status = statuses[i % 4];
    const pId = uid();
    const prod = products[(i + 13) % products.length];
    const demand = Math.floor(Math.random() * 20) + 1;
    
    const creationDate = new Date(Date.now() - Math.floor(Math.random() * 20 * 24 * 60 * 60 * 1000));
    pickings.push({
      id: pId,
      reference: `DEL/${new Date().getFullYear()}/Operation/${String(i).padStart(4, "0")}`,
      operationType: op,
      status,
      fromLocationId: locA,
      toLocationId: null,
      responsibleId: seedAdmin.id,
      contactName: customers[i % customers.length] + `\n${Math.floor(Math.random() * 999) + 1}, ${["MG Road", "Link Road", "Station Road", "Gandhi Nagar", "Koregaon Park", "Bandra West", "Jayanagar", "Gachibowli"][Math.floor(Math.random() * 8)]}, ${["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Ahmedabad", "Chennai"][Math.floor(Math.random() * 7)]}`,
      scheduledDate: new Date(creationDate.getTime() + (Math.random() * 10 * 86400000)).toISOString(),
      operationTypeLabel: null,
      doneAt: status === "DONE" ? new Date(creationDate.getTime() + 86400000).toISOString() : null,
      createdAt: creationDate.toISOString(),
      lines: [],
    });

    moveLines.push({
      id: uid(),
      pickingId: pId,
      productId: prod.id,
      locationId: null,
      demandQty: demand,
      doneQty: status === "DONE" ? demand : 0,
      status: status as any,
    });
  }

  // 100 Internal Transfers
  for (let i = 1; i <= 100; i++) {
    const op = "TRANSFER";
    const status = statuses[i % 4];
    const pId = uid();
    const prod = products[(i + 27) % products.length];
    const demand = Math.floor(Math.random() * 30) + 5;
    
    const creationDate = new Date(Date.now() - Math.floor(Math.random() * 20 * 24 * 60 * 60 * 1000));
    pickings.push({
      id: pId,
      reference: `INT/${new Date().getFullYear()}/Operation/${String(i).padStart(4, "0")}`,
      operationType: op,
      status,
      fromLocationId: locA,
      toLocationId: locB,
      responsibleId: seedAdmin.id,
      contactName: `Internal Operations`,
      scheduledDate: new Date(creationDate.getTime() + (Math.random() * 10 * 86400000)).toISOString(),
      operationTypeLabel: null,
      doneAt: status === "DONE" ? new Date(creationDate.getTime() + 86400000).toISOString() : null,
      createdAt: creationDate.toISOString(),
      lines: [],
    });

    moveLines.push({
      id: uid(),
      pickingId: pId,
      productId: prod.id,
      locationId: locB,
      demandQty: demand,
      doneQty: status === "DONE" ? demand : 0,
      status: status as any,
    });
  }

  // 100 Inventory Adjustments
  for (let i = 1; i <= 100; i++) {
    const adjId = uid();
    const prod = products[(i + 43) % products.length];
    const statusesList: PickingStatus[] = ["DRAFT", "DONE"];
    const status = statusesList[i % 2];
    
    const expected = Math.floor(Math.random() * 150) + 50;
    const counted = status === "DONE" ? expected + (Math.floor(Math.random() * 20) - 10) : expected;

    const creationDate = new Date(Date.now() - Math.floor(Math.random() * 25 * 24 * 60 * 60 * 1000));

    adjustments.push({
      id: adjId,
      reference: `ADJ/${new Date().getFullYear()}/Operation/${String(i).padStart(4, "0")}`,
      status,
      locationId: locA,
      responsibleId: seedAdmin.id,
      notes: `Cycle Count ${i} — ${["Routine", "Spot Check", "Annual", "Quarterly"][i % 4]}`,
      createdAt: creationDate.toISOString(),
      scheduledDate: new Date(creationDate.getTime() + Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)).toISOString(),
      lines: [],
    });

    adjustmentLines.push({
      id: uid(),
      adjustmentId: adjId,
      productId: prod.id,
      expectedQty: expected,
      countedQty: counted,
      diffQty: counted - expected,
    });
  }

  return { products, productStocks, pickings, moveLines, ledger, adjustments, adjustmentLines, categories };
}

const seedData = generateSeedData();

export const initialStoreState: StoreState = {
  profiles: [seedAdmin],
  warehouses: seedWh,
  locations: seedLoc,
  categories: seedData.categories,
  products: seedData.products,
  productStocks: seedData.productStocks,
  pickings: seedData.pickings,
  moveLines: seedData.moveLines,
  ledger: seedData.ledger,
  adjustments: seedData.adjustments,
  adjustmentLines: seedData.adjustmentLines,
  pickingSeq: { RECEIPT: 101, DELIVERY: 101, TRANSFER: 101, ADJUSTMENT: 101 },
};

function nextRef(type: OperationType, seq: Record<string, number>): string {
  const year = new Date().getFullYear();
  const prefix = { RECEIPT: "REC", DELIVERY: "DEL", TRANSFER: "INT", ADJUSTMENT: "ADJ" }[type];
  const n = seq[type] ?? 1;
  return `${prefix}/${year}/Operation/${String(n).padStart(4, "0")}`;
}

export type StoreActions = ReturnType<typeof createStoreActions>;

export function createStoreActions(
  getState: () => StoreState,
  setState: (updater: (s: StoreState) => StoreState) => void
) {
  return {
    addProfile(p: Omit<Profile, "id">) {
      const id = uid();
      setState((s) => ({ ...s, profiles: [...s.profiles, { ...p, id }] }));
      return id;
    },
    getProfileByEmail(email: string) {
      return getState().profiles.find((x) => x.email.toLowerCase() === email.toLowerCase());
    },
    getProfileByLoginId(loginId: string) {
      return getState().profiles.find((x) => x.loginId === loginId);
    },
    updateProfile(id: string, data: Partial<Omit<Profile, "id">>) {
      setState((s) => ({
        ...s,
        profiles: s.profiles.map((x) => (x.id === id ? { ...x, ...data } : x)),
      }));
    },
    addWarehouse(data: Omit<Warehouse, "id">) {
      const id = uid();
      setState((s) => ({ ...s, warehouses: [...s.warehouses, { ...data, id }] }));
      return id;
    },
    updateWarehouse(id: string, data: Partial<Omit<Warehouse, "id">>) {
      setState((s) => ({
        ...s,
        warehouses: s.warehouses.map((w) => (w.id === id ? { ...w, ...data } : w)),
      }));
    },
    addLocation(data: Omit<Location, "id" | "warehouse">) {
      const id = uid();
      setState((s) => ({ ...s, locations: [...s.locations, { ...data, id }] }));
      return id;
    },
    updateLocation(id: string, data: Partial<Omit<Location, "id" | "warehouse">>) {
      setState((s) => ({
        ...s,
        locations: s.locations.map((l) => (l.id === id ? { ...l, ...data } : l)),
      }));
    },
    deleteLocation(id: string) {
      if (getState().locations.length <= 1) return; // Prevent deleting the last location
      setState((s) => ({
        ...s,
        locations: s.locations.filter((l) => l.id !== id),
      }));
    },
    deleteWarehouse(id: string) {
      if (getState().warehouses.length <= 1) return; // Prevent deleting the last warehouse
      setState((s) => ({
        ...s,
        warehouses: s.warehouses.filter((w) => w.id !== id),
        locations: s.locations.filter((l) => l.warehouseId !== id),
      }));
    },
    addCategory(name: string) {
      const id = uid();
      setState((s) => ({ ...s, categories: [...s.categories, { id, name }] }));
      return id;
    },
    addProduct(data: Omit<Product, "id" | "category"> & { initialStock?: number; locationId?: string }) {
      const id = uid();
      const { initialStock = 0, locationId, ...rest } = data;
      setState((s) => {
        const products = [...s.products, { ...rest, id }];
        let stocks = s.productStocks;
        if (locationId && initialStock > 0) {
          stocks = [...stocks, { productId: id, locationId, onHand: initialStock, reserved: 0 }];
        }
        return { ...s, products, productStocks: stocks };
      });
      return id;
    },
    updateProduct(id: string, data: Partial<Omit<Product, "id" | "category">>) {
      setState((s) => ({
        ...s,
        products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
      }));
    },
    deleteProduct(id: string) {
      setState((s) => ({
        ...s,
        products: s.products.filter((p) => p.id !== id),
        productStocks: s.productStocks.filter((ps) => ps.productId !== id),
      }));
    },
    createPicking(type: "RECEIPT" | "DELIVERY" | "TRANSFER") {
      const s = getState();
      const seq = { ...s.pickingSeq };
      const ref = nextRef(type, seq);
      seq[type]++;
      const id = uid();
      const toId = type === "RECEIPT" ? s.locations[0]?.id ?? null : null;
      const fromId = type === "DELIVERY" || type === "TRANSFER" ? s.locations[0]?.id ?? null : null;
      setState((st) => ({
        ...st,
        pickingSeq: seq,
        pickings: [
          ...st.pickings,
          {
            id,
            reference: ref,
            operationType: type === "TRANSFER" ? "TRANSFER" : type,
            status: "DRAFT",
            fromLocationId: fromId,
            toLocationId: type === "TRANSFER" ? st.locations[1]?.id ?? toId : toId,
            responsibleId: null,
            contactName: null,
            scheduledDate: null,
            operationTypeLabel: null,
            doneAt: null,
            createdAt: new Date().toISOString(),
            lines: [],
          },
        ],
      }));
      return id;
    },
    createAdjustment(locationId: string, notes?: string) {
      const s = getState();
      const seq = { ...s.pickingSeq };
      const ref = nextRef("ADJUSTMENT", seq);
      seq.ADJUSTMENT++;
      const id = uid();
      setState((st) => ({
        ...st,
        pickingSeq: seq,
        adjustments: [
          ...st.adjustments,
          {
            id,
            reference: ref,
            status: "DRAFT",
            locationId,
            responsibleId: null,
            notes: notes ?? null,
            createdAt: new Date().toISOString(),
            scheduledDate: null,
            lines: [],
          },
        ],
      }));
      return id;
    },
    updateAdjustment(id: string, data: Partial<Pick<InventoryAdjustment, "notes" | "locationId" | "scheduledDate">>) {
      setState((s) => ({
        ...s,
        adjustments: s.adjustments.map((a) => (a.id === id ? { ...a, ...data } : a)),
      }));
    },
    getPicking(id: string): StockPicking | undefined {
      const s = getState();
      const p = s.pickings.find((x) => x.id === id);
      if (!p) return undefined;
      const lines = s.moveLines.filter((l) => l.pickingId === id);
      const fromLocation = p.fromLocationId ? s.locations.find((l) => l.id === p.fromLocationId) : null;
      const toLocation = p.toLocationId ? s.locations.find((l) => l.id === p.toLocationId) : null;
      return { ...p, lines, fromLocation: fromLocation ?? null, toLocation: toLocation ?? null };
    },
    getAdjustment(id: string): InventoryAdjustment | undefined {
      const s = getState();
      const a = s.adjustments.find((x) => x.id === id);
      if (!a) return undefined;
      const lines = s.adjustmentLines.filter((l) => l.adjustmentId === id);
      const location = s.locations.find((l) => l.id === a.locationId);
      return { ...a, lines, location };
    },
    updatePickingStatus(id: string, status: PickingStatus) {
      setState((s) => ({
        ...s,
        pickings: s.pickings.map((p) => (p.id === id ? { ...p, status } : p)),
      }));
    },
    updateAdjustmentStatus(id: string, status: PickingStatus) {
      setState((s) => ({
        ...s,
        adjustments: s.adjustments.map((a) => (a.id === id ? { ...a, status } : a)),
      }));
    },
    addMoveLine(pickingId: string, productId: string, demandQty: number, locationId?: string | null) {
      const id = uid();
      setState((s) => ({
        ...s,
        moveLines: [
          ...s.moveLines,
          {
            id,
            pickingId,
            productId,
            locationId: locationId ?? null,
            demandQty,
            doneQty: demandQty,
            status: "DRAFT",
          },
        ],
      }));
      return id;
    },
    updateMoveLineDoneQty(lineId: string, doneQty: number) {
      setState((s) => ({
        ...s,
        moveLines: s.moveLines.map((l) => (l.id === lineId ? { ...l, doneQty } : l)),
      }));
    },
    addAdjustmentLine(adjustmentId: string, productId: string, expectedQty: number, countedQty: number) {
      const id = uid();
      const diffQty = countedQty - expectedQty;
      setState((s) => ({
        ...s,
        adjustmentLines: [...s.adjustmentLines, { id, adjustmentId, productId, expectedQty, countedQty, diffQty }],
      }));
      return id;
    },
    updateAdjustmentLineCounted(lineId: string, countedQty: number) {
      setState((s) => ({
        ...s,
        adjustmentLines: s.adjustmentLines.map((l) =>
          l.id === lineId ? { ...l, countedQty, diffQty: countedQty - l.expectedQty } : l
        ),
      }));
    },
    applyReceipt(id: string, userLoginId: string) {
      const s = getState();
      const picking = s.pickings.find((p) => p.id === id);
      if (!picking || picking.operationType !== "RECEIPT" || !picking.toLocationId) return;
      const lines = s.moveLines.filter((l) => l.pickingId === id);
      const newStocks: ProductStock[] = [];
      const ledgerEntries: StockLedgerEntry[] = [];
      for (const line of lines) {
        const existing = s.productStocks.find(
          (st) => st.productId === line.productId && st.locationId === picking.toLocationId!
        );
        const qty = line.doneQty ?? line.demandQty;
        if (existing) {
          newStocks.push({
            ...existing,
            onHand: existing.onHand + qty,
          });
        } else {
          newStocks.push({
            productId: line.productId,
            locationId: picking.toLocationId,
            onHand: qty,
            reserved: 0,
          });
        }
        const product = s.products.find((p) => p.id === line.productId);
        ledgerEntries.push({
          id: uid(),
          reference: picking.reference,
          operationType: "RECEIPT",
          productId: line.productId,
          productName: product?.name ?? "",
          fromLocation: null,
          toLocation: picking.toLocationId,
          quantity: qty,
          userId: null,
          userLoginId,
          createdAt: new Date().toISOString(),
        });
      }
      setState((st) => {
        const stocksWithout = st.productStocks.filter(
          (x) => !(x.locationId === picking.toLocationId && lines.some((l) => l.productId === x.productId))
        );
        const byKey = (ps: ProductStock) => `${ps.productId}:${ps.locationId}`;
        const merged = [...stocksWithout];
        for (const n of newStocks) {
          const idx = merged.findIndex((x) => byKey(x) === byKey(n));
          if (idx >= 0) merged[idx] = n;
          else merged.push(n);
        }
        return {
          ...st,
          productStocks: merged,
          pickings: st.pickings.map((p) => (p.id === id ? { ...p, status: "DONE" as const, doneAt: new Date().toISOString() } : p)),
          ledger: [...st.ledger, ...ledgerEntries],
        };
      });
    },
    applyDelivery(id: string, userLoginId: string) {
      const s = getState();
      const picking = s.pickings.find((p) => p.id === id);
      if (!picking || picking.operationType !== "DELIVERY" || !picking.fromLocationId) return;
      const lines = s.moveLines.filter((l) => l.pickingId === id);
      const updates: { productId: string; locationId: string; delta: number }[] = [];
      const ledgerEntries: StockLedgerEntry[] = [];
      for (const line of lines) {
        const qty = line.doneQty ?? line.demandQty;
        updates.push({ productId: line.productId, locationId: picking.fromLocationId, delta: -qty });
        const product = s.products.find((p) => p.id === line.productId);
        ledgerEntries.push({
          id: uid(),
          reference: picking.reference,
          operationType: "DELIVERY",
          productId: line.productId,
          productName: product?.name ?? "",
          fromLocation: picking.fromLocationId,
          toLocation: null,
          quantity: qty,
          userId: null,
          userLoginId,
          createdAt: new Date().toISOString(),
        });
      }
      setState((st) => {
        let stocks = [...st.productStocks];
        for (const u of updates) {
          const idx = stocks.findIndex((x) => x.productId === u.productId && x.locationId === u.locationId);
          if (idx >= 0) stocks[idx] = { ...stocks[idx], onHand: Math.max(0, stocks[idx].onHand + u.delta) };
        }
        return {
          ...st,
          productStocks: stocks,
          pickings: st.pickings.map((p) => (p.id === id ? { ...p, status: "DONE" as const, doneAt: new Date().toISOString() } : p)),
          ledger: [...st.ledger, ...ledgerEntries],
        };
      });
    },
    applyTransfer(id: string, userLoginId: string) {
      const s = getState();
      const picking = s.pickings.find((p) => p.id === id);
      if (!picking || picking.operationType !== "TRANSFER" || !picking.fromLocationId || !picking.toLocationId) return;
      const lines = s.moveLines.filter((l) => l.pickingId === id);
      const ledgerEntries: StockLedgerEntry[] = [];
      setState((st) => {
        let stocks = [...st.productStocks];
        for (const line of lines) {
          const qty = line.doneQty ?? line.demandQty;
          const fromIdx = stocks.findIndex(
            (x) => x.productId === line.productId && x.locationId === picking.fromLocationId
          );
          if (fromIdx >= 0) stocks[fromIdx] = { ...stocks[fromIdx], onHand: Math.max(0, stocks[fromIdx].onHand - qty) };
          const toIdx = stocks.findIndex(
            (x) => x.productId === line.productId && x.locationId === picking.toLocationId
          );
          if (toIdx >= 0) stocks[toIdx] = { ...stocks[toIdx], onHand: stocks[toIdx].onHand + qty };
          else stocks.push({
            productId: line.productId,
            locationId: picking.toLocationId!,
            onHand: qty,
            reserved: 0,
          });
          const product = st.products.find((p) => p.id === line.productId);
          ledgerEntries.push({
            id: uid(),
            reference: picking.reference,
            operationType: "TRANSFER",
            productId: line.productId,
            productName: product?.name ?? "",
            fromLocation: picking.fromLocationId,
            toLocation: picking.toLocationId,
            quantity: qty,
            userId: null,
            userLoginId,
            createdAt: new Date().toISOString(),
          });
        }
        return {
          ...st,
          productStocks: stocks,
          pickings: st.pickings.map((p) => (p.id === id ? { ...p, status: "DONE" as const, doneAt: new Date().toISOString() } : p)),
          ledger: [...st.ledger, ...ledgerEntries],
        };
      });
    },
    applyAdjustment(id: string, userLoginId: string) {
      const s = getState();
      const adj = s.adjustments.find((a) => a.id === id);
      if (!adj) return;
      const lines = s.adjustmentLines.filter((l) => l.adjustmentId === id);
      const locationId = adj.locationId;
      const ledgerEntries: StockLedgerEntry[] = [];
      setState((st) => {
        let stocks = [...st.productStocks];
        for (const line of lines) {
          const idx = stocks.findIndex((x) => x.productId === line.productId && x.locationId === locationId);
          if (idx >= 0) {
            const newOnHand = line.countedQty;
            stocks[idx] = { ...stocks[idx], onHand: newOnHand };
          } else {
            stocks.push({ productId: line.productId, locationId, onHand: line.countedQty, reserved: 0 });
          }
          const product = st.products.find((p) => p.id === line.productId);
          ledgerEntries.push({
            id: uid(),
            reference: adj.reference,
            operationType: "ADJUSTMENT",
            productId: line.productId,
            productName: product?.name ?? "",
            fromLocation: null,
            toLocation: locationId,
            quantity: line.diffQty,
            userId: null,
            userLoginId,
            createdAt: new Date().toISOString(),
          });
        }
        return {
          ...st,
          adjustments: st.adjustments.map((a) => (a.id === id ? { ...a, status: "DONE" as const } : a)),
          productStocks: stocks,
          ledger: [...st.ledger, ...ledgerEntries],
        };
      });
    },
    cancelPicking(id: string) {
      setState((s) => ({
        ...s,
        pickings: s.pickings.map((p) => (p.id === id ? { ...p, status: "CANCELLED" as const } : p)),
      }));
    },
    cancelAdjustment(id: string) {
      setState((s) => ({
        ...s,
        adjustments: s.adjustments.map((a) => (a.id === id ? { ...a, status: "CANCELLED" as const } : a)),
      }));
    },
  };
}
