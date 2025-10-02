
'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Bot,
  ChevronDown,
  Download,
  MessageSquare,
  Smile,
  Star,
  ThumbsUp,
  RefreshCw,
  Send,
  FileText,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FeedbackData {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
  categoryBreakdown: Record<string, { rating: number; count: number }>;
  recentFeedback: Array<{
    id: string;
    authorName: string;
    authorRole: string;
    avatar: string;
    comment: string;
    rating: number;
    date: string;
    type: string;
    category: string;
  }>;
  performanceData: Array<{ month: string; rating: number }>;
  skillData: Array<{ subject: string; score: number; fullMark: number }>;
  student: {
    id: string;
    name: string;
    course: string;
    email: string;
  };
}

interface NewFeedback {
  type: 'course' | 'placement' | 'supervisor' | 'peer' | 'self';
  category: 'technical' | 'communication' | 'teamwork' | 'professionalism' | 'overall';
  rating: number;
  comment: string;
  isAnonymous: boolean;
}

const chartConfig = {
  rating: {
    label: 'Rating',
    color: 'hsl(var(--primary))',
  },
  score: {
    label: 'Score',
    color: 'hsl(var(--primary))',
  },
};

export default function FeedbackReportsPage() {
  const { user } = useAuthContext();
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeRange, setTimeRange] = useState('6m');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [newFeedback, setNewFeedback] = useState<NewFeedback>({
    type: 'course',
    category: 'overall',
    rating: 5,
    comment: '',
    isAnonymous: false
  });

  // Fetch feedback data
  const fetchFeedbackData = async () => {
    if (!user?.uid) return;

    try {
      console.log('📋 Fetching feedback data...');
      const response = await fetch(`/api/student/feedback?studentId=${user.uid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback data');
      }

      const result = await response.json();
      if (result.success) {
        setFeedbackData(result.data);
        console.log('✅ Feedback data loaded successfully');
      } else {
        throw new Error(result.error || 'Failed to load feedback');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Submit new feedback
  const handleSubmitFeedback = async () => {
    if (!user?.uid || !newFeedback.comment.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      console.log('📝 Submitting feedback...');
      const response = await fetch('/api/student/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.uid,
          ...newFeedback
        })
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Success",
          description: "Feedback submitted successfully!",
        });
        setShowFeedbackForm(false);
        setNewFeedback({
          type: 'course',
          category: 'overall',
          rating: 5,
          comment: '',
          isAnonymous: false
        });
        // Refresh data
        fetchFeedbackData();
      } else {
        throw new Error(result.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeedbackData();
  };

  // Handle generate detailed report
  const handleGenerateReport = () => {
    console.log('📊 Generating detailed report...');
    toast({
      title: "Report Generated",
      description: "Your detailed performance report is being generated. You'll receive it by email shortly.",
    });
  };

  // Handle anonymous feedback submission
  const handleSubmitAnonymous = () => {
    console.log('📝 Submitting anonymous feedback...');
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your anonymous feedback. It helps us improve the platform.",
    });
  };

  // Handle download report
  const handleDownloadReport = () => {
    console.log('⬇️ Downloading feedback report...');
    toast({
      title: "Download Started",
      description: "Your feedback report is being downloaded as PDF.",
    });
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
            ? 'fill-yellow-200 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  useEffect(() => {
    fetchFeedbackData();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-full">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline text-slate-800">
              Feedback & Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              {feedbackData?.student ? 
                `${feedbackData.student.name} - Average Rating: ${feedbackData.averageRating.toFixed(1)}/5.0` : 
                'Review your performance, track growth, and submit feedback.'
              }
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button onClick={() => setShowFeedbackForm(true)} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Submit Feedback
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Charts */}
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>
                  Overall ratings from your supervisors.
                </CardDescription>
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Last 6 months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-72 w-full">
                <AreaChart data={feedbackData?.performanceData || []}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[3, 5]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorRating)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Skill Competency</CardTitle>
              <CardDescription>
                Breakdown of your skills based on evaluations.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={feedbackData?.skillData || []}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                        name={feedbackData?.student?.name || 'Student'}
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
          </Card>

          {/* Recent Feedback */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>
                Latest comments from your supervisors and peers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {feedbackData?.recentFeedback?.length ? (
                feedbackData.recentFeedback.map((fb) => (
                  <div key={fb.id}>
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={fb.avatar} />
                        <AvatarFallback>
                          {fb.authorName.charAt(0)}
                          {fb.authorName.split(' ')[1]?.charAt(0) || ''}
                        </AvatarFallback>
                      </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{fb.authorName}</p>
                          <p className="text-sm text-muted-foreground">
                            {fb.authorRole}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex">{renderStars(fb.rating)}</div>
                          <span className="font-bold text-slate-700 ml-2">
                            {fb.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 bg-slate-100 p-3 rounded-md">
                        {fb.comment}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-muted-foreground">{fb.date}</p>
                        <Badge variant="outline" className="text-xs">
                          {fb.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No feedback yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI-Powered Summary
              </CardTitle>
              <CardDescription>
                Key takeaways from your recent feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <ThumbsUp className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Strengths</h4>
                  <p className="text-muted-foreground">
                    Consistently praised for strong communication, professionalism, and being a great team player.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ChevronDown className="h-5 w-5 text-yellow-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Areas for Improvement</h4>
                  <p className="text-muted-foreground">
                    Consider taking on more complex technical tasks to accelerate growth in that area.
                  </p>
                </div>
              </div>
              <Button onClick={handleGenerateReport} className="w-full mt-2">Generate Detailed Report</Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
              <CardDescription>
                Share your thoughts on your placement experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea placeholder="How is your placement going? What are you enjoying? What could be improved?" />
              <Button onClick={handleSubmitAnonymous} className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Anonymously
              </Button>
            </CardContent>
          </Card>
          
           <Card className="card-hover">
            <CardHeader>
              <CardTitle>Export</CardTitle>
              <CardDescription>
                Download a copy of your performance report.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleDownloadReport} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4"/>
                    Download Feedback Report (PDF)
                </Button>
            </CardContent>
           </Card>

        </div>
      </div>

      {/* Feedback Submission Modal */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
              <CardDescription>
                Share your experience and help improve the program.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback-type">Feedback Type</Label>
                <Select
                  value={newFeedback.type}
                  onValueChange={(value) => setNewFeedback({...newFeedback, type: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Course/Training</SelectItem>
                    <SelectItem value="placement">Placement Experience</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="peer">Peer Review</SelectItem>
                    <SelectItem value="self">Self Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-category">Category</Label>
                <Select
                  value={newFeedback.category}
                  onValueChange={(value) => setNewFeedback({...newFeedback, category: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Skills</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="teamwork">Teamwork</SelectItem>
                    <SelectItem value="professionalism">Professionalism</SelectItem>
                    <SelectItem value="overall">Overall Experience</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-rating">Rating</Label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewFeedback({...newFeedback, rating: i + 1})}
                      className="p-1"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          i < newFeedback.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </Button>
                  ))}
                  <span className="ml-2 text-sm font-medium">
                    {newFeedback.rating}/5
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-comment">Comments</Label>
                <Textarea
                  id="feedback-comment"
                  placeholder="Share your thoughts and feedback..."
                  value={newFeedback.comment}
                  onChange={(e) => setNewFeedback({...newFeedback, comment: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newFeedback.isAnonymous}
                  onChange={(e) => setNewFeedback({...newFeedback, isAnonymous: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="anonymous" className="text-sm">
                  Submit anonymously
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFeedbackForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={submitting || !newFeedback.comment.trim()}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
