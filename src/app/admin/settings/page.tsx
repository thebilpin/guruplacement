
'use client'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, RefreshCw } from "lucide-react";
import { useToast } from '@/hooks/use-toast'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      console.log('⚙️ Fetching settings...')
      const response = await fetch('/api/admin/settings')
      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
        console.log('✅ Settings loaded:', result.data)
      } else {
        console.error('Failed to fetch settings:', result.error)
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: "Error",
        description: "Failed to connect to settings service",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      console.log('💾 Saving settings...')
      
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'general',
          settings: settings?.general || {}
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Settings saved successfully"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to save settings",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading settings...</p>
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
                    Global Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage platform-wide settings for languages, roles, and policies.
                </p>
            </div>
             <Button onClick={saveSettings} disabled={saving}>
               <Save className={`mr-2 h-4 w-4 ${saving ? 'animate-spin' : ''}`}/>
               {saving ? 'Saving...' : 'Save All Settings'}
             </Button>
        </div>
        <Tabs defaultValue="general">
            <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 max-w-2xl">
                         <div className="space-y-2">
                            <Label>Platform Name</Label>
                            <Input defaultValue="PlacementGuru" />
                        </div>
                        <div className="space-y-2">
                            <Label>Default Language</Label>
                             <Select defaultValue="en-au">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en-au">English (Australia)</SelectItem>
                                    <SelectItem value="en-us">English (US)</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Timezone</Label>
                             <Select defaultValue="sydney">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sydney">Australia/Sydney (AEST)</SelectItem>
                                    <SelectItem value="melbourne">Australia/Melbourne</SelectItem>
                                    <SelectItem value="perth">Australia/Perth</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="security">
                <Card>
                     <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-6 max-w-2xl">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <Label htmlFor="mfa" className="flex flex-col space-y-1">
                                <span>Require Multi-Factor Authentication (MFA)</span>
                                <span className="font-normal leading-snug text-muted-foreground">Enforce MFA for all admin-level users.</span>
                            </Label>
                            <Switch id="mfa" />
                        </div>
                         <div className="space-y-2">
                            <Label>Session Timeout (minutes)</Label>
                            <Input type="number" defaultValue="60" />
                        </div>
                     </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
