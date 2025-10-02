'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Star, 
  Heart,
  Search,
  Filter,
  BookmarkPlus,
  ExternalLink,
  Users,
  Calendar,
  Briefcase
} from 'lucide-react';

interface PlacementOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  duration: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  rating: number;
  applicants: number;
  deadline: string;
  tags: string[];
  isBookmarked: boolean;
  isFeatured: boolean;
  postedDate: string;
  contactPerson: string;
  email: string;
}

export default function PlacementMarketplacePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<PlacementOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<PlacementOpportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [salaryFilter, setSalaryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, searchTerm, locationFilter, typeFilter, salaryFilter, activeTab]);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData: PlacementOpportunity[] = [
        {
          id: '1',
          title: 'Software Developer Intern',
          company: 'TechCorp Australia',
          location: 'Sydney, NSW',
          type: 'Internship',
          duration: '6 months',
          salary: '$25-30/hour',
          description: 'Join our dynamic development team and work on cutting-edge projects using modern technologies.',
          requirements: ['JavaScript/TypeScript', 'React', 'Node.js', 'Database knowledge'],
          benefits: ['Mentorship program', 'Flexible hours', 'Career development', 'Modern tech stack'],
          rating: 4.8,
          applicants: 23,
          deadline: '2024-02-15',
          tags: ['Tech', 'Programming', 'Graduate'],
          isBookmarked: false,
          isFeatured: true,
          postedDate: '2024-01-10',
          contactPerson: 'Sarah Johnson',
          email: 'sarah.johnson@techcorp.com.au'
        },
        {
          id: '2',
          title: 'Marketing Assistant',
          company: 'Creative Solutions Ltd',
          location: 'Melbourne, VIC',
          type: 'Full-time',
          duration: '12 months',
          salary: '$45,000-55,000',
          description: 'Support our marketing team in creating engaging campaigns and analyzing market trends.',
          requirements: ['Marketing degree', 'Social media experience', 'Adobe Creative Suite', 'Analytics tools'],
          benefits: ['Health insurance', 'Professional development budget', 'Flexible work arrangements'],
          rating: 4.5,
          applicants: 45,
          deadline: '2024-02-20',
          tags: ['Marketing', 'Creative', 'Digital'],
          isBookmarked: true,
          isFeatured: false,
          postedDate: '2024-01-12',
          contactPerson: 'Mike Chen',
          email: 'mike.chen@creativesolutions.com.au'
        },
        {
          id: '3',
          title: 'Accounting Trainee',
          company: 'Financial Partners Group',
          location: 'Brisbane, QLD',
          type: 'Part-time',
          duration: '18 months',
          salary: '$22-28/hour',
          description: 'Gain hands-on experience in accounting and financial reporting in a supportive environment.',
          requirements: ['Accounting studies', 'Excel proficiency', 'Attention to detail', 'Communication skills'],
          benefits: ['Study support', 'CPA pathway', 'Performance bonuses', 'Team events'],
          rating: 4.3,
          applicants: 31,
          deadline: '2024-02-25',
          tags: ['Finance', 'Accounting', 'Graduate'],
          isBookmarked: false,
          isFeatured: false,
          postedDate: '2024-01-08',
          contactPerson: 'Lisa Wang',
          email: 'lisa.wang@financialpartners.com.au'
        }
      ];

      setOpportunities(mockData);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load placement opportunities. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOpportunities = () => {
    let filtered = opportunities;

    // Filter by active tab
    if (activeTab === 'bookmarked') {
      filtered = filtered.filter(opp => opp.isBookmarked);
    } else if (activeTab === 'featured') {
      filtered = filtered.filter(opp => opp.isFeatured);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by location
    if (locationFilter !== 'all') {
      filtered = filtered.filter(opp =>
        opp.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(opp => opp.type === typeFilter);
    }

    setFilteredOpportunities(filtered);
  };

  const handleBookmark = async (opportunityId: string) => {
    try {
      const updatedOpportunities = opportunities.map(opp =>
        opp.id === opportunityId ? { ...opp, isBookmarked: !opp.isBookmarked } : opp
      );
      setOpportunities(updatedOpportunities);

      toast({
        title: 'Success',
        description: 'Bookmark updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update bookmark. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleApply = async (opportunity: PlacementOpportunity) => {
    try {
      // Mock application submission
      toast({
        title: 'Application Submitted',
        description: `Your application for ${opportunity.title} at ${opportunity.company} has been submitted successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleContactEmployer = (opportunity: PlacementOpportunity) => {
    window.open(`mailto:${opportunity.email}?subject=Inquiry about ${opportunity.title} position`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('all');
    setTypeFilter('all');
    setSalaryFilter('all');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Placement Marketplace</h1>
        <p className="text-gray-600">Discover and apply for placement opportunities from top employers</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="sydney">Sydney</SelectItem>
                <SelectItem value="melbourne">Melbourne</SelectItem>
                <SelectItem value="brisbane">Brisbane</SelectItem>
                <SelectItem value="perth">Perth</SelectItem>
                <SelectItem value="adelaide">Adelaide</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleClearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Opportunities ({opportunities.length})</TabsTrigger>
          <TabsTrigger value="featured">
            Featured ({opportunities.filter(o => o.isFeatured).length})
          </TabsTrigger>
          <TabsTrigger value="bookmarked">
            Bookmarked ({opportunities.filter(o => o.isBookmarked).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredOpportunities.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Building className="h-4 w-4 mr-1" />
                          {opportunity.company}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {opportunity.isFeatured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(opportunity.id)}
                          className={opportunity.isBookmarked ? 'text-red-500' : 'text-gray-500'}
                        >
                          <Heart className={`h-4 w-4 ${opportunity.isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {opportunity.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {opportunity.duration}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="outline">{opportunity.type}</Badge>
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {opportunity.salary}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{opportunity.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {opportunity.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          {opportunity.rating}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {opportunity.applicants} applicants
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {new Date(opportunity.deadline).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button
                          onClick={() => handleApply(opportunity)}
                          className="flex-1"
                        >
                          Apply Now
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleContactEmployer(opportunity)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}