import { MRPRow } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calculator, Download } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MRPReportProps {
  results: MRPRow[]
  onCalculate: () => void
  hasData: boolean
}

export function MRPReport({ results, onCalculate, hasData }: MRPReportProps) {
  const handleExport = () => {
    let csvContent = 'Item,Period,Date,Gross Requirements,Scheduled Receipts,Projected On-Hand,Net Requirements,Planned Order Receipt,Planned Order Release\n'
    
    results.forEach(row => {
      row.periods.forEach(period => {
        csvContent += `${row.itemName},${period.period},${period.date},${period.grossRequirements},${period.scheduledReceipts},${period.projectedOnHand},${period.netRequirements},${period.plannedOrderReceipt},${period.plannedOrderRelease}\n`
      })
    })

    const csvBlob = new Blob([csvContent], { type: 'text/csv' })
    const csvDownloadUrl = window.URL.createObjectURL(csvBlob)
    const csvDownloadAnchor = document.createElement('a')
    csvDownloadAnchor.href = csvDownloadUrl
    csvDownloadAnchor.download = `mrp-report-${new Date().toISOString().split('T')[0]}.csv`
    csvDownloadAnchor.click()
    window.URL.revokeObjectURL(csvDownloadUrl)
  }

  if (!hasData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">MRP Report</h2>
        </div>
        <Card className="p-12 text-center">
          <Calculator className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-muted-foreground">
            Add inventory, products, and demand to generate MRP calculations.
          </p>
        </Card>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">MRP Report</h2>
          <Button onClick={onCalculate}>
            <Calculator className="mr-2" />
            Calculate MRP
          </Button>
        </div>
        <Card className="p-12 text-center">
          <Calculator className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-medium mb-2">Ready to Calculate</h3>
          <p className="text-muted-foreground mb-4">
            Click the "Calculate MRP" button to generate your material requirements plan.
          </p>
          <Button onClick={onCalculate}>
            <Calculator className="mr-2" />
            Calculate MRP
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">MRP Report</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2" />
            Export CSV
          </Button>
          <Button onClick={onCalculate}>
            <Calculator className="mr-2" />
            Recalculate
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {results.map((row) => (
          <Card key={row.itemId} className="overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b">
              <h3 className="font-semibold text-lg">{row.itemName}</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold uppercase text-xs tracking-wide">Period</TableHead>
                    {row.periods.slice(0, 8).map((period) => (
                      <TableHead key={period.period} className="text-center font-mono text-xs">
                        {period.period}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-muted/30">
                    <TableCell className="font-medium text-sm">Date</TableCell>
                    {row.periods.slice(0, 8).map((period) => (
                      <TableCell key={period.period} className="text-center font-mono text-xs text-muted-foreground">
                        {new Date(period.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-sm">Gross Requirements</TableCell>
                    {row.periods.slice(0, 8).map((period) => (
                      <TableCell 
                        key={period.period} 
                        className={cn(
                          "text-center font-mono text-sm",
                          period.grossRequirements > 0 && "font-semibold"
                        )}
                      >
                        {period.grossRequirements || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-sm">Scheduled Receipts</TableCell>
                    {row.periods.slice(0, 8).map((period) => (
                      <TableCell 
                        key={period.period} 
                        className={cn(
                          "text-center font-mono text-sm",
                          period.scheduledReceipts > 0 && "font-semibold text-accent"
                        )}
                      >
                        {period.scheduledReceipts || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableCell className="font-medium text-sm">Projected On-Hand</TableCell>
                    {row.periods.slice(0, 8).map((period) => (
                      <TableCell 
                        key={period.period} 
                        className={cn(
                          "text-center font-mono text-sm font-semibold",
                          period.projectedOnHand < 0 ? "status-negative" : "status-positive"
                        )}
                      >
                        {period.projectedOnHand}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-sm">Net Requirements</TableCell>
                    {row.periods.slice(0, 8).map((period) => (
                      <TableCell 
                        key={period.period} 
                        className={cn(
                          "text-center font-mono text-sm",
                          period.netRequirements > 0 && "font-semibold text-destructive"
                        )}
                      >
                        {period.netRequirements || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-sm">Planned Order Receipt</TableCell>
                    {row.periods.slice(0, 8).map((period) => (
                      <TableCell 
                        key={period.period} 
                        className={cn(
                          "text-center font-mono text-sm",
                          period.plannedOrderReceipt > 0 && "font-semibold text-primary"
                        )}
                      >
                        {period.plannedOrderReceipt || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="bg-primary/5">
                    <TableCell className="font-semibold text-sm">Planned Order Release</TableCell>
                    {row.periods.slice(0, 8).map((period) => (
                      <TableCell 
                        key={period.period} 
                        className={cn(
                          "text-center font-mono text-sm",
                          period.plannedOrderRelease > 0 && "font-bold text-primary"
                        )}
                      >
                        {period.plannedOrderRelease || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
