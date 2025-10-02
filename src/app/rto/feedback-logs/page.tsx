'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  ThumbsUp,
  ThumbsDown,
  Star,
  TrendingUp,
  TrendingDown,
  User,
  Calendar,
  FileText,
  Search,
  Filter,
  Eye,
  Reply,
  Flag,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Download
} from 'lucide-react';

interface FeedbackEntry {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  unit?: string;
  feedbackType: 'Course' | 'Trainer' | 'Assessment' | 'Facilities' | 'Support' | 'General';
  rating: 1 | 2 | 3 | 4 | 5;
  subject: string;
  message: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  status: 'New' | 'Reviewed' | 'Responded' | 'Resolved' | 'Escalated';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  submittedAt: string;
  reviewedAt?: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  tags: string[];
  isAnonymous: boolean;
  actionRequired: boolean;
}

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  responseRate: number;
  avgResponseTime: number;
}

export default function FeedbackLogsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackEntry[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Modal states
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedback, searchTerm, typeFilter, statusFilter, sentimentFilter, ratingFilter, priorityFilter]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockFeedback: FeedbackEntry[] = [
        {
          id: '1',
          studentId: 'S001',
          studentName: 'Sarah Wilson',
          course: 'Certificate III in Business',
          unit: 'BSBCMM311',
          feedbackType: 'Trainer',
          rating: 5,
          subject: 'Excellent training delivery',
          message: 'The trainer was very knowledgeable and provided excellent support throughout the unit. The practical examples were very helpful.',
          sentiment: 'Positive',
          status: 'Responded',
          priority: 'Medium',
          submittedAt: '2024-01-25T14:30:00Z',
          reviewedAt: '2024-01-25T16:00:00Z',
          response: 'Thank you for your positive feedback! We will share this with the trainer.',
          respondedBy: 'John Smith',
          respondedAt: '2024-01-26T09:00:00Z',
          tags: ['trainer-praise', 'practical-examples'],
          isAnonymous: false,
          actionRequired: false
        },
        {
          id: '2',
          studentId: 'S002',
          studentName: 'Anonymous Student',
          course: 'Certificate IV in Leadership and Management',
          feedbackType: 'Assessment',
          rating: 2,
          subject: 'Assessment feedback was delayed',
          message: 'I submitted my assessment 3 weeks ago and still haven\'t received any feedback. This is affecting my progress.',
          sentiment: 'Negative',
          status: 'Escalated',
          priority: 'High',
          submittedAt: '2024-01-22T10:15:00Z',
          reviewedAt: '2024-01-22T11:30:00Z',
          tags: ['assessment-delay', 'feedback-delay'],
          isAnonymous: true,
          actionRequired: true
        },
        {
          id: '3',
          studentId: 'S003',
          studentName: 'Michael Chen',
          course: 'Diploma in Business Administration',
          feedbackType: 'Facilities',
          rating: 4,
          subject: 'Training facilities are good but could be improved',
          message: 'The training rooms are well-equipped but the air conditioning could be better. Sometimes it gets quite warm during afternoon sessions.',
          sentiment: 'Neutral',
          status: 'Reviewed',
          priority: 'Low',
          submittedAt: '2024-01-20T13:45:00Z',
          reviewedAt: '2024-01-21T08:30:00Z',
          tags: ['facilities', 'air-conditioning'],
          isAnonymous: false,
          actionRequired: true
        },
        {
          id: '4',
          studentId: 'S004',
          studentName: 'Lisa Rodriguez',
          course: 'Certificate III in Business',
          feedbackType: 'Course',
          rating: 5,
          subject: 'Great course structure and content',
          message: 'The course is well-structured and the content is relevant to real workplace situations. Very satisfied with my learning experience.',
          sentiment: 'Positive',
          status: 'Responded',
          priority: 'Medium',
          submittedAt: '2024-01-18T16:20:00Z',
          reviewedAt: '2024-01-19T09:00:00Z',
          response: 'We\'re delighted to hear about your positive learning experience. Thank you for your feedback!',
          respondedBy: 'Emma Davis',
          respondedAt: '2024-01-19T14:30:00Z',
          tags: ['course-praise', 'content-quality'],
          isAnonymous: false,
          actionRequired: false
        },
        {
          id: '5',
          studentId: 'S005',
          studentName: 'James Brown',
          course: 'Certificate IV in Leadership and Management',
          feedbackType: 'Support',
          rating: 1,
          subject: 'Poor student support services',
          message: 'I\'ve been trying to get help with my enrollment issues for weeks. Multiple emails and calls but no proper response. Very disappointed.',
          sentiment: 'Negative',
          status: 'New',
          priority: 'Critical',
          submittedAt: '2024-01-28T11:00:00Z',
          tags: ['support-issues', 'enrollment-problems'],
          isAnonymous: false,
          actionRequired: true
        },
        {
          id: '6',
          studentId: 'S006',
          studentName: 'Emma Watson',
          course: 'Diploma in Leadership and Management',
          feedbackType: 'General',
          rating: 4,
          subject: 'Overall good experience with minor suggestions',
          message: 'Overall very happy with the RTO. Trainers are knowledgeable and supportive. Would suggest having more online resources available.',
          sentiment: 'Positive',
          status: 'Reviewed',
          priority: 'Low',
          submittedAt: '2024-01-15T09:30:00Z',
          reviewedAt: '2024-01-16T10:00:00Z',
          tags: ['general-praise', 'online-resources-suggestion'],
          isAnonymous: false,
          actionRequired: false
        }
      ];

      setFeedback(mockFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feedback data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats - replace with actual API call
      const mockStats: FeedbackStats = {
        totalFeedback: 125,
        averageRating: 3.8,
        positiveCount: 78,
        neutralCount: 32,
        negativeCount: 15,
        responseRate: 85,
        avgResponseTime: 2.3
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = feedback;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.feedbackType === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Sentiment filter
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(item => item.sentiment === sentimentFilter);
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(item => item.rating === parseInt(ratingFilter));
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    // Sort by priority and date
    filtered.sort((a, b) => {
      const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    setFilteredFeedback(filtered);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-green-100 text-green-800';
      case 'Neutral':
        return 'bg-yellow-100 text-yellow-800';
      case 'Negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Responded':
        return 'bg-green-100 text-green-800';
      case 'Resolved':
        return 'bg-purple-100 text-purple-800';
      case 'Escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'Negative':
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-yellow-600" />;
    }
  };

  const handleViewDetails = (item: FeedbackEntry) => {
    setSelectedFeedback(item);
    setShowDetailModal(true);
  };

  const handleRespondToFeedback = (item: FeedbackEntry) => {
    setSelectedFeedback(item);
    setResponseText('');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedFeedback || !responseText.trim()) return;

    setFeedback(prev => prev.map(item =>
      item.id === selectedFeedback.id
        ? {
            ...item,
            status: 'Responded',
            response: responseText,
            respondedBy: user?.email || 'Admin',
            respondedAt: new Date().toISOString()
          }
        : item
    ));

    toast({
      title: 'Response Sent',
      description: 'Your response has been sent to the student.',
    });

    setShowResponseModal(false);
    setResponseText('');
    setSelectedFeedback(null);
  };

  const handleMarkAsReviewed = (feedbackId: string) => {
    setFeedback(prev => prev.map(item =>
      item.id === feedbackId
        ? {
            ...item,
            status: 'Reviewed',
            reviewedAt: new Date().toISOString()
          }
        : item
    ));

    toast({
      title: 'Marked as Reviewed',
      description: 'Feedback has been marked as reviewed.',
    });
  };

  const handleEscalate = (feedbackId: string) => {
    setFeedback(prev => prev.map(item =>
      item.id === feedbackId
        ? { ...item, status: 'Escalated', priority: 'High' }
        : item
    ));

    toast({
      title: 'Feedback Escalated',
      description: 'Feedback has been escalated for management review.',
    });
  };

  const currentStats = {
    total: feedback.length,
    new: feedback.filter(f => f.status === 'New').length,
    needsResponse: feedback.filter(f => f.status === 'Reviewed' && f.actionRequired).length,
    escalated: feedback.filter(f => f.status === 'Escalated').length,
    actionRequired: feedback.filter(f => f.actionRequired).length
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Feedback Management</h1>
          <p className="text-gray-600">Monitor and respond to student feedback</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchFeedback}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold">{currentStats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600">{currentStats.new}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Response</p>
                <p className="text-2xl font-bold text-yellow-600">{currentStats.needsResponse}</p>
              </div>
              <Reply className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Escalated</p>
                <p className="text-2xl font-bold text-red-600">{currentStats.escalated}</p>
              </div>
              <Flag className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Action Required</p>
                <p className="text-2xl font-bold text-orange-600">{currentStats.actionRequired}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      {stats && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Feedback Analytics</CardTitle>
            <CardDescription>Overall feedback performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Average Rating</div>
                <div className="flex justify-center mt-2">
                  {getRatingStars(Math.round(stats.averageRating))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.responseRate}%</div>
                <div className="text-sm text-gray-600">Response Rate</div>
                <div className="flex justify-center mt-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.avgResponseTime}</div>
                <div className="text-sm text-gray-600">Avg Response Time (days)</div>
              </div>
              <div className="text-center">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-lg font-bold text-green-600">{stats.positiveCount}</div>
                    <div className="text-gray-600">Positive</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">{stats.neutralCount}</div>
                    <div className="text-gray-600">Neutral</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">{stats.negativeCount}</div>
                    <div className="text-gray-600">Negative</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Course">Course</SelectItem>
                  <SelectItem value="Trainer">Trainer</SelectItem>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                  <SelectItem value="Facilities">Facilities</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Reviewed">Reviewed</SelectItem>
                  <SelectItem value="Responded">Responded</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sentiment</label>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="Positive">Positive</SelectItem>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                  <SelectItem value="Negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
                setSentimentFilter('all');
                setRatingFilter('all');
                setPriorityFilter('all');
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map((item) => (
          <Card key={item.id} className={`${item.priority === 'Critical' ? 'border-red-300 bg-red-50' : item.priority === 'High' ? 'border-orange-300 bg-orange-50' : ''}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-lg">{item.subject}</h3>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    <Badge className={getSentimentColor(item.sentiment)}>
                      <div className="flex items-center space-x-1">
                        {getSentimentIcon(item.sentiment)}
                        <span>{item.sentiment}</span>
                      </div>
                    </Badge>
                    <Badge className={getPriorityColor(item.priority)} variant="outline">
                      {item.priority}
                    </Badge>
                    {item.actionRequired && (
                      <Badge variant="destructive">Action Required</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{item.isAnonymous ? 'Anonymous' : item.studentName}</span>
                    </div>
                    <div>{item.feedbackType}</div>
                    <div>{item.course}</div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm text-gray-600">Rating:</span>
                    {getRatingStars(item.rating)}
                    <span className="text-sm text-gray-600">({item.rating}/5)</span>
                  </div>
                  <p className="text-gray-700 mb-3 line-clamp-2">{item.message}</p>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {item.response && (
                    <div className="bg-green-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Reply className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Response from {item.respondedBy}</span>
                        <span className="text-sm text-gray-600">
                          {item.respondedAt && new Date(item.respondedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-green-700">{item.response}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500">
                  {item.reviewedAt && (
                    <span>Reviewed: {new Date(item.reviewedAt).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(item)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  {item.status === 'New' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsReviewed(item.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Reviewed
                    </Button>
                  )}
                  {(item.status === 'New' || item.status === 'Reviewed') && !item.response && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespondToFeedback(item)}
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Respond
                    </Button>
                  )}
                  {item.status !== 'Escalated' && item.priority !== 'Critical' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEscalate(item.id)}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Escalate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFeedback.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Feedback Found</h3>
            <p className="text-gray-600">
              {feedback.length === 0 
                ? "No student feedback has been submitted yet."
                : "No feedback matches your current filters."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Respond to Feedback</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="font-medium">{selectedFeedback.subject}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedFeedback.message}</p>
            </div>
            <Textarea
              placeholder="Enter your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              className="mb-4"
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowResponseModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitResponse} disabled={!responseText.trim()}>
                Send Response
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}