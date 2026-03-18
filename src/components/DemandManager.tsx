import { useState } from 'react'
import { Demand, Product } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash, CalendarBlank, Sparkle } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface DemandManagerProps {
  demands: Demand[]
  onDemandsChange: (demands: Demand[]) => void
  products: Product[]
}

export function DemandManager({ demands, onDemandsChange, products }: DemandManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDemand, setEditingDemand] = useState<Demand | null>(null)
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])

  const handleSaveDemand = () => {
    if (!productId) return

    const product = products.find(selectedProduct => selectedProduct.id === productId)
    if (!product) return

    const newDemand: Demand = {
      id: editingDemand?.id || Date.now().toString(),
      productId,
      productName: product.name,
      quantity,
      dueDate,
    }

    if (editingDemand) {
      onDemandsChange(demands.map(existingDemand => existingDemand.id === editingDemand.id ? newDemand : existingDemand))
    } else {
      onDemandsChange([...demands, newDemand])
    }

    handleCloseDialog()
  }

  const handleOpenDialog = (demand?: Demand) => {
    if (demand) {
      setEditingDemand(demand)
      setProductId(demand.productId)
      setQuantity(demand.quantity)
      setDueDate(demand.dueDate)
    } else {
      setEditingDemand(null)
      setProductId('')
      setQuantity(1)
      setDueDate(new Date().toISOString().split('T')[0])
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingDemand(null)
    setProductId('')
    setQuantity(1)
    setDueDate(new Date().toISOString().split('T')[0])
  }

  const handleDeleteDemand = (id: string) => {
    onDemandsChange(demands.filter(existingDemand => existingDemand.id !== id))
  }

  const handleLoadSampleData = () => {
    if (products.length === 0) {
      toast.error('Please add products first before creating demands')
      return
    }

    const today = new Date()
    const getDateOffset = (days: number) => {
      const date = new Date(today)
      date.setDate(date.getDate() + days)
      return date.toISOString().split('T')[0]
    }

    const sampleDemands: Demand[] = [
      {
        id: 'dem-1',
        productId: products[0]?.id || '',
        productName: products[0]?.name || '',
        quantity: 5,
        dueDate: getDateOffset(14),
      },
      {
        id: 'dem-2',
        productId: products[1]?.id || products[0]?.id || '',
        productName: products[1]?.name || products[0]?.name || '',
        quantity: 8,
        dueDate: getDateOffset(21),
      },
      {
        id: 'dem-3',
        productId: products[0]?.id || '',
        productName: products[0]?.name || '',
        quantity: 3,
        dueDate: getDateOffset(28),
      },
      {
        id: 'dem-4',
        productId: products[2]?.id || products[0]?.id || '',
        productName: products[2]?.name || products[0]?.name || '',
        quantity: 12,
        dueDate: getDateOffset(35),
      },
      {
        id: 'dem-5',
        productId: products[1]?.id || products[0]?.id || '',
        productName: products[1]?.name || products[0]?.name || '',
        quantity: 6,
        dueDate: getDateOffset(42),
      },
    ]

    onDemandsChange(sampleDemands.filter(sampleDemand => sampleDemand.productId))
    toast.success('Sample demand data loaded successfully')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Demand Schedule</h2>
        <div className="flex gap-2">
          {demands.length === 0 && products.length > 0 && (
            <Button variant="outline" onClick={handleLoadSampleData}>
              <Sparkle className="mr-2" />
              Load Sample Data
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} disabled={products.length === 0}>
                <Plus className="mr-2" />
                Add Demand
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDemand ? 'Edit Demand' : 'Add New Demand'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <select
                  id="product"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  <option value="">Select product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleSaveDemand} disabled={!productId}>
                  Save Demand
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarBlank className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-medium mb-2">No Products Available</h3>
          <p className="text-muted-foreground">
            Add products in the BOM tab before creating demand schedules.
          </p>
        </Card>
      ) : demands.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarBlank className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-medium mb-2">No Demand Scheduled</h3>
          <p className="text-muted-foreground mb-4">
            Add demand entries to drive MRP calculations.
          </p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2" />
            Add First Demand
          </Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demands
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map((demand) => (
                  <TableRow key={demand.id}>
                    <TableCell className="font-medium">{demand.productName}</TableCell>
                    <TableCell className="text-right font-mono">{demand.quantity}</TableCell>
                    <TableCell>{new Date(demand.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(demand)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteDemand(demand.id)}
                        >
                          <Trash />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
