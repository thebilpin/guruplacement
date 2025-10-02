
'use client'
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Beaker, Bot, Play, Repeat, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSandboxPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
            <div>
                <h1 className="text-3xl font-bold font-headline text-slate-800">
                    Admin Sandbox
                </h1>
                <p className="text-muted-foreground mt-1">
                    Test features, simulate events, and manage test data safely.
                </p>
            </div>
             <div className="flex items-center space-x-2 p-2 rounded-lg border bg-yellow-50 border-yellow-200">
                <Label htmlFor="sandbox-mode" className="font-semibold text-yellow-800">Sandbox Mode</Label>
                <Switch id="sandbox-mode" />
            </div>
        </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Bot className="h-5 w-5 text-primary"/>
                            <CardTitle>AI Simulation</CardTitle>
                        </div>
                        <CardDescription>Simulate AI model responses and behaviors.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea placeholder="Enter a prompt to test the AI..." rows={5}/>
                        <Button className="w-full"><Play className="mr-2 h-4 w-4"/>Run Simulation</Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Beaker className="h-5 w-5 text-primary"/>
                            <CardTitle>Data Actions</CardTitle>
                        </div>
                        <CardDescription>Manage your test environment data.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Button variant="outline"><Trash2 className="mr-2 h-4 w-4"/>Clear Test Data</Button>
                        <Button variant="outline"><Repeat className="mr-2 h-4 w-4"/>Reset to Snapshot</Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Simulation Logs</CardTitle>
                    <CardDescription>Real-time output from sandbox activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-900 text-white font-mono text-xs rounded-md p-4 h-96 overflow-y-auto">
                        <p>> [SIM] Sandbox mode activated.</p>
                        <p>> [SIM] AI Simulation Started. Model: gemini-2.5-flash</p>
                        <p class="text-green-400">> [SIM] AI Response: "Generated 5 placement recommendations for a nursing student."</p>
                        <p>> [SIM] Cleared 15 test user accounts.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
