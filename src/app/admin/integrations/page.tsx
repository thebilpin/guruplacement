'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Trash2, Copy, Zap } from 'lucide-react';
import { ADMIN_CONTENT } from '@/lib/content';

const apiKeys = [
  { id: 'prod_sk_...', name: 'Production Key', created: '2024-01-15', lastUsed: '2h ago', status: 'Active' },
  { id: 'dev_sk_...', name: 'Development Key', created: '2024-03-20', lastUsed: '3d ago', status: 'Active' },
  { id: 'test_sk_...', name: 'Staging Key', created: '2023-11-10', lastUsed: 'never', status: 'Revoked' },
];

const webhooks = [
    { url: 'https://api.example.com/webhook/placements', events: 3, status: 'Healthy' },
    { url: 'https://api.example.com/webhook/users', events: 1, status: 'Failing' },
];

export default function AdminIntegrationsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
            <div>
                <h1 className="text-3xl font-bold font-headline text-slate-800">
                    {ADMIN_CONTENT.integrations.title}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {ADMIN_CONTENT.integrations.description}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{ADMIN_CONTENT.integrations.sections.apiKeys}</CardTitle>
                    <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {ADMIN_CONTENT.integrations.buttons.createKey}
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{ADMIN_CONTENT.integrations.table.headers.name}</TableHead>
                                <TableHead>{ADMIN_CONTENT.integrations.table.headers.keyId}</TableHead>
                                <TableHead>{ADMIN_CONTENT.integrations.table.headers.created}</TableHead>
                                <TableHead>{ADMIN_CONTENT.integrations.table.headers.lastUsed}</TableHead>
                                <TableHead>{ADMIN_CONTENT.integrations.table.headers.status}</TableHead>
                                <TableHead className="text-right">{ADMIN_CONTENT.integrations.table.headers.actions}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {apiKeys.map((key) => (
                                <TableRow key={key.id}>
                                    <TableCell className="font-semibold">{key.name}</TableCell>
                                    <TableCell className="font-mono text-xs">{key.id}</TableCell>
                                    <TableCell>{key.created}</TableCell>
                                    <TableCell>{key.lastUsed}</TableCell>
                                    <TableCell>
                                        <Badge variant={key.status === 'Active' ? 'default' : 'secondary'}>
                                            {key.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon"><Copy className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{ADMIN_CONTENT.integrations.sections.webhooks}</CardTitle>
                    <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {ADMIN_CONTENT.integrations.buttons.addWebhook}
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{ADMIN_CONTENT.integrations.table.headers.url}</TableHead>
                                <TableHead>{ADMIN_CONTENT.integrations.table.headers.events}</TableHead>
                                <TableHead>{ADMIN_CONTENT.integrations.table.headers.status}</TableHead>
                                <TableHead className="text-right">{ADMIN_CONTENT.integrations.table.headers.actions}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {webhooks.map((hook, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-mono text-xs">{hook.url}</TableCell>
                                    <TableCell>{hook.events}</TableCell>
                                    <TableCell>
                                        <Badge variant={hook.status === 'Healthy' ? 'default' : 'destructive'}>
                                            {hook.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <div>
                        <CardTitle>{ADMIN_CONTENT.integrations.sections.marketplace}</CardTitle>
                        <CardDescription>Connect to popular third-party services with one click.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-center p-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">{ADMIN_CONTENT.integrations.marketplace.comingSoon}</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}