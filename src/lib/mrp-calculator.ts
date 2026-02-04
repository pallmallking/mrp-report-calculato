import { Product, Demand, InventoryItem, MRPRow, PeriodData } from './types'

export function calculateMRP(
  products: Product[],
  demands: Demand[],
  inventory: InventoryItem[],
  numberOfPeriods: number = 12
): MRPRow[] {
  const results: MRPRow[] = []
  const today = new Date()
  
  const productMap = new Map(products.map(p => [p.id, p]))
  const inventoryMap = new Map(inventory.map(i => [i.id, i]))
  
  const allItemIds = new Set<string>()
  demands.forEach(d => allItemIds.add(d.productId))
  products.forEach(p => {
    p.components.forEach(c => allItemIds.add(c.componentId))
  })
  
  const grossRequirementsByItem = new Map<string, Map<number, number>>()
  
  demands.forEach(demand => {
    const dueDate = new Date(demand.dueDate)
    const period = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7)))
    
    if (period < numberOfPeriods) {
      if (!grossRequirementsByItem.has(demand.productId)) {
        grossRequirementsByItem.set(demand.productId, new Map())
      }
      const periodMap = grossRequirementsByItem.get(demand.productId)!
      periodMap.set(period, (periodMap.get(period) || 0) + demand.quantity)
      
      const product = productMap.get(demand.productId)
      if (product) {
        product.components.forEach(comp => {
          const componentNeed = demand.quantity * comp.quantityPerUnit
          const componentPeriod = Math.max(0, period - Math.ceil(comp.leadTime / 7))
          
          if (!grossRequirementsByItem.has(comp.componentId)) {
            grossRequirementsByItem.set(comp.componentId, new Map())
          }
          const compPeriodMap = grossRequirementsByItem.get(comp.componentId)!
          compPeriodMap.set(componentPeriod, (compPeriodMap.get(componentPeriod) || 0) + componentNeed)
        })
      }
    }
  })
  
  allItemIds.forEach(itemId => {
    const inv = inventoryMap.get(itemId)
    const grossReqs = grossRequirementsByItem.get(itemId) || new Map()
    
    const periods: PeriodData[] = []
    let projectedOnHand = inv?.onHand || 0
    
    for (let period = 0; period < numberOfPeriods; period++) {
      const periodDate = new Date(today)
      periodDate.setDate(periodDate.getDate() + period * 7)
      
      const grossRequirements = grossReqs.get(period) || 0
      
      const scheduledReceipts = inv?.scheduledReceipts
        .filter(sr => {
          const srDate = new Date(sr.dueDate)
          const srPeriod = Math.ceil((srDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7))
          return srPeriod === period
        })
        .reduce((sum, sr) => sum + sr.quantity, 0) || 0
      
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
    
    const itemName = inv?.name || productMap.get(itemId)?.name || `Item ${itemId}`
    
    results.push({
      itemId,
      itemName,
      periods,
    })
  })
  
  return results
}
