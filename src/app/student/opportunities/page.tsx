'use client';

import { useEffect, useState } from 'react';
import {
  ArrowUpDown,
  Briefcase,
  Building,
  Heart,
  ListFilter,
  MapPin,
  Search,
  Sparkles,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

interface Opportunity {
  id: string;
  position: string;
  provider: {
    id: string;
    name: string;
    location: string;
    industry: string;
    rating: number;
    logo: string;
  };
  placement: {
    duration: number;
    hours: number;
    schedule: string;
    startDate: string;
    category: string;
    jobType: string;
    remoteAvailable: boolean;
  };
  requirements: {
    qualifications: string[];
    experience: string;
    skills: string[];
    certifications: string[];
  };
  benefits: string[];
  applicationStatus: string;
  featured: boolean;
  urgentHiring: boolean;
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    jobType: 'all',
    location: 'all',
    remoteOnly: false
  });
  const [applying, setApplying] = useState<string | null>(null);

  // Fetch opportunities from API
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams();
        
        searchParams.append('studentId', 'student-001'); // Get from auth context
        if (filters.search) searchParams.append('search', filters.search);
        if (filters.category !== 'all') searchParams.append('category', filters.category);
        if (filters.jobType !== 'all') searchParams.append('jobType', filters.jobType);
        if (filters.location !== 'all') searchParams.append('location', filters.location);
        if (filters.remoteOnly) searchParams.append('remoteOnly', 'true');

        const response = await fetch(`/api/student/opportunities?${searchParams}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setOpportunities(data.opportunities);
            setError(null);
          } else {
            setError(data.error || 'Failed to load opportunities');
          }
        } else {
          setError('Failed to fetch opportunities');
        }
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError('Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [filters]);

  // Handle search
  const handleSearch = () => {
    // Triggers useEffect with updated filters
  };

  // Handle application
  const handleApply = async (opportunityId: string) => {
    try {
      setApplying(opportunityId);
      const response = await fetch('/api/student/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: 'student-001', // Get from auth context
          opportunityId,
          applicationData: {
            coverLetter: 'I am interested in this opportunity...',
            availability: { flexible: true }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update opportunity status
          setOpportunities(prev => 
            prev.map(opp => 
              opp.id === opportunityId 
                ? { ...opp, applicationStatus: 'applied' }
                : opp
            )
          );
          alert('Application submitted successfully!');
        } else {
          alert(data.error || 'Failed to submit application');
        }
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to submit application');
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-full">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-50 min-h-full">
        <Alert className="max-w-md mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-slate-800">
          Placement Opportunities
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore and apply for placements that match your skills and goals.
        </p>
      </header>

      {/* Filters Section */}
      <Card className="mb-8 card-hover">
        <CardHeader>
            <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary"/>
                <CardTitle className="text-xl">Find Your Next Placement</CardTitle>
            </div>
          <CardDescription>
            Use the filters below to find the perfect opportunity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="relative">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <Input
                id="search"
                placeholder="Search by title, company, or keyword..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="job-type">Job Type</Label>
              <Select value={filters.jobType} onValueChange={(value) => setFilters(prev => ({ ...prev, jobType: value }))}>
                <SelectTrigger id="job-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="sydney">Sydney, NSW</SelectItem>
                  <SelectItem value="melbourne">Melbourne, VIC</SelectItem>
                  <SelectItem value="brisbane">Brisbane, QLD</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="remote-only" 
                checked={filters.remoteOnly}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, remoteOnly: checked }))}
              />
              <Label htmlFor="remote-only">Remote only</Label>
            </div>
            <div className="flex gap-2">
              <Button className="w-full lg:w-auto" onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Search Placements
              </Button>
               <Button 
                variant="ghost" 
                className="w-full lg:w-auto"
                onClick={() => setFilters({ search: '', category: 'all', jobType: 'all', location: 'all', remoteOnly: false })}
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {opportunities.length} Available Opportunities
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort by
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Featured First</DropdownMenuItem>
            <DropdownMenuItem>Newest</DropdownMenuItem>
            <DropdownMenuItem>Closest</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id} className="flex flex-col card-hover">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src={opportunity.provider.logo}
                    alt={`${opportunity.provider.name} logo`}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg border"
                  />
                  <div>
                    <CardTitle className="text-lg">{opportunity.position}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {opportunity.provider.name}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  {opportunity.featured && (
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {opportunity.urgentHiring && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{opportunity.provider.location}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span>{opportunity.placement.schedule} • {opportunity.placement.duration} weeks</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {opportunity.requirements.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
                {opportunity.placement.remoteAvailable && (
                  <Badge variant="outline">Remote</Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                className="w-full" 
                onClick={() => handleApply(opportunity.id)}
                disabled={applying === opportunity.id || opportunity.applicationStatus === 'applied'}
              >
                {applying === opportunity.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : opportunity.applicationStatus === 'applied' ? (
                  'Applied'
                ) : (
                  'Apply Now'
                )}
              </Button>
              <Button variant="outline" size="icon" className="shrink-0">
                <Heart className="h-4 w-4" />
                <span className="sr-only">Add to wishlist</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {opportunities.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No opportunities found matching your criteria.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setFilters({ search: '', category: 'all', jobType: 'all', location: 'all', remoteOnly: false })}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}