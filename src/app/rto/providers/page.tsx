
'use client'

import { useEffect, useState } from 'react';
import {
  Building,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  PlusCircle,
  Search,
  Users,
  RefreshCw,
  Loader2,
  Star
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
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Provider {
  id: string;
  name: string;
  description: string;
  industry: string;
  location: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  status: string;
  capacity: number;
  currentPlacements: number;
  availableSlots: number;
  statistics: {
    totalPlacements: number;
    activePlacements: number;
    completedPlacements: number;
    cancelledPlacements: number;
    successRate: number;
    averageRating: number;
    activeContracts: number;
  };
  preferences: {
    studentTypes: string[];
    skills: string[];
    industries: string[];
  };
  compliance: {
    backgroundChecksRequired: boolean;
    insuranceVerified: boolean;
    safetyTrainingRequired: boolean;
    lastAuditDate: string | null;
  };
}

interface ProvidersStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  totalCapacity: number;
  totalAvailableSlots: number;
  totalActivePlacements: number;
  averageSuccessRate: number;
}

export default function RTOProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [stats, setStats] = useState<ProvidersStats>({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    totalCapacity: 0,
    totalAvailableSlots: 0,
    totalActivePlacements: 0,
    averageSuccessRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const { toast } = useToast();

  // Fetch providers data
  const fetchProviders = async () => {
    try {
      setLoading(true);
      console.log('🏢 Fetching RTO providers...');
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('rtoId', 'current-rto'); // In real app, get from auth context
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (industryFilter) params.append('industry', industryFilter);

      const response = await fetch(`/api/rto/providers?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProviders(data.providers || []);
          setStats(data.stats || {
            total: 0,
            active: 0,
            inactive: 0,
            pending: 0,
            totalCapacity: 0,
            totalAvailableSlots: 0,
            totalActivePlacements: 0,
            averageSuccessRate: 0,
          });
        } else {
          throw new Error(data.error || 'Failed to fetch providers');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error Loading Providers",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviders();
  };

  // Handle filter changes
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleIndustryFilterChange = (value: string) => {
    setIndustryFilter(value);
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchProviders();
  }, [statusFilter, industryFilter]);

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Providers</h1>
          <p className="text-muted-foreground mt-1">
            Browse, manage, and connect with placement providers.
          </p>
        </div>
        <div className="flex items-center space-x-2">
            <Button onClick={() => fetchProviders()} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh
            </Button>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Provider
            </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCapacity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalAvailableSlots}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full md:grow-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search providers by name or location..." 
                      className="pl-9 w-full md:w-80" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
                <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={industryFilter} onValueChange={handleIndustryFilterChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Industry" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Industries</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Aged Care">Aged Care</SelectItem>
                            <SelectItem value="Early Childhood">Early Childhood</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Loading providers...</p>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No providers found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map(p => (
                    <Card key={p.id} className="card-hover flex flex-col">
                        <CardHeader className="flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarFallback>{p.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-base">{p.name}</CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary" className="text-xs">{p.industry}</Badge>
                                      {getStatusBadge(p.status)}
                                    </div>
                                </div>
                            </div>
                             <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3 text-sm">
                             <div className="flex items-start">
                                <MapPin className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
                                <span>{p.location}</span>
                            </div>
                             <div className="flex items-start">
                                <Users className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
                                <span>{p.currentPlacements} Active Placements</span>
                            </div>
                             <div className="flex items-start">
                                <Building className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
                                <span>{p.availableSlots} Available Slots</span>
                            </div>
                            {p.statistics.averageRating > 0 && (
                              <div className="flex items-start">
                                <Star className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
                                <span>{p.statistics.averageRating.toFixed(1)} Rating</span>
                              </div>
                            )}
                            <div className="border-t pt-4 mt-2 space-y-3">
                                <p className="font-semibold text-xs text-muted-foreground uppercase">Primary Contact</p>
                                <div className="flex items-start">
                                    <div className="text-sm font-medium">{p.contactPerson}</div>
                                </div>
                                <div className="flex items-start">
                                    <Mail className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
                                    <span>{p.email}</span>
                                </div>
                                <div className="flex items-start">
                                    <Phone className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
                                    <span>{p.phone}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardContent>
                            <Button className="w-full">View Details</Button>
                        </CardContent>
                    </Card>
                ))}
              </div>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
