export interface LocalTransaction {
  id: string
  name: string
  amount: number
  date: string
  tags: string[]
  description: string
  note: string
  paymentMode: string
  source: "mobile"
  syncedAt: string
  txnType?: string
}

const DB_NAME = "cashtrack_local"
const DB_VERSION = 1
const STORE_NAME = "mobile_transactions"
const META_STORE = "sync_meta"

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getAllLocalTransactions(): Promise<LocalTransaction[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () => resolve(req.result as LocalTransaction[])
    req.onerror = () => reject(req.error)
  })
}

async function saveLocalTransactions(transactions: LocalTransaction[]): Promise<void> {
  const db = await openDb()
  const tx = db.transaction([STORE_NAME, META_STORE], "readwrite")
  const store = tx.objectStore(STORE_NAME)
  const metaStore = tx.objectStore(META_STORE)

  for (const transaction of transactions) {
    store.put(transaction)
  }

  metaStore.put({ key: "lastSync", timestamp: new Date().toISOString(), count: transactions.length })

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function clearLocalTransactions(): Promise<void> {
  const db = await openDb()
  const tx = db.transaction([STORE_NAME, META_STORE], "readwrite")
  tx.objectStore(STORE_NAME).clear()
  tx.objectStore(META_STORE).delete("lastSync")
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function getLastSyncTime(): Promise<string | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly")
    const req = tx.objectStore(META_STORE).get("lastSync")
    req.onsuccess = () => resolve((req.result as { timestamp?: string } | undefined)?.timestamp ?? null)
    req.onerror = () => reject(req.error)
  })
}

async function updateLocalTransactionField(id: string, field: string, value: unknown): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(id)

    req.onsuccess = () => {
      const current = req.result as LocalTransaction | undefined
      if (!current) {
        resolve()
        return
      }
      store.put({ ...current, [field]: value })
    }

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export {
  clearLocalTransactions,
  getAllLocalTransactions,
  getLastSyncTime,
  saveLocalTransactions,
  updateLocalTransactionField,
}