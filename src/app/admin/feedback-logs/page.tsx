'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building, 
  GraduationCap, 
  BookOpen,
  Filter,
  Search,
  Calendar,
  MoreVertical,
  Eye,
  Reply,
  Flag,
  Archive,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Zap,
  Heart,
  MessageCircle,
  UserCheck,
  Settings,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FeedbackEntry {
  id: string;
  type: 'RATING' | 'COMMENT' | 'COMPLAINT' | 'SUGGESTION' | 'TESTIMONIAL';
  subject: string;
  content: string;
  rating?: number;
  category: string;
  dashboardType: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  submittedAt: Date;
  status: 'NEW' | 'REVIEWED' | 'RESPONDED' | 'RESOLVED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  responseCount: number;
  lastResponseAt?: Date;
  assignedTo?: string;
  metadata: {
    source: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    context?: any;
  };
}

interface FeedbackStats {
  total: number;
  new: number;
  avgRating: number;
  responseRate: number;
  byType: {
    rating: number;
    comment: number;
    complaint: number;
    suggestion: number;
    testimonial: number;
  };
  byDashboard: {
    student: number;
    trainer: number;
    provider: number;
    rto: number;
  };
  bySentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  trends: {
    weekly: number;
    monthly: number;
  };
}

interface FeedbackFilters {
  type: string[];
  status: string[];
  dashboardType: string[];
  sentiment: string[];
  priority: string[];
  dateRange: string;
  rating: string;
  search: string;
}

export default function FeedbackLogsPage() {
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<FeedbackEntry[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [filters, setFilters] = useState<FeedbackFilters>({
    type: [],
    status: [],
    dashboardType: [],
    sentiment: [],
    priority: [],
    dateRange: 'all',
    rating: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'submittedAt' | 'rating' | 'priority'>('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedEntry, setSelectedEntry] = useState<FeedbackEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedbackData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchFeedbackData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedbackEntries, filters, sortBy, sortOrder]);

  const fetchFeedbackData = async () => {
    try {
      // Generate sample feedback data
      const sampleFeedback = generateSampleFeedbackData();
      setFeedbackEntries(sampleFeedback);
      
      const feedbackStats = calculateStats(sampleFeedback);
      setStats(feedbackStats);
      
    } catch (error) {
      console.error('Error fetching feedback data:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleFeedbackData = (): FeedbackEntry[] => {
    const types: FeedbackEntry['type'][] = ['RATING', 'COMMENT', 'COMPLAINT', 'SUGGESTION', 'TESTIMONIAL'];
    const dashboards = ['STUDENT', 'TRAINER', 'PROVIDER', 'RTO'];
    const statuses: FeedbackEntry['status'][] = ['NEW', 'REVIEWED', 'RESPONDED', 'RESOLVED', 'ARCHIVED'];
    const priorities: FeedbackEntry['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const sentiments: FeedbackEntry['sentiment'][] = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];
    
    const sampleEntries: FeedbackEntry[] = [];
    
    for (let i = 0; i < 50; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const dashboard = dashboards[Math.floor(Math.random() * dashboards.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      
      sampleEntries.push({
        id: `feedback-${i + 1}`,
        type,
        subject: getFeedbackSubject(type, dashboard),
        content: getFeedbackContent(type, sentiment),
        rating: type === 'RATING' ? Math.floor(Math.random() * 5) + 1 : undefined,
        category: getFeedbackCategory(type),
        dashboardType: dashboard,
        submittedBy: {
          id: `user-${i + 1}`,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          role: dashboard.toLowerCase(),
          avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=user${i + 1}`
        },
        submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        status,
        priority,
        tags: getFeedbackTags(type, dashboard),
        sentiment,
        responseCount: Math.floor(Math.random() * 3),
        lastResponseAt: status !== 'NEW' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
        assignedTo: status !== 'NEW' ? `admin-${Math.floor(Math.random() * 3) + 1}` : undefined,
        metadata: {
          source: 'web-portal',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
          context: { page: `/${dashboard.toLowerCase()}/dashboard` }
        }
      });
    }
    
    return sampleEntries.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  };

  const getFeedbackSubject = (type: string, dashboard: string): string => {
    const subjects = {
      RATING: [`${dashboard} Dashboard Experience`, `Overall ${dashboard} System Rating`, `${dashboard} Interface Feedback`],
      COMMENT: [`${dashboard} System Feedback`, `General ${dashboard} Comments`, `${dashboard} User Experience`],
      COMPLAINT: [`${dashboard} System Issue`, `Problem with ${dashboard} Features`, `${dashboard} Technical Problems`],
      SUGGESTION: [`Improve ${dashboard} System`, `${dashboard} Feature Request`, `Enhancement for ${dashboard}`],
      TESTIMONIAL: [`Great ${dashboard} Experience`, `Positive ${dashboard} Feedback`, `${dashboard} Success Story`]
    };
    
    const typeSubjects = subjects[type as keyof typeof subjects] || [`${dashboard} Feedback`];
    return typeSubjects[Math.floor(Math.random() * typeSubjects.length)];
  };

  const getFeedbackContent = (type: string, sentiment: string): string => {
    const content = {
      POSITIVE: [
        "The system is working great! Very user-friendly and efficient.",
        "Love the new features and improvements. Keep up the excellent work!",
        "Outstanding service and support. Everything works smoothly.",
        "The interface is intuitive and the functionality is exactly what we needed."
      ],
      NEUTRAL: [
        "The system is okay, but could use some improvements in certain areas.",
        "Generally functional, though there are some minor issues to address.",
        "Works as expected, nothing particularly good or bad to report.",
        "Standard functionality, meets basic requirements adequately."
      ],
      NEGATIVE: [
        "Having significant issues with the system performance and reliability.",
        "The interface is confusing and difficult to navigate effectively.",
        "Frequent errors and system downtime affecting our daily operations.",
        "Missing critical features that were promised during implementation."
      ]
    };
    
    const sentimentContent = content[sentiment as keyof typeof content] || content.NEUTRAL;
    return sentimentContent[Math.floor(Math.random() * sentimentContent.length)];
  };

  const getFeedbackCategory = (type: string): string => {
    const categories = {
      RATING: 'User Experience',
      COMMENT: 'General Feedback',
      COMPLAINT: 'Technical Issues',
      SUGGESTION: 'Feature Requests',
      TESTIMONIAL: 'Success Stories'
    };
    return categories[type as keyof typeof categories] || 'General';
  };

  const getFeedbackTags = (type: string, dashboard: string): string[] => {
    const baseTags = [dashboard.toLowerCase()];
    const typeTags = {
      RATING: ['rating', 'experience'],
      COMMENT: ['feedback', 'general'],
      COMPLAINT: ['issue', 'problem'],
      SUGGESTION: ['enhancement', 'feature'],
      TESTIMONIAL: ['positive', 'success']
    };
    
    return [...baseTags, ...(typeTags[type as keyof typeof typeTags] || [])];
  };

  const calculateStats = (entries: FeedbackEntry[]): FeedbackStats => {
    const total = entries.length;
    const newEntries = entries.filter(e => e.status === 'NEW').length;
    
    const ratings = entries.filter(e => e.rating).map(e => e.rating!);
    const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
    
    const responded = entries.filter(e => e.status === 'RESPONDED' || e.status === 'RESOLVED').length;
    const responseRate = total > 0 ? (responded / total) * 100 : 0;
    
    return {
      total,
      new: newEntries,
      avgRating,
      responseRate,
      byType: {
        rating: entries.filter(e => e.type === 'RATING').length,
        comment: entries.filter(e => e.type === 'COMMENT').length,
        complaint: entries.filter(e => e.type === 'COMPLAINT').length,
        suggestion: entries.filter(e => e.type === 'SUGGESTION').length,
        testimonial: entries.filter(e => e.type === 'TESTIMONIAL').length,
      },
      byDashboard: {
        student: entries.filter(e => e.dashboardType === 'STUDENT').length,
        trainer: entries.filter(e => e.dashboardType === 'TRAINER').length,
        provider: entries.filter(e => e.dashboardType === 'PROVIDER').length,
        rto: entries.filter(e => e.dashboardType === 'RTO').length,
      },
      bySentiment: {
        positive: entries.filter(e => e.sentiment === 'POSITIVE').length,
        neutral: entries.filter(e => e.sentiment === 'NEUTRAL').length,
        negative: entries.filter(e => e.sentiment === 'NEGATIVE').length,
      },
      trends: {
        weekly: Math.floor(Math.random() * 20) - 10,
        monthly: Math.floor(Math.random() * 30) - 15,
      }
    };
  };

  const applyFilters = () => {
    let filtered = [...feedbackEntries];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.subject.toLowerCase().includes(searchLower) ||
        entry.content.toLowerCase().includes(searchLower) ||
        entry.submittedBy.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply other filters
    if (filters.type.length > 0) {
      filtered = filtered.filter(entry => filters.type.includes(entry.type));
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(entry => filters.status.includes(entry.status));
    }

    if (filters.dashboardType.length > 0) {
      filtered = filtered.filter(entry => filters.dashboardType.includes(entry.dashboardType));
    }

    if (filters.sentiment.length > 0) {
      filtered = filtered.filter(entry => filters.sentiment.includes(entry.sentiment));
    }

    if (filters.priority.length > 0) {
      filtered = filtered.filter(entry => filters.priority.includes(entry.priority));
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(entry => entry.submittedAt >= cutoffDate);
    }

    // Apply rating filter
    if (filters.rating !== 'all') {
      const rating = parseInt(filters.rating);
      filtered = filtered.filter(entry => entry.rating === rating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'priority':
          const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        default:
          aValue = a.submittedAt.getTime();
          bValue = b.submittedAt.getTime();
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredEntries(filtered);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RATING': return 'bg-blue-500 text-white';
      case 'COMMENT': return 'bg-green-500 text-white';
      case 'COMPLAINT': return 'bg-red-500 text-white';
      case 'SUGGESTION': return 'bg-purple-500 text-white';
      case 'TESTIMONIAL': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-red-100 text-red-800 border-red-200';
      case 'REVIEWED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RESPONDED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'text-green-600';
      case 'NEGATIVE': return 'text-red-600';
      case 'NEUTRAL': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return <ThumbsUp className="w-4 h-4" />;
      case 'NEGATIVE': return <ThumbsDown className="w-4 h-4" />;
      case 'NEUTRAL': return <MessageCircle className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getDashboardIcon = (type: string) => {
    switch (type) {
      case 'STUDENT': return <GraduationCap className="w-4 h-4" />;
      case 'TRAINER': return <Users className="w-4 h-4" />;
      case 'PROVIDER': return <Building className="w-4 h-4" />;
      case 'RTO': return <BookOpen className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm ml-2">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">💬 Feedback & User Logs</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and analyze user feedback across all system dashboards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchFeedbackData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Feedback Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="flex items-center p-4">
              <MessageSquare className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Entries</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <Bell className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.new}</p>
                <p className="text-xs text-muted-foreground">New</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <Star className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <Reply className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.responseRate)}%</p>
                <p className="text-xs text-muted-foreground">Response Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <ThumbsUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.bySentiment.positive}</p>
                <p className="text-xs text-muted-foreground">Positive</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <ThumbsDown className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.bySentiment.negative}</p>
                <p className="text-xs text-muted-foreground">Negative</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="feedback" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feedback">Feedback Entries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search feedback..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="comment">Comment</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                      <SelectItem value="testimonial">Testimonial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Dashboard</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All dashboards" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dashboards</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="trainer">Trainer</SelectItem>
                      <SelectItem value="provider">Provider</SelectItem>
                      <SelectItem value="rto">RTO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Feedback Entries ({filteredEntries.length})
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSortBy('submittedAt');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Date {sortBy === 'submittedAt' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />)}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSortBy('rating');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Rating {sortBy === 'rating' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />)}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={entry.submittedBy.avatar} />
                          <AvatarFallback>
                            {entry.submittedBy.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getTypeColor(entry.type)}>
                              {entry.type}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(entry.status)}>
                              {entry.status}
                            </Badge>
                            <Badge className={getPriorityColor(entry.priority)}>
                              {entry.priority}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              {getDashboardIcon(entry.dashboardType)}
                              <span>{entry.dashboardType}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${getSentimentColor(entry.sentiment)}`}>
                              {getSentimentIcon(entry.sentiment)}
                              <span className="text-xs">{entry.sentiment}</span>
                            </div>
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-1">{entry.subject}</h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{entry.content}</p>
                          
                          {entry.rating && (
                            <div className="mb-2">
                              {renderStarRating(entry.rating)}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>By: {entry.submittedBy.name} ({entry.submittedBy.role})</span>
                            <span>Category: {entry.category}</span>
                            <span>Submitted: {entry.submittedAt.toLocaleDateString()}</span>
                            {entry.responseCount > 0 && (
                              <span>Responses: {entry.responseCount}</span>
                            )}
                          </div>
                          
                          {entry.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              {entry.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedEntry(entry)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Reply className="w-4 h-4 mr-2" />
                            Respond
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="w-4 h-4 mr-2" />
                            Flag
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                {filteredEntries.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No feedback found</h3>
                    <p className="text-muted-foreground">
                      {feedbackEntries.length === 0 ? 'No feedback has been submitted yet.' : 'Try adjusting your filters to see more results.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Dashboard */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feedback by Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getTypeColor(type.toUpperCase()).split(' ')[0]}`}></div>
                        <span className="capitalize font-medium">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getTypeColor(type.toUpperCase()).split(' ')[0]}`}
                            style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feedback by Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(stats.byDashboard).map(([dashboard, count]) => (
                    <div key={dashboard} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDashboardIcon(dashboard.toUpperCase())}
                        <span className="capitalize font-medium">{dashboard}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          {/* Sentiment Analysis */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Sentiment Analysis Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.bySentiment.positive / stats.total)}`}
                            className="text-green-500"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ThumbsUp className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-green-600">Positive</h3>
                    <p className="text-2xl font-bold">{stats.bySentiment.positive}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.bySentiment.positive / stats.total) * 100) : 0}%
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.bySentiment.neutral / stats.total)}`}
                            className="text-gray-500"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-gray-600" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600">Neutral</h3>
                    <p className="text-2xl font-bold">{stats.bySentiment.neutral}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.bySentiment.neutral / stats.total) * 100) : 0}%
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.bySentiment.negative / stats.total)}`}
                            className="text-red-500"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ThumbsDown className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-red-600">Negative</h3>
                    <p className="text-2xl font-bold">{stats.bySentiment.negative}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.bySentiment.negative / stats.total) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Feedback Reports & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Feedback Analysis</AlertTitle>
                <AlertDescription>
                  Generate comprehensive reports on user feedback trends, sentiment analysis, and response rates across all dashboard types.
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  <span>Download Report</span>
                  <span className="text-xs opacity-75">Last 30 days</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="w-6 h-6 mb-2" />
                  <span>Schedule Report</span>
                  <span className="text-xs opacity-75">Weekly/Monthly</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Feedback Details</h2>
              <Button variant="ghost" onClick={() => setSelectedEntry(null)}>
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(selectedEntry.type)}>
                  {selectedEntry.type}
                </Badge>
                <Badge variant="outline" className={getStatusColor(selectedEntry.status)}>
                  {selectedEntry.status}
                </Badge>
                <Badge className={getPriorityColor(selectedEntry.priority)}>
                  {selectedEntry.priority}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold">{selectedEntry.subject}</h3>
              <p className="text-gray-700">{selectedEntry.content}</p>
              {selectedEntry.rating && (
                <div>
                  <label className="text-sm font-medium">Rating:</label>
                  {renderStarRating(selectedEntry.rating)}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium">Submitted by:</label>
                  <p>{selectedEntry.submittedBy.name} ({selectedEntry.submittedBy.email})</p>
                </div>
                <div>
                  <label className="font-medium">Dashboard:</label>
                  <p>{selectedEntry.dashboardType}</p>
                </div>
                <div>
                  <label className="font-medium">Category:</label>
                  <p>{selectedEntry.category}</p>
                </div>
                <div>
                  <label className="font-medium">Sentiment:</label>
                  <p className={getSentimentColor(selectedEntry.sentiment)}>{selectedEntry.sentiment}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Response</h4>
                <Textarea placeholder="Type your response here..." rows={4} />
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>Send Response</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}