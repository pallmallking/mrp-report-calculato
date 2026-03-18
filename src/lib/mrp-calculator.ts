import { Product, Demand, InventoryItem, MRPRow, PeriodData } from './types'

export function calculateMRP(
  products: Product[],
  demands: Demand[],
  inventory: InventoryItem[],
  numberOfPeriods: number = 12
): MRPRow[] {
  const results: MRPRow[] = []
  const today = new Date()
  
  const productMap = new Map(products.map(product => [product.id, product]))
  const inventoryMap = new Map(inventory.map(inventoryItem => [inventoryItem.id, inventoryItem]))
  
  const allItemIds = new Set<string>()
  demands.forEach(demand => allItemIds.add(demand.productId))
  products.forEach(product => {
    product.components.forEach(bomComponent => allItemIds.add(bomComponent.componentId))
  })
  
  const grossRequirementsByItem = new Map<string, Map<number, number>>()
  
  demands.forEach(demand => {
    const dueDate = new Date(demand.dueDate)
    const period = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7)))
    
    if (period < numberOfPeriods) {
      if (!grossRequirementsByItem.has(demand.productId)) {
        grossRequirementsByItem.set(demand.productId, new Map())
      }
      const productPeriodRequirementsMap = grossRequirementsByItem.get(demand.productId)!
      productPeriodRequirementsMap.set(period, (productPeriodRequirementsMap.get(period) || 0) + demand.quantity)
      
      const product = productMap.get(demand.productId)
      if (product) {
        product.components.forEach(bomComponent => {
          const componentGrossRequirement = demand.quantity * bomComponent.quantityPerUnit
          const componentRequirementPeriod = Math.max(0, period - Math.ceil(bomComponent.leadTime / 7))
          
          if (!grossRequirementsByItem.has(bomComponent.componentId)) {
            grossRequirementsByItem.set(bomComponent.componentId, new Map())
          }
          const componentPeriodRequirementsMap = grossRequirementsByItem.get(bomComponent.componentId)!
          componentPeriodRequirementsMap.set(componentRequirementPeriod, (componentPeriodRequirementsMap.get(componentRequirementPeriod) || 0) + componentGrossRequirement)
        })
      }
    }
  })
  
  allItemIds.forEach(itemId => {
    const inventoryItem = inventoryMap.get(itemId)
    const itemGrossRequirementsByPeriod = grossRequirementsByItem.get(itemId) || new Map()
    
    const periods: PeriodData[] = []
    let projectedOnHand = inventoryItem?.onHand || 0
    
    for (let period = 0; period < numberOfPeriods; period++) {
      const periodDate = new Date(today)
      periodDate.setDate(periodDate.getDate() + period * 7)
      
      const grossRequirements = itemGrossRequirementsByPeriod.get(period) || 0
      
      const scheduledReceipts = inventoryItem?.scheduledReceipts
        .filter(scheduledReceipt => {
          const scheduledReceiptDate = new Date(scheduledReceipt.dueDate)
          const scheduledReceiptPeriod = Math.ceil((scheduledReceiptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7))
          return scheduledReceiptPeriod === period
        })
        .reduce((sum, scheduledReceipt) => sum + scheduledReceipt.quantity, 0) || 0
      
      projectedOnHand += scheduledReceipts
      
      const netRequirements = Math.max(0, grossRequirements - projectedOnHand)
      const plannedOrderReceipt = netRequirements > 0 ? netRequirements : 0
      const plannedOrderRelease = plannedOrderReceipt
      
      projectedOnHand -= grossRequirements
      projectedOnHand += plannedOrderReceipt
      
      periods.push({
        period,
        date: periodDate.toISOString().split('T')[0],
        grossRequirements,
        scheduledReceipts,
        projectedOnHand,
        netRequirements,
        plannedOrderReceipt,
        plannedOrderRelease,
      })
    }
    
    const itemName = inventoryItem?.name || productMap.get(itemId)?.name || `Item ${itemId}`
    
    results.push({
      itemId,
      itemName,
      periods,
    })
  })
  
  return results
}
