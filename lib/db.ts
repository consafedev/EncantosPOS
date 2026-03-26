import Dexie, { type EntityTable } from 'dexie';

export interface LocalProduct {
  id: string;
  name: string;
  price: number;
  sku: string;
  barcode?: string;
  stock: number;
  tenantId: string;
}

export interface LocalOrder {
  id?: number;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  paymentMethod: 'CASH' | 'CARD';
  createdAt: number;
  synced: boolean;
  tenantId: string;
}

export interface CashEntry {
  id?: number;
  type: 'IN' | 'OUT' | 'OPEN' | 'CLOSE';
  amount: number;
  reason: string;
  createdAt: number;
  tenantId: string;
}

const db = new Dexie('POSDatabase') as Dexie & {
  products: EntityTable<LocalProduct, 'id'>;
  orders: EntityTable<LocalOrder, 'id'>;
  cashEntries: EntityTable<CashEntry, 'id'>;
};

// Schema declaration:
db.version(1).stores({
  products: 'id, name, sku, barcode, tenantId',
  orders: '++id, tenantId, synced, createdAt',
  cashEntries: '++id, tenantId, createdAt'
});

export { db };
