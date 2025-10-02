
'use client'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'
import { ADMIN_CONTENT } from '@/lib/content'
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts'
import { useToast } from '@/hooks/use-toast'

interface AnalyticsData {
  successRateData: any[]
  churnData: any[]
  placementCategoryData: any[]
  userGrowthData: any[]
  completionRates: any
  summary: any
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setRefreshing(true)
      console.log('📈 Fetching analytics data...')
      
      const response = await fetch('/api/admin/analytics?action=dashboard')
      const result = await response.json()
      
      if (result.success) {
        setAnalyticsData(result.data)
        console.log('✅ Analytics data loaded:', result.data)
      } else {
        console.error('Failed to fetch analytics data:', result.error)
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      toast({
        title: "Error",
        description: "Failed to connect to analytics service",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleExport = async () => {
    try {
      console.log('📤 Exporting analytics data...')
      const response = await fetch('/api/admin/analytics?action=export')
      const result = await response.json()
      
      if (result.success) {
        // Create downloadable JSON file
        const dataStr = JSON.stringify(result.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
        
        toast({
          title: "Success",
          description: "Analytics data exported successfully"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to export analytics data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error exporting analytics data:', error)
      toast({
        title: "Error",
        description: "Failed to export analytics data",
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
            <p>Loading analytics data...</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
            <div>
                <h1 className="text-3xl font-bold font-headline text-slate-800">
                    {ADMIN_CONTENT.analytics.title}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {ADMIN_CONTENT.analytics.description}
                </p>
            </div>
            <div className="flex gap-2">
                <Button onClick={fetchAnalyticsData} disabled={refreshing} variant="outline">
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
                <Button onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    {ADMIN_CONTENT.analytics.exportButton}
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{ADMIN_CONTENT.analytics.charts.successRate.title}</CardTitle>
                    <CardDescription>{ADMIN_CONTENT.analytics.charts.successRate.description}</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData?.successRateData || []}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis domain={[80, 100]} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`}/>
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Line type="monotone" dataKey="rate" stroke="#0284c7" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{ADMIN_CONTENT.analytics.charts.churnPrediction.title}</CardTitle>
                    <CardDescription>{ADMIN_CONTENT.analytics.charts.churnPrediction.description}</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData?.churnData || []} layout="vertical">
                           <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={100}/>
                            <Tooltip />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>{ADMIN_CONTENT.analytics.charts.placementDrilldown.title}</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={analyticsData?.placementCategoryData || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {(analyticsData?.placementCategoryData || []).map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    </div>
  );
}
