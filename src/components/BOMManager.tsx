import { useState } from 'react'
import { Product, BOMComponent } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash, Package, Sparkle } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface BOMManagerProps {
  products: Product[]
  onProductsChange: (products: Product[]) => void
  inventory: { id: string; name: string }[]
}

export function BOMManager({ products, onProductsChange, inventory }: BOMManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productName, setProductName] = useState('')
  const [components, setComponents] = useState<BOMComponent[]>([])

  const handleAddComponent = () => {
    const newComponent: BOMComponent = {
      id: Date.now().toString(),
      componentId: '',
      componentName: '',
      quantityPerUnit: 1,
      leadTime: 7,
    }
    setComponents([...components, newComponent])
  }

  const handleRemoveComponent = (id: string) => {
    setComponents(components.filter(component => component.id !== id))
  }

  const handleComponentChange = (id: string, field: keyof BOMComponent, value: string | number) => {
    setComponents(components.map(component => {
      if (component.id === id) {
        if (field === 'componentId') {
          const inventoryItem = inventory.find(inventoryItem => inventoryItem.id === value)
          return { ...component, componentId: value as string, componentName: inventoryItem?.name || '' }
        }
        return { ...component, [field]: value }
      }
      return component
    }))
  }

  const handleSaveProduct = () => {
    if (!productName.trim()) return

    const newProduct: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: productName,
      components: components.filter(c => c.componentId),
    }

    if (editingProduct) {
      onProductsChange(products.map(existingProduct => existingProduct.id === editingProduct.id ? newProduct : existingProduct))
    } else {
      onProductsChange([...products, newProduct])
    }

    handleCloseDialog()
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setProductName(product.name)
      setComponents([...product.components])
    } else {
      setEditingProduct(null)
      setProductName('')
      setComponents([])
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
    setProductName('')
    setComponents([])
  }

  const handleDeleteProduct = (id: string) => {
    onProductsChange(products.filter(existingProduct => existingProduct.id !== id))
  }

  const handleLoadSampleData = () => {
    if (inventory.length === 0) {
      toast.error('Please add inventory items first before creating products')
      return
    }

    const sampleProducts: Product[] = [
      {
        id: 'prod-industrial-robot',
        name: 'Industrial Robot Arm',
        components: [
          {
            id: 'comp-1',
            componentId: 'inv-electric-motor',
            componentName: 'Electric Motor 2.5HP',
            quantityPerUnit: 3,
            leadTime: 14,
          },
          {
            id: 'comp-2',
            componentId: 'inv-steel-sheet',
            componentName: 'Steel Sheet (4x8ft)',
            quantityPerUnit: 2,
            leadTime: 7,
          },
          {
            id: 'comp-3',
            componentId: 'inv-bearings',
            componentName: 'Ball Bearings 608ZZ',
            quantityPerUnit: 12,
            leadTime: 5,
          },
          {
            id: 'comp-4',
            componentId: 'inv-bolts',
            componentName: 'Bolts M12x50mm',
            quantityPerUnit: 24,
            leadTime: 3,
          },
        ],
      },
      {
        id: 'prod-conveyor-system',
        name: 'Conveyor System Module',
        components: [
          {
            id: 'comp-5',
            componentId: 'inv-aluminum-bar',
            componentName: 'Aluminum Bar Stock',
            quantityPerUnit: 4,
            leadTime: 10,
          },
          {
            id: 'comp-6',
            componentId: 'inv-electric-motor',
            componentName: 'Electric Motor 2.5HP',
            quantityPerUnit: 1,
            leadTime: 14,
          },
          {
            id: 'comp-7',
            componentId: 'inv-bearings',
            componentName: 'Ball Bearings 608ZZ',
            quantityPerUnit: 8,
            leadTime: 5,
          },
          {
            id: 'comp-8',
            componentId: 'inv-rubber-gasket',
            componentName: 'Rubber Gasket',
            quantityPerUnit: 6,
            leadTime: 7,
          },
        ],
      },
      {
        id: 'prod-control-panel',
        name: 'Control Panel Assembly',
        components: [
          {
            id: 'comp-9',
            componentId: 'inv-plastic-housing',
            componentName: 'Plastic Housing Shell',
            quantityPerUnit: 1,
            leadTime: 12,
          },
          {
            id: 'comp-10',
            componentId: 'inv-screws',
            componentName: 'Wood Screws 4x40mm',
            quantityPerUnit: 16,
            leadTime: 2,
          },
          {
            id: 'comp-11',
            componentId: 'inv-paint',
            componentName: 'Industrial Paint (5L)',
            quantityPerUnit: 0.5,
            leadTime: 5,
          },
        ],
      },
    ]

    onProductsChange(sampleProducts)
    toast.success('Sample BOM data loaded successfully')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Bill of Materials</h2>
        <div className="flex gap-2">
          {products.length === 0 && inventory.length > 0 && (
            <Button variant="outline" onClick={handleLoadSampleData}>
              <Sparkle className="mr-2" />
              Load Sample Data
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Components</Label>
                  <Button size="sm" variant="outline" onClick={handleAddComponent}>
                    <Plus className="mr-2" />
                    Add Component
                  </Button>
                </div>

                <div className="space-y-3">
                  {components.map((component) => (
                    <Card key={component.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Component</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={component.componentId}
                            onChange={(e) => handleComponentChange(component.id, 'componentId', e.target.value)}
                          >
                            <option value="">Select component</option>
                            {inventory.map(item => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity per Unit</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={component.quantityPerUnit}
                            onChange={(e) => handleComponentChange(component.id, 'quantityPerUnit', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Lead Time (days)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={component.leadTime}
                            onChange={(e) => handleComponentChange(component.id, 'leadTime', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveComponent(component.id)}
                          >
                            <Trash />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {components.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No components added yet. Click "Add Component" to start.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProduct} disabled={!productName.trim()}>
                  Save Product
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-medium mb-2">No Products Defined</h3>
          <p className="text-muted-foreground mb-4">
            Create your first product with its bill of materials to get started.
          </p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2" />
            Add First Product
          </Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Components</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {product.components.map((comp) => (
                        <div key={comp.id} className="text-muted-foreground">
                          {comp.componentName} (Qty: {comp.quantityPerUnit}, Lead: {comp.leadTime}d)
                        </div>
                      ))}
                      {product.components.length === 0 && (
                        <span className="text-muted-foreground italic">No components</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product.id)}
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
