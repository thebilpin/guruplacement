
'use client'

import { useEffect, useState } from 'react';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  ListFilter,
  FileDown,
  Eye,
  Edit,
  Copy,
  Trash2,
  Loader2,
  Calendar,
  Users,
  MapPin,
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Placement {
  id: string;
  title: string;
  department: string;
  location: string;
  duration: string;
  status: string;
  studentsRequired: number;
  currentStudents: number;
  applications: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  supervisor: string;
  type: string;
}

interface PlacementStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
  draft: number;
  totalStudents: number;
  totalApplications: number;
}

export default function ProviderPlacementsPage() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [stats, setStats] = useState<PlacementStats>({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
    draft: 0,
    totalStudents: 0,
    totalApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const providerId = 'current-provider'; // In real app, get from auth context
      const params = new URLSearchParams({
        providerId,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/provider/placements?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPlacements(data.placements || []);
          setStats(data.stats || {});
        } else {
          console.error('API returned error:', data.error);
          toast({
            title: "Error",
            description: "Failed to load placements",
            variant: "destructive"
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching placements:', error);
      toast({
        title: "Error",
        description: "Failed to load placements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlacementAction = async (placementId: string, action: string, data?: any) => {
    setProcessingIds(prev => new Set(prev.add(placementId)));
    
    try {
      const response = await fetch('/api/provider/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          placementId,
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
          await fetchPlacements(); // Refresh data
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error processing placement:', error);
      toast({
        title: "Error",
        description: "Failed to process placement action",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(placementId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Active', variant: 'default' as const },
      pending: { label: 'Pending', variant: 'secondary' as const },
      completed: { label: 'Completed', variant: 'outline' as const },
      draft: { label: 'Draft', variant: 'secondary' as const },
      closed: { label: 'Closed', variant: 'destructive' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredPlacements = placements.filter(placement => {
    if (activeTab !== 'all' && placement.status !== activeTab) return false;
    return true;
  });

  useEffect(() => {
    fetchPlacements();
  }, [statusFilter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchPlacements();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Placements</h1>
          <p className="text-muted-foreground mt-1">
            Manage your placement opportunities.
          </p>
        </div>
        <div className="flex items-center space-x-2">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Placement
            </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Placements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Placements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Placed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center">
            <TabsList>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                    </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuItem>Status</DropdownMenuItem>
                    <DropdownMenuItem>Has Applicants</DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                <FileDown className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                </span>
                </Button>
            </div>
        </div>
        <TabsContent value="all">
            <Card>
                <CardHeader>
                     <div className="relative flex-1 w-full md:grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search placements..." 
                          className="pl-9 w-full md:w-80" 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                            <p className="mt-2 text-muted-foreground">Loading placements...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredPlacements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center">
                            <p className="text-muted-foreground">No placements found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPlacements.map((placement) => (
                          <TableRow key={placement.id}>
                            <TableCell>
                              <div>
                                <div className="font-semibold">{placement.title}</div>
                                <div className="text-sm text-muted-foreground">{placement.type}</div>
                              </div>
                            </TableCell>
                            <TableCell>{placement.department}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                                {placement.location}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                                {placement.currentStudents}/{placement.studentsRequired}
                              </div>
                            </TableCell>
                            <TableCell>{placement.applications}</TableCell>
                            <TableCell>
                              {getStatusBadge(placement.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    disabled={processingIds.has(placement.id)}
                                  >
                                    {processingIds.has(placement.id) ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <MoreHorizontal className="h-4 w-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePlacementAction(placement.id, 'duplicate')}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {placement.status === 'draft' && (
                                    <DropdownMenuItem onClick={() => handlePlacementAction(placement.id, 'publish')}>
                                      Publish
                                    </DropdownMenuItem>
                                  )}
                                  {placement.status === 'active' && (
                                    <DropdownMenuItem onClick={() => handlePlacementAction(placement.id, 'close')}>
                                      Close
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handlePlacementAction(placement.id, 'delete')}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
