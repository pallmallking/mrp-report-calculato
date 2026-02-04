import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Product, InventoryItem, Demand, MRPRow } from '@/lib/types'
import { calculateMRP } from '@/lib/mrp-calculator'
import { BOMManager } from '@/components/BOMManager'
import { InventoryManager } from '@/components/InventoryManager'
import { DemandManager } from '@/components/DemandManager'
import { MRPReport } from '@/components/MRPReport'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

function App() {
  const [products, setProducts] = useKV<Product[]>('mrp-products', [])
  const [inventory, setInventory] = useKV<InventoryItem[]>('mrp-inventory', [])
  const [demands, setDemands] = useKV<Demand[]>('mrp-demands', [])
  const [mrpResults, setMRPResults] = useState<MRPRow[]>([])
  const [activeTab, setActiveTab] = useState('inventory')

  useEffect(() => {
    if (products && inventory && demands && products.length > 0 && inventory.length > 0 && demands.length > 0) {
      handleCalculateMRP()
    }
  }, [])

  const handleCalculateMRP = () => {
    if (!inventory || inventory.length === 0) {
      toast.error('Please add inventory items before calculating MRP')
      return
    }
    if (!products || products.length === 0) {
      toast.error('Please add products with BOM before calculating MRP')
      return
    }
    if (!demands || demands.length === 0) {
      toast.error('Please add demand entries before calculating MRP')
      return
    }

    try {
      const results = calculateMRP(products, demands, inventory)
      setMRPResults(results)
      toast.success('MRP calculation completed successfully')
      setActiveTab('report')
    } catch (error) {
      toast.error('Error calculating MRP')
      console.error(error)
    }
  }

  const hasData = (inventory?.length || 0) > 0 || (products?.length || 0) > 0 || (demands?.length || 0) > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight mb-2">MRP Calculator</h1>
          <p className="text-muted-foreground text-lg">
            Material Requirements Planning & Production Scheduling
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="bom">BOM</TabsTrigger>
            <TabsTrigger value="demand">Demand</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <InventoryManager
              inventory={inventory || []}
              onInventoryChange={setInventory}
            />
          </TabsContent>

          <TabsContent value="bom" className="space-y-4">
            <BOMManager
              products={products || []}
              onProductsChange={setProducts}
              inventory={inventory || []}
            />
          </TabsContent>

          <TabsContent value="demand" className="space-y-4">
            <DemandManager
              demands={demands || []}
              onDemandsChange={setDemands}
              products={products || []}
            />
          </TabsContent>

          <TabsContent value="report" className="space-y-4">
            <MRPReport
              results={mrpResults}
              onCalculate={handleCalculateMRP}
              hasData={hasData}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

export default App