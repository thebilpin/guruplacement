
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Trophy,
  Lightbulb,
  PlayCircle,
  Sparkles,
  FileCheck,
  Search,
  Loader2,
  Star,
  Clock,
  Users,
  Award,
  Filter,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';
import { placeholderImages } from '@/lib/placeholder-images';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  instructor: string;
  rating: number;
  enrolledCount: number;
  imageUrl: string;
  modules: Module[];
  progress?: number;
  isEnrolled?: boolean;
  completedAt?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration: number;
  isCompleted: boolean;
  resources: Resource[];
}

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'assignment';
  url: string;
  isCompleted: boolean;
}

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  difficulty: string;
  estimatedTime: number;
  isCompleted: boolean;
  points: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  earnedAt: string;
  category: string;
}

export default function LearningHubPage() {
  const { user } = useAuthContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Fetch learning data
  useEffect(() => {
    const fetchLearningData = async () => {
      if (!user?.uid) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/student/learning?studentId=${user.uid}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch learning data');
        }

        const data = await response.json();
        setCourses(data.courses || []);
        setMyCourses(data.myCourses || []);
        setRecommendedCourses(data.recommendedCourses || []);
        setWeeklyChallenge(data.weeklyChallenge);
        setAchievements(data.achievements || []);
      } catch (error) {
        console.error('Error fetching learning data:', error);
        toast({
          title: "Error",
          description: "Failed to load learning data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningData();
  }, [user?.uid]);

  const handleEnrollCourse = async (courseId: string) => {
    if (!user?.uid) return;

    try {
      const response = await fetch('/api/student/learning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.uid,
          action: 'enroll',
          courseId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enroll in course');
      }

      const data = await response.json();
      
      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, isEnrolled: true, progress: 0 }
          : course
      ));
      
      setMyCourses(prev => [...prev, data.course]);
      
      toast({
        title: "Success",
        description: "Successfully enrolled in course",
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive",
      });
    }
  };

  const handleStartChallenge = async () => {
    if (!user?.uid || !weeklyChallenge) return;

    try {
      const response = await fetch('/api/student/learning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.uid,
          action: 'startChallenge',
          challengeId: weeklyChallenge.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start challenge');
      }
      
      toast({
        title: "Challenge Started",
        description: "Good luck with your weekly challenge!",
      });
    } catch (error) {
      console.error('Error starting challenge:', error);
      toast({
        title: "Error",
        description: "Failed to start challenge",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    if (!user?.uid) return;

    try {
      const params = new URLSearchParams({
        studentId: user.uid,
        search: searchQuery,
        category: selectedCategory,
        difficulty: selectedDifficulty,
      });

      const response = await fetch(`/api/student/learning?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to search courses');
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error searching courses:', error);
      toast({
        title: "Error",
        description: "Failed to search courses",
        variant: "destructive",
      });
    }
  };

  // Handle search on input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all') {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline text-slate-800">
            Learning Hub
          </h1>
        </div>
        <p className="text-muted-foreground">
          Expand your skills with our curated micro-courses and learning paths.
        </p>
      </header>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Input 
            placeholder="Search for courses..." 
            className="h-12 pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 h-12">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="professional-skills">Professional Skills</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="aged-care">Aged Care</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-full sm:w-48 h-12">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          <TabsTrigger value="browse">Browse Courses</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              {/* Weekly Challenge */}
              {weeklyChallenge && (
                <Card className="card-hover bg-gradient-to-br from-primary to-blue-600 text-primary-foreground overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                    <CardHeader className="text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-6 w-6 text-yellow-300"/>
                        <h2 className="text-sm font-semibold uppercase tracking-wider">Weekly Challenge</h2>
                      </div>
                      <CardTitle className="text-3xl font-bold">{weeklyChallenge.title}</CardTitle>
                      <CardDescription className="text-blue-100 mt-2">
                        {weeklyChallenge.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {weeklyChallenge.estimatedTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {weeklyChallenge.points} points
                        </span>
                      </div>
                      <Button 
                        variant="secondary" 
                        className="mt-4 w-fit"
                        onClick={handleStartChallenge}
                        disabled={weeklyChallenge.isCompleted}
                      >
                        <PlayCircle className="mr-2 h-5 w-5" /> 
                        {weeklyChallenge.isCompleted ? 'Completed' : 'Start Challenge'}
                      </Button>
                    </CardHeader>
                    <div className="h-full w-full hidden md:block">
                      <Image 
                        src={weeklyChallenge.imageUrl || placeholderImages.find(p => p.id === 'learning-challenge')?.imageUrl || "https://picsum.photos/seed/learning-challenge/600/400"}
                        alt="Weekly challenge scenario"
                        width={600}
                        height={400}
                        className="object-cover h-full w-full opacity-80"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* My Recent Courses */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold font-headline text-slate-800">Continue Learning</h2>
                  <Button variant="ghost" className="text-primary hover:text-primary/80">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myCourses.slice(0, 4).map(course => (
                    <Card key={course.id} className="card-hover overflow-hidden">
                      <Image 
                        src={course.imageUrl || placeholderImages.find(p => p.id === `learning-${course.id}`)?.imageUrl || 'https://picsum.photos/seed/course/600/400'}
                        alt={course.title}
                        width={600}
                        height={400}
                        className="w-full h-40 object-cover"
                      />
                      <CardHeader>
                        <Badge variant="secondary" className="w-fit">{course.category}</Badge>
                        <CardTitle className="mt-2">{course.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {course.modules.length} modules • {course.duration} min
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-slate-600">Progress</span>
                          <span className="text-sm font-bold text-slate-800">{course.progress || 0}%</span>
                        </div>
                        <Progress value={course.progress || 0} className="h-2" />
                        <Button className="w-full mt-4">Continue Learning</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {myCourses.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
                    <p>Enroll in your first course to start learning!</p>
                  </div>
                )}
              </div>

              {/* Recommended Courses */}
              <div>
                <h2 className="text-2xl font-bold font-headline text-slate-800 mb-4">Recommended For You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedCourses.slice(0, 6).map(course => (
                    <Card key={course.id} className="card-hover flex flex-col">
                      <Image 
                        src={course.imageUrl || placeholderImages.find(p => p.id === `learning-${course.id}`)?.imageUrl || 'https://picsum.photos/seed/recommended/600/400'}
                        alt={course.title}
                        width={600}
                        height={400}
                        className="w-full h-32 object-cover"
                      />
                      <CardHeader className="flex-grow">
                        <Badge variant="outline" className="w-fit">{course.category}</Badge>
                        <CardTitle className="mt-2 text-base">{course.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor(course.duration / 60)}h {course.duration % 60}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {course.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrolledCount}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleEnrollCourse(course.id)}
                          disabled={course.isEnrolled}
                        >
                          {course.isEnrolled ? 'Enrolled' : 'Enroll Now'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-8">
              {/* AI Tutor */}
              <Card className="card-hover">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary"/>
                    <CardTitle>AI Tutor</CardTitle>
                  </div>
                  <CardDescription>Get personalized help with course material.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm p-3 bg-slate-100 rounded-md mb-4">
                    "Explain the key differences between palliative and hospice care."
                  </p>
                  <Button className="w-full">
                    <Lightbulb className="mr-2 h-4 w-4"/>
                    Ask AI Tutor
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Courses Completed</span>
                    <span className="text-lg font-bold text-primary">
                      {myCourses.filter(c => c.progress === 100).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Certificates Earned</span>
                    <span className="text-lg font-bold text-primary">{achievements.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Hours Learned</span>
                    <span className="text-lg font-bold text-primary">
                      {Math.floor(myCourses.reduce((acc, course) => acc + (course.duration * (course.progress || 0) / 100), 0) / 60)}h
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-courses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map(course => (
              <Card key={course.id} className="card-hover overflow-hidden">
                <Image 
                  src={course.imageUrl || placeholderImages.find(p => p.id === `learning-${course.id}`)?.imageUrl || 'https://picsum.photos/seed/mycourse/600/400'}
                  alt={course.title}
                  width={600}
                  height={400}
                  className="w-full h-40 object-cover"
                />
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">{course.category}</Badge>
                  <CardTitle className="mt-2">{course.title}</CardTitle>
                  <CardDescription>
                    {course.modules.length} modules • {course.instructor}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-600">Progress</span>
                    <span className="text-sm font-bold text-slate-800">{course.progress || 0}%</span>
                  </div>
                  <Progress value={course.progress || 0} className="h-2" />
                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1">
                      {course.progress === 100 ? 'Review' : 'Continue'}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{course.title}</DialogTitle>
                          <DialogDescription>{course.description}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(course.duration / 60)}h {course.duration % 60}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {course.rating}
                            </span>
                            <Badge variant="outline">{course.difficulty}</Badge>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">Course Modules</h4>
                            <div className="space-y-2">
                              {course.modules.map((module, index) => (
                                <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      module.isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      {module.isCompleted ? '✓' : index + 1}
                                    </div>
                                    <div>
                                      <h5 className="font-medium">{module.title}</h5>
                                      <p className="text-sm text-muted-foreground">{module.duration} min</p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" disabled={!module.isCompleted && index > 0 && !course.modules[index - 1].isCompleted}>
                                    {module.isCompleted ? 'Review' : 'Start'}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {myCourses.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Enrolled Courses</h3>
              <p>Browse and enroll in courses to start your learning journey!</p>
              <Button className="mt-4">Browse Courses</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Card key={course.id} className="card-hover flex flex-col">
                <Image 
                  src={course.imageUrl || placeholderImages.find(p => p.id === `learning-${course.id}`)?.imageUrl || 'https://picsum.photos/seed/browse/600/400'}
                  alt={course.title}
                  width={600}
                  height={400}
                  className="w-full h-40 object-cover"
                />
                <CardHeader className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="w-fit">{course.category}</Badge>
                    <Badge variant="secondary" className="capitalize">{course.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-base">{course.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {course.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor(course.duration / 60)}h {course.duration % 60}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {course.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.enrolledCount}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Instructor: {course.instructor}
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => handleEnrollCourse(course.id)}
                    disabled={course.isEnrolled}
                  >
                    {course.isEnrolled ? 'Enrolled' : 'Enroll Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {courses.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
              <p>Try adjusting your search filters to find more courses.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map(achievement => (
              <Card key={achievement.id} className="card-hover text-center">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{achievement.title}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Category: {achievement.category}</span>
                    <span>Earned: {new Date(achievement.earnedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {achievements.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
              <p>Complete courses and challenges to earn your first achievement!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
