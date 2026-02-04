import { useState } from 'react'
import { InventoryItem, ScheduledReceipt } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash, Package, Sparkle } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface InventoryManagerProps {
  inventory: InventoryItem[]
  onInventoryChange: (inventory: InventoryItem[]) => void
}

export function InventoryManager({ inventory, onInventoryChange }: InventoryManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [itemName, setItemName] = useState('')
  const [onHand, setOnHand] = useState(0)
  const [receipts, setReceipts] = useState<ScheduledReceipt[]>([])

  const handleAddReceipt = () => {
    const newReceipt: ScheduledReceipt = {
      id: Date.now().toString(),
      quantity: 0,
      dueDate: new Date().toISOString().split('T')[0],
    }
    setReceipts([...receipts, newReceipt])
  }

  const handleRemoveReceipt = (id: string) => {
    setReceipts(receipts.filter(r => r.id !== id))
  }

  const handleReceiptChange = (id: string, field: keyof ScheduledReceipt, value: string | number) => {
    setReceipts(receipts.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const handleSaveItem = () => {
    if (!itemName.trim()) return

    const newItem: InventoryItem = {
      id: editingItem?.id || Date.now().toString(),
      name: itemName,
      onHand,
      scheduledReceipts: receipts,
    }

    if (editingItem) {
      onInventoryChange(inventory.map(i => i.id === editingItem.id ? newItem : i))
    } else {
      onInventoryChange([...inventory, newItem])
    }

    handleCloseDialog()
  }

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item)
      setItemName(item.name)
      setOnHand(item.onHand)
      setReceipts([...item.scheduledReceipts])
    } else {
      setEditingItem(null)
      setItemName('')
      setOnHand(0)
      setReceipts([])
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setItemName('')
    setOnHand(0)
    setReceipts([])
  }

  const handleDeleteItem = (id: string) => {
    onInventoryChange(inventory.filter(i => i.id !== id))
  }

  const getStockStatus = (onHand: number) => {
    if (onHand <= 0) return { label: 'Out of Stock', variant: 'destructive' as const }
    if (onHand < 10) return { label: 'Low Stock', variant: 'secondary' as const }
    return { label: 'In Stock', variant: 'default' as const }
  }

  const handleLoadSampleData = () => {
    const today = new Date()
    const getDateOffset = (days: number) => {
      const date = new Date(today)
      date.setDate(date.getDate() + days)
      return date.toISOString().split('T')[0]
    }

    const sampleInventory: InventoryItem[] = [
      {
        id: 'inv-steel-sheet',
        name: 'Steel Sheet (4x8ft)',
        onHand: 45,
        scheduledReceipts: [
          { id: 'sr-1', quantity: 50, dueDate: getDateOffset(7) },
          { id: 'sr-2', quantity: 100, dueDate: getDateOffset(21) },
        ],
      },
      {
        id: 'inv-aluminum-bar',
        name: 'Aluminum Bar Stock',
        onHand: 120,
        scheduledReceipts: [
          { id: 'sr-3', quantity: 75, dueDate: getDateOffset(14) },
        ],
      },
      {
        id: 'inv-bolts',
        name: 'Bolts M12x50mm',
        onHand: 5,
        scheduledReceipts: [
          { id: 'sr-4', quantity: 500, dueDate: getDateOffset(3) },
          { id: 'sr-5', quantity: 500, dueDate: getDateOffset(17) },
        ],
      },
      {
        id: 'inv-welding-wire',
        name: 'Welding Wire (10kg spool)',
        onHand: 8,
        scheduledReceipts: [
          { id: 'sr-6', quantity: 20, dueDate: getDateOffset(10) },
        ],
      },
      {
        id: 'inv-paint',
        name: 'Industrial Paint (5L)',
        onHand: 0,
        scheduledReceipts: [
          { id: 'sr-7', quantity: 30, dueDate: getDateOffset(5) },
          { id: 'sr-8', quantity: 40, dueDate: getDateOffset(19) },
        ],
      },
      {
        id: 'inv-rubber-gasket',
        name: 'Rubber Gasket',
        onHand: 250,
        scheduledReceipts: [],
      },
      {
        id: 'inv-electric-motor',
        name: 'Electric Motor 2.5HP',
        onHand: 12,
        scheduledReceipts: [
          { id: 'sr-9', quantity: 15, dueDate: getDateOffset(28) },
        ],
      },
      {
        id: 'inv-bearings',
        name: 'Ball Bearings 608ZZ',
        onHand: 180,
        scheduledReceipts: [
          { id: 'sr-10', quantity: 200, dueDate: getDateOffset(14) },
        ],
      },
      {
        id: 'inv-plastic-housing',
        name: 'Plastic Housing Shell',
        onHand: 3,
        scheduledReceipts: [
          { id: 'sr-11', quantity: 100, dueDate: getDateOffset(6) },
          { id: 'sr-12', quantity: 150, dueDate: getDateOffset(20) },
        ],
      },
      {
        id: 'inv-screws',
        name: 'Wood Screws 4x40mm',
        onHand: 850,
        scheduledReceipts: [],
      },
    ]

    onInventoryChange(sampleInventory)
    toast.success('Sample inventory data loaded successfully')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Inventory</h2>
        <div className="flex gap-2">
          {inventory.length === 0 && (
            <Button variant="outline" onClick={handleLoadSampleData}>
              <Sparkle className="mr-2" />
              Load Sample Data
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Enter item name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="on-hand">On Hand Quantity</Label>
                  <Input
                    id="on-hand"
                    type="number"
                    min="0"
                    value={onHand}
                    onChange={(e) => setOnHand(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Scheduled Receipts</Label>
                  <Button size="sm" variant="outline" onClick={handleAddReceipt}>
                    <Plus className="mr-2" />
                    Add Receipt
                  </Button>
                </div>

                <div className="space-y-3">
                  {receipts.map((receipt) => (
                    <Card key={receipt.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="0"
                            value={receipt.quantity}
                            onChange={(e) => handleReceiptChange(receipt.id, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Due Date</Label>
                          <Input
                            type="date"
                            value={receipt.dueDate}
                            onChange={(e) => handleReceiptChange(receipt.id, 'dueDate', e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveReceipt(receipt.id)}
                          >
                            <Trash />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {receipts.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No scheduled receipts. Add receipts for incoming inventory.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleSaveItem} disabled={!itemName.trim()}>
                  Save Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {inventory.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-medium mb-2">No Inventory Items</h3>
          <p className="text-muted-foreground mb-4">
            Add inventory items to track on-hand quantities and scheduled receipts.
          </p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2" />
            Add First Item
          </Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-right">On Hand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Receipts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => {
                const status = getStockStatus(item.onHand)
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right font-mono">{item.onHand}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {item.scheduledReceipts.map((receipt) => (
                          <div key={receipt.id} className="text-muted-foreground">
                            {receipt.quantity} units on {new Date(receipt.dueDate).toLocaleDateString()}
                          </div>
                        ))}
                        {item.scheduledReceipts.length === 0 && (
                          <span className="text-muted-foreground italic">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
