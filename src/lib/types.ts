export interface BOMComponent {
  id: string
  componentId: string
  componentName: string
  quantityPerUnit: number
  leadTime: number
}

export interface Product {
  id: string
  name: string
  components: BOMComponent[]
}

export interface InventoryItem {
  id: string
  name: string
  onHand: number
  scheduledReceipts: ScheduledReceipt[]
}

export interface ScheduledReceipt {
  id: string
  quantity: number
  dueDate: string
}

export interface Demand {
  id: string
  productId: string
  productName: string
  quantity: number
  dueDate: string
}

export interface MRPRow {
  itemId: string
  itemName: string
  periods: PeriodData[]
}

export interface PeriodData {
  period: number
  date: string
  grossRequirements: number
  scheduledReceipts: number
  projectedOnHand: number
  netRequirements: number
  plannedOrderReceipt: number
  plannedOrderRelease: number
}
