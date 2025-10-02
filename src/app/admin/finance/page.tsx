
'use client'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, FileDown, PlusCircle, RefreshCw } from 'lucide-react'
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { useToast } from '@/hooks/use-toast'

interface FinanceData {
  revenueData: any[]
  recentTransactions: any[]
  metrics: any
  summary: any
}

export default function AdminFinancePage() {
  const [financeData, setFinanceData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchFinanceData()
  }, [])

  const fetchFinanceData = async () => {
    try {
      setRefreshing(true)
      console.log('💰 Fetching finance data...')
      
      const response = await fetch('/api/admin/finance?action=dashboard')
      const result = await response.json()
      
      if (result.success) {
        setFinanceData(result.data)
        console.log('✅ Finance data loaded:', result.data)
      } else {
        console.error('Failed to fetch finance data:', result.error)
        toast({
          title: "Error",
          description: "Failed to load finance data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching finance data:', error)
      toast({
        title: "Error",
        description: "Failed to connect to finance service",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleExport = async () => {
    try {
      console.log('📤 Exporting finance data...')
      const response = await fetch('/api/admin/finance?action=export')
      const result = await response.json()
      
      if (result.success) {
        // Create downloadable JSON file
        const dataStr = JSON.stringify(result.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `finance-export-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
        
        toast({
          title: "Success",
          description: "Finance data exported successfully"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to export finance data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error exporting finance data:', error)
      toast({
        title: "Error",
        description: "Failed to export finance data",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading finance data...</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Finance</h1>
          <p className="text-muted-foreground mt-1">
            Manage subscriptions, view transaction history, and handle refunds.
          </p>
        </div>
                <div className="flex gap-2">
          <Button onClick={fetchFinanceData} disabled={refreshing} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4"/>
            Export Report
          </Button>
        </div>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$125,430.00</div>
                    <p className="text-xs text-muted-foreground">+15.2% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">82</div>
                    <p className="text-xs text-muted-foreground">+5 new this month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Pending Refunds</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$1,200.00</div>
                    <p className="text-xs text-muted-foreground">2 requests</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">MRR</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$20,905.00</div>
                    <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card>
                <CardHeader>
                    <CardTitle>Revenue Overview (Last 6 Months)</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={financeData?.revenueData || []}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`}/>
                            <Tooltip formatter={(value) => `$${value}`} />
                            <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>A log of the latest financial activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>RTO</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(financeData?.recentTransactions || []).slice(0, 4).map((t: any) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-semibold">{t.rto}</TableCell>
                                    <TableCell>{t.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant={t.status === 'Paid' ? 'default' : 'secondary'} className={t.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{t.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
