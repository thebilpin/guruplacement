
'use client'
import { useState } from 'react';
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
import { Palette, Undo, Save } from "lucide-react";

export default function AdminThemingPage() {
    const [primaryColor, setPrimaryColor] = useState('#0284c7');
    const [accentColor, setAccentColor] = useState('#c026d3');

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
            <div>
                <h1 className="text-3xl font-bold font-headline text-slate-800">
                    Theming & Branding
                </h1>
                <p className="text-muted-foreground mt-1">
                    Customize the look and feel of the platform.
                </p>
            </div>
             <div className="flex gap-2">
                <Button variant="outline"><Undo className="mr-2 h-4 w-4"/>Reset to Defaults</Button>
                <Button><Save className="mr-2 h-4 w-4"/>Save Changes</Button>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Theme Controls</CardTitle>
                        <CardDescription>Adjust the primary and accent colors for the UI.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="primary-color">Primary Color</Label>
                            <div className="flex items-center gap-2">
                                <Input type="color" id="primary-color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-10 p-1"/>
                                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accent-color">Accent Color</Label>
                             <div className="flex items-center gap-2">
                                <Input type="color" id="accent-color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-12 h-10 p-1"/>
                                <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Logo</Label>
                            <Input type="file" />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Live Preview</CardTitle>
                         <CardDescription>Changes will be reflected here in real-time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-8 border rounded-lg space-y-6" style={{ '--primary-preview': primaryColor, '--accent-preview': accentColor } as React.CSSProperties}>
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-preview)' }}>Example Heading</h2>
                            <p>This is some example body text. It uses the default text color.</p>
                            <div className="flex gap-4">
                                <Button style={{ backgroundColor: 'var(--primary-preview)' }}>Primary Button</Button>
                                <Button style={{ backgroundColor: 'var(--accent-preview)' }}>Accent Button</Button>
                                <Button variant="outline">Outline Button</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
