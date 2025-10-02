
'use client'

import { useEffect, useState } from 'react';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  ListFilter,
  FileDown,
  CheckCircle,
  X,
  Eye,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: string;
  studentName: string;
  studentId: string;
  course: string;
  placement: string;
  fit: number;
  status: string;
  submittedAt: string;
  avatar: string;
  contact: {
    email: string;
    phone: string;
  };
}

interface ApplicationStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  underReview: number;
}

export default function ProviderApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    underReview: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const providerId = 'current-provider'; // In real app, get from auth context
      const params = new URLSearchParams({
        providerId,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/provider/applications?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setApplications(data.applications || []);
          setStats(data.stats || {});
        } else {
          console.error('API returned error:', data.error);
          toast({
            title: "Error",
            description: "Failed to load applications",
            variant: "destructive"
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: string, data?: any) => {
    setProcessingIds(prev => new Set(prev.add(applicationId)));
    
    try {
      const response = await fetch('/api/provider/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          applicationId,
          providerId: 'current-provider',
          data
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Success",
            description: result.message
          });
          await fetchApplications(); // Refresh data
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error processing application:', error);
      toast({
        title: "Error",
        description: "Failed to process application",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      accepted: { label: 'Accepted', variant: 'default' as const },
      rejected: { label: 'Rejected', variant: 'destructive' as const },
      under_review: { label: 'Under Review', variant: 'outline' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getFitColor = (fit: number) => {
    if (fit >= 90) return 'text-green-600 bg-green-50';
    if (fit >= 80) return 'text-blue-600 bg-blue-50';
    if (fit >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchApplications();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Applications</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage student applications for your placements.
          </p>
        </div>
      </div>

        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                     <div className="relative flex-1 w-full md:grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search applications..." 
                          className="pl-9 w-full md:w-80" 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="outline">
                               <ListFilter className="h-4 w-4 mr-2" />
                               Filter: {statusFilter === 'all' ? 'All' : statusFilter}
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Applications</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setStatusFilter('accepted')}>Accepted</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>Rejected</DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                         <Button variant="outline">
                           <FileDown className="h-4 w-4 mr-2" />
                           Export CSV
                         </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[40px]"><Checkbox /></TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Placement</TableHead>
                    <TableHead className="text-center">AI Fit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                          <p className="mt-2 text-muted-foreground">Loading applications...</p>
                        </TableCell>
                      </TableRow>
                    ) : applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          <p className="text-muted-foreground">No applications found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell><Checkbox /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={app.avatar} />
                                <AvatarFallback>{app.studentName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">{app.studentName}</span>
                                <p className="text-xs text-muted-foreground">{app.course}</p>
                              </div>
                        </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{app.placement}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getFitColor(app.fit)}`}>
                            {app.fit}%
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(app.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            {app.status === 'pending' ? (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleApplicationAction(app.id, 'accept')}
                                  disabled={processingIds.has(app.id)}
                                >
                                  {processingIds.has(app.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                  Accept
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleApplicationAction(app.id, 'reject')}
                                  disabled={processingIds.has(app.id)}
                                >
                                  {processingIds.has(app.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            )}
                          </div>
                        </TableCell>
                    </TableRow>
                      ))
                    )}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
