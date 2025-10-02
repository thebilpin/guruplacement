
'use client'
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
import { Download, Upload, FileClock, Database } from "lucide-react";

export default function AdminDataToolsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
            <div>
                <h1 className="text-3xl font-bold font-headline text-slate-800">
                    Data Tools
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage data import/export, retention, versioning, and logs.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Upload className="h-5 w-5 text-primary" />
                        <CardTitle>Import Data</CardTitle>
                    </div>
                    <CardDescription>Bulk upload users, providers, or placements from a CSV file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select data type to import..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="users">Users</SelectItem>
                            <SelectItem value="providers">Providers</SelectItem>
                            <SelectItem value="placements">Placements</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input type="file" />
                    <Button className="w-full">Start Import</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Download className="h-5 w-5 text-primary" />
                        <CardTitle>Export Data</CardTitle>
                    </div>
                    <CardDescription>Download platform data as CSV, JSON, or XML.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select data set to export..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Platform Data</SelectItem>
                            <SelectItem value="users">Users</SelectItem>
                            <SelectItem value="placements">Placements</SelectItem>
                             <SelectItem value="compliance">Compliance Logs</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select format..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="xml">XML</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button className="w-full">Generate Export</Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <FileClock className="h-5 w-5 text-primary" />
                        <CardTitle>Data Retention</CardTitle>
                    </div>
                    <CardDescription>Configure automatic data deletion policies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="retention-logs" className="flex flex-col space-y-1">
                            <span>Audit Logs</span>
                            <span className="font-normal leading-snug text-muted-foreground">Automatically delete logs older than the selected period.</span>
                        </Label>
                         <Select defaultValue="1y">
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="6m">6 Months</SelectItem>
                                <SelectItem value="1y">1 Year</SelectItem>
                                <SelectItem value="2y">2 Years</SelectItem>
                                <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="retention-inactive" className="flex flex-col space-y-1">
                            <span>Inactive User Data</span>
                            <span className="font-normal leading-snug text-muted-foreground">Delete data for users inactive for over 2 years.</span>
                        </Label>
                        <Switch id="retention-inactive" />
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-primary" />
                        <CardTitle>System Logs</CardTitle>
                    </div>
                    <CardDescription>View raw system and application logs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-900 text-white font-mono text-xs rounded-md p-4 h-56 overflow-y-auto">
                        <p>> [2024-07-19 10:30:00] INFO: User 'admin@rto.edu' logged in successfully.</p>
                        <p>> [2024-07-19 10:31:15] WARN: High memory usage detected: 85%</p>
                        <p>> [2024-07-19 10:32:05] INFO: Export job 'users_all.csv' completed.</p>
                        <p>> [2024-07-19 10:35:21] ERROR: Failed to connect to payment gateway.</p>
                    </div>
                    <Button variant="secondary" className="w-full mt-4">View Full Logs</Button>
                </CardContent>
            </Card>

        </div>
    </div>
  );
}
