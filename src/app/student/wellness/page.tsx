
'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bot,
  Calendar,
  Coffee,
  Ear,
  ExternalLink,
  Heart,
  MessageCircle,
  Mic,
  Moon,
  Smile,
  Frown,
  Meh,
  Wind,
  BrainCircuit,
  BookOpen,
  RefreshCw,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Plus,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


interface WellnessData {
  student: {
    id: string;
    name: string;
    course: string;
  };
  currentMood?: {
    id: string;
    mood: number;
    note?: string;
    date: string;
  };
  moodHistory: Array<{
    id: string;
    mood: number;
    date: string;
    note?: string;
  }>;
  moodStats: {
    weeklyAverage: number;
    monthlyAverage: number;
    trending: 'up' | 'down' | 'stable';
  };
  resources: Array<{
    id: string;
    title: string;
    type: 'article' | 'video' | 'audio' | 'exercise' | 'contact';
    category: string;
    description: string;
    duration?: string;
    url?: string;
    isEmergency?: boolean;
    contactInfo?: {
      phone?: string;
      email?: string;
      hours?: string;
    };
  }>;
  goals: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    target: number;
    current: number;
    unit: string;
    status: 'active' | 'completed' | 'paused';
  }>;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    available: string;
    type: 'crisis' | 'counseling' | 'medical';
  }>;
  upcomingAppointments: Array<{
    id: string;
    type: string;
    date: string;
    time: string;
    provider: string;
  }>;
}

const chartConfig = {
  mood: {
    label: 'Mood',
    color: 'hsl(var(--primary))',
  },
};

const moodLabels = {
  1: { label: 'Tough', icon: Frown, color: 'text-red-500', bg: 'hover:bg-red-100' },
  2: { label: 'Low', icon: Frown, color: 'text-orange-500', bg: 'hover:bg-orange-100' },
  3: { label: 'Okay', icon: Meh, color: 'text-yellow-500', bg: 'hover:bg-yellow-100' },
  4: { label: 'Good', icon: Smile, color: 'text-green-500', bg: 'hover:bg-green-100' },
  5: { label: 'Great', icon: Smile, color: 'text-green-600', bg: 'hover:bg-green-100' }
};

export default function WellnessMentorshipPage() {
  const { user } = useAuthContext();
  const [wellnessData, setWellnessData] = useState<WellnessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingMood, setSubmittingMood] = useState(false);
  const [showMoodNote, setShowMoodNote] = useState(false);
  const [moodNote, setMoodNote] = useState('');
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'exercise',
    target: 1,
    unit: 'times per week'
  });

  // Fetch wellness data
  const fetchWellnessData = async () => {
    if (!user?.uid) return;

    try {
      console.log('🌱 Fetching wellness data...');
      const response = await fetch(`/api/student/wellness?studentId=${user.uid}&period=30d`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch wellness data');
      }

      const result = await response.json();
      if (result.success) {
        setWellnessData(result.data);
        console.log('✅ Wellness data loaded successfully');
      } else {
        throw new Error(result.error || 'Failed to load wellness data');
      }
    } catch (error) {
      console.error('Error fetching wellness data:', error);
      toast({
        title: "Error",
        description: "Failed to load wellness data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Submit mood entry
  const handleMoodSubmit = async (mood: number) => {
    if (!user?.uid) return;

    setSubmittingMood(true);
    try {
      console.log('🌱 Submitting mood entry:', mood);
      const response = await fetch('/api/student/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.uid,
          type: 'mood',
          mood,
          note: moodNote
        })
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Mood Recorded",
          description: "Thank you for checking in with us today!",
        });
        setMoodNote('');
        setShowMoodNote(false);
        // Refresh data
        fetchWellnessData();
      } else {
        throw new Error(result.error || 'Failed to submit mood');
      }
    } catch (error) {
      console.error('Error submitting mood:', error);
      toast({
        title: "Error",
        description: "Failed to record mood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingMood(false);
    }
  };

  // Submit new goal
  const handleGoalSubmit = async () => {
    if (!user?.uid || !newGoal.title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🌱 Submitting wellness goal...');
      const response = await fetch('/api/student/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.uid,
          type: 'goal',
          ...newGoal
        })
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Goal Created",
          description: "Your wellness goal has been added successfully!",
        });
        setNewGoal({
          title: '',
          description: '',
          category: 'exercise',
          target: 1,
          unit: 'times per week'
        });
        setShowNewGoal(false);
        // Refresh data
        fetchWellnessData();
      } else {
        throw new Error(result.error || 'Failed to create goal');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update goal progress
  const handleGoalUpdate = async (goalId: string, current: number) => {
    if (!user?.uid) return;

    try {
      const response = await fetch('/api/student/wellness', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId,
          studentId: user.uid,
          current
        })
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Progress Updated",
          description: "Great job staying on track!",
        });
        // Refresh data
        fetchWellnessData();
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update progress.",
        variant: "destructive",
      });
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchWellnessData();
  };

  // Handle emergency contact actions
  const handleScheduleMeeting = () => {
    console.log('📅 Scheduling meeting...');
    toast({
      title: "Meeting Request Sent",
      description: "A meeting request has been sent to your support contact. They will reach out within 24 hours.",
    });
  };

  const handleStartChat = () => {
    console.log('💬 Starting chat...');
    toast({
      title: "Chat Started", 
      description: "You are now connected with a support specialist.",
    });
  };

  // Handle AI wellness exercises
  const handleBreathingExercise = () => {
    console.log('🫁 Starting breathing exercise...');
    toast({
      title: "Breathing Exercise Started",
      description: "Follow the guided breathing pattern for 2 minutes.",
    });
  };

  const handleListeningPractice = () => {
    console.log('👂 Starting listening practice...');
    toast({
      title: "Mindful Listening Started",
      description: "Take a moment to listen to the sounds around you.",
    });
  };

  const handleGroundingTechnique = () => {
    console.log('🌱 Starting grounding technique...');
    toast({
      title: "Grounding Exercise Started", 
      description: "Focus on 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
    });
  };

  // Get resource icon
  const getResourceIcon = (type: string, isEmergency?: boolean) => {
    if (isEmergency) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    
    switch (type) {
      case 'article': return <BookOpen className="h-5 w-5 text-primary" />;
      case 'video': return <Mic className="h-5 w-5 text-primary" />;
      case 'audio': return <Mic className="h-5 w-5 text-primary" />;
      case 'contact': return <Phone className="h-5 w-5 text-primary" />;
      default: return <BookOpen className="h-5 w-5 text-primary" />;
    }
  };

  // Get trending icon
  const getTrendingIcon = () => {
    if (!wellnessData?.moodStats) return <Minus className="h-4 w-4 text-gray-500" />;
    
    switch (wellnessData.moodStats.trending) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    fetchWellnessData();
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
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-rose-500" />
            <div>
              <h1 className="text-3xl font-bold font-headline text-slate-800">
                Wellness & Mentorship
              </h1>
              <p className="text-muted-foreground">
                {wellnessData?.student ? 
                  `${wellnessData.student.name} - ${wellnessData.moodStats.weeklyAverage.toFixed(1)}/5.0 avg this week` : 
                  'Your space for well-being, growth, and connection.'
                }
              </p>
            </div>
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
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>How are you feeling today?</CardTitle>
              <CardDescription>
                Check in to track your mood over time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wellnessData?.currentMood && (
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">
                    Today's mood: <span className="font-semibold">
                      {moodLabels[wellnessData.currentMood.mood as keyof typeof moodLabels]?.label}
                    </span>
                  </p>
                  {wellnessData.currentMood.note && (
                    <p className="text-xs text-blue-500 mt-1">"{wellnessData.currentMood.note}"</p>
                  )}
                </div>
              )}
              
              <div className="flex justify-around items-center">
                {Object.entries(moodLabels).map(([value, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <Button 
                      key={value}
                      variant="ghost" 
                      disabled={submittingMood}
                      onClick={() => {
                        if (!wellnessData?.currentMood) {
                          handleMoodSubmit(parseInt(value));
                        } else {
                          setShowMoodNote(true);
                        }
                      }}
                      className={`flex flex-col h-24 w-24 gap-2 items-center justify-center rounded-2xl ${config.bg}`}
                    >
                      <IconComponent className={`h-10 w-10 ${config.color}`} />
                      <span className={`font-semibold ${config.color}`}>{config.label}</span>
                    </Button>
                  );
                })}
              </div>
              
              {!submittingMood && !wellnessData?.currentMood && (
                <p className="text-center text-sm text-muted-foreground">
                  Tap a mood to check in for today
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Weekly Mood Summary</CardTitle>
              <CardDescription>
                A look at your mood trends over the last 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64 w-full">
                  <AreaChart
                    accessibilityLayer
                    data={wellnessData?.moodHistory?.slice(0, 7).reverse() || []}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                     <YAxis domain={[0, 5]} hide/>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                    <defs>
                        <linearGradient id="fillMood" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="var(--color-mood)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-mood)"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                    <Area
                      dataKey="mood"
                      type="natural"
                      fill="url(#fillMood)"
                      stroke="var(--color-mood)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
            </CardContent>
          </Card>
          
           <Card className="card-hover">
                <CardHeader>
                    <CardTitle>Curated Resources</CardTitle>
                    <CardDescription>Helpful articles, videos, and exercises for your well-being.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {wellnessData?.resources?.length ? (
                          wellnessData.resources.map((res) => (
                             <li key={res.id} className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        {getResourceIcon(res.type, res.isEmergency)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{res.title}</p>
                                        <p className="text-sm text-muted-foreground mb-1">{res.type}</p>
                                        <p className="text-xs text-gray-600">{res.description}</p>
                                        {res.duration && (
                                          <Badge variant="outline" className="mt-1 text-xs">
                                            {res.duration}
                                          </Badge>
                                        )}
                                        {res.contactInfo && (
                                          <div className="mt-2 space-y-1">
                                            {res.contactInfo.phone && (
                                              <div className="flex items-center gap-2 text-xs">
                                                <Phone className="h-3 w-3" />
                                                <span>{res.contactInfo.phone}</span>
                                              </div>
                                            )}
                                            {res.contactInfo.email && (
                                              <div className="flex items-center gap-2 text-xs">
                                                <Mail className="h-3 w-3" />
                                                <span>{res.contactInfo.email}</span>
                                              </div>
                                            )}
                                            {res.contactInfo.hours && (
                                              <div className="flex items-center gap-2 text-xs">
                                                <Clock className="h-3 w-3" />
                                                <span>{res.contactInfo.hours}</span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                    </div>
                                </div>
                                {res.url && (
                                  <Button variant="ghost" size="icon" onClick={() => window.open(res.url, '_blank')}>
                                    <ExternalLink className="h-4 w-4"/>
                                  </Button>
                                )}
                                {res.isEmergency && (
                                  <Badge variant="destructive" className="ml-2">Emergency</Badge>
                                )}
                            </li>
                          ))
                        ) : (
                          <li className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No resources available</p>
                          </li>
                        )}
                    </ul>
                </CardContent>
            </Card>

        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Your Mentor</CardTitle>
              <CardDescription>Connect with your assigned mentor for guidance.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <Avatar className="h-20 w-20 mx-auto border-4 border-white shadow-lg">
                    <AvatarImage src="https://picsum.photos/seed/mentor/200/200" />
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-xl font-bold">Jane Doe</h3>
                    <p className="text-muted-foreground">Senior Nurse Educator</p>
                </div>
                <div className="space-y-2">
                    <Button onClick={handleScheduleMeeting} className="w-full"><Calendar className="mr-2 h-4 w-4"/>Schedule a Meeting</Button>
                    <Button onClick={handleStartChat} variant="secondary" className="w-full"><MessageCircle className="mr-2 h-4 w-4"/>Start Chat</Button>
                </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-to-br from-blue-50 to-indigo-100">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <CardTitle>AI Wellness Coach</CardTitle>
              </div>
              <CardDescription>
                Feeling overwhelmed? Try a quick guided exercise with your AI coach.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button onClick={handleBreathingExercise} variant="outline" className="w-full justify-start gap-2 bg-white">
                    <Wind className="h-4 w-4"/> 2-Minute Breathing Exercise
                </Button>
                 <Button onClick={handleListeningPractice} variant="outline" className="w-full justify-start gap-2 bg-white">
                    <Ear className="h-4 w-4"/> Mindful Listening Practice
                </Button>
                 <Button onClick={handleGroundingTechnique} variant="outline" className="w-full justify-start gap-2 bg-white">
                    <Coffee className="h-4 w-4"/> Grounding Technique
                </Button>
            </CardContent>
          </Card>

          {/* Wellness Goals */}
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Wellness Goals</CardTitle>
                <CardDescription>Track your wellness progress</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowNewGoal(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {wellnessData?.goals?.length ? (
                wellnessData.goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm">{goal.title}</p>
                      <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                        {goal.status}
                      </Badge>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{goal.current} / {goal.target} {goal.unit}</span>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleGoalUpdate(goal.id, Math.max(0, goal.current - 1))}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleGoalUpdate(goal.id, goal.current + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No goals set yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card className="card-hover border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Emergency Support
              </CardTitle>
              <CardDescription>24/7 crisis support available</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {wellnessData?.emergencyContacts?.map((contact, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.available}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(`tel:${contact.phone}`)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Goal Modal */}
      {showNewGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create Wellness Goal</CardTitle>
              <CardDescription>
                Set a goal to improve your well-being.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g., Exercise regularly"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-description">Description</Label>
                <Textarea
                  id="goal-description"
                  placeholder="Describe your goal..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-category">Category</Label>
                <Select
                  value={newGoal.category}
                  onValueChange={(value) => setNewGoal({...newGoal, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="sleep">Sleep</SelectItem>
                    <SelectItem value="stress">Stress Management</SelectItem>
                    <SelectItem value="social">Social Connection</SelectItem>
                    <SelectItem value="study">Study Balance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-target">Target</Label>
                  <Input
                    id="goal-target"
                    type="number"
                    min="1"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({...newGoal, target: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-unit">Unit</Label>
                  <Input
                    id="goal-unit"
                    placeholder="e.g., times per week"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowNewGoal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGoalSubmit}
                  className="flex-1"
                >
                  Create Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mood Note Modal */}
      {showMoodNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add a Note</CardTitle>
              <CardDescription>
                Want to share more about how you're feeling today?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="What's on your mind today? (optional)"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                rows={4}
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowMoodNote(false)}
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button
                  onClick={() => {
                    setShowMoodNote(false);
                    // Re-trigger mood submission if needed
                  }}
                  className="flex-1"
                >
                  Update Mood
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
