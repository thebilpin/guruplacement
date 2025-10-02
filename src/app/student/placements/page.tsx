
'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Building,
  Calendar,
  Check,
  Clock,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  QrCode,
  User,
  Loader2,
  Plus,
  Edit,
  Eye,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  StopCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';

interface Placement {
  id: string;
  title: string;
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
  };
  supervisor: {
    name: string;
    email: string;
    phone: string;
    position: string;
    avatar?: string;
  };
  startDate: string;
  endDate: string;
  totalHours: number;
  completedHours: number;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  status: 'active' | 'completed' | 'upcoming';
  timeline: TimelineEvent[];
  documents: PlacementDocument[];
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  isCompleted: boolean;
  type: 'milestone' | 'evaluation' | 'submission' | 'meeting';
}

interface PlacementDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
}

interface HourLog {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

const QrCodeSvg = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800">
      <path
        fill="currentColor"
        d="M10 10h20v20h-20z m60 0h20v20h-20z m-60 60h20v20h-20z M15 15v10h10V15z m60 0v10h10V15z m-60 60v10h10v-10z M40 10h10v10h-10z m20 0h10v10h-10z m-10 10h10v10h-10z m-10 10h10v10h-10z m10 0h10v10h-10z m-20 20h10v10h-10z m10 0h10v10h-10z m20 0h10v10h-10z m10 0h10v10h-10z M10 40h10v10h-10z m20 0h10v10h-10z m10 10h10v10h-10z m-20 20h10v10h-10z m60 -50h10v10h-10z m-10 10h10v10h-10z m10 10h10v10h-10z m-20 10h10v10h-10z m10 0h10v10h-10z m10 10h10v10h-10z m10 0h10v10h-10z m-50 10h10v10h-10z m10 0h10v10h-10z m-10 10h10v10h-10z"
      />
    </svg>
  );

export default function MyPlacementsPage() {
  const { user } = useAuthContext();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [currentPlacement, setCurrentPlacement] = useState<Placement | null>(null);
  const [hourLogs, setHourLogs] = useState<HourLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingHours, setIsLoggingHours] = useState(false);
  const [newHourLog, setNewHourLog] = useState({
    date: '',
    startTime: '',
    endTime: '',
    description: '',
  });

  // Fetch placements data
  useEffect(() => {
    const fetchPlacements = async () => {
      if (!user?.uid) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/student/placements?studentId=${user.uid}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch placements');
        }

        const data = await response.json();
        setPlacements(data.placements);
        setCurrentPlacement(data.currentPlacement);
        setHourLogs(data.hourLogs || []);
      } catch (error) {
        console.error('Error fetching placements:', error);
        toast({
          title: "Error",
          description: "Failed to load placement data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlacements();
  }, [user?.uid]);

  const handleLogHours = async () => {
    if (!user?.uid || !currentPlacement || !newHourLog.date || !newHourLog.startTime || !newHourLog.endTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoggingHours(true);

      // Calculate hours
      const start = new Date(`${newHourLog.date}T${newHourLog.startTime}`);
      const end = new Date(`${newHourLog.date}T${newHourLog.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      const response = await fetch('/api/student/placements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.uid,
          placementId: currentPlacement.id,
          action: 'logHours',
          hourLog: {
            ...newHourLog,
            hours,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log hours');
      }

      const data = await response.json();
      setHourLogs(prev => [data.hourLog, ...prev]);
      setNewHourLog({ date: '', startTime: '', endTime: '', description: '' });
      
      toast({
        title: "Success",
        description: "Hours logged successfully",
      });
    } catch (error) {
      console.error('Error logging hours:', error);
      toast({
        title: "Error",
        description: "Failed to log hours",
        variant: "destructive",
      });
    } finally {
      setIsLoggingHours(false);
    }
  };

  const handleExportSummary = async () => {
    if (!user?.uid || !currentPlacement) return;

    try {
      const response = await fetch(`/api/student/placements?studentId=${user.uid}&placementId=${currentPlacement.id}&action=export`);
      
      if (!response.ok) {
        throw new Error('Failed to export summary');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `placement-summary-${currentPlacement.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Placement summary exported successfully",
      });
    } catch (error) {
      console.error('Error exporting summary:', error);
      toast({
        title: "Error",
        description: "Failed to export summary",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentPlacement) {
    return (
      <div className="p-6 bg-slate-50 min-h-full">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-headline text-slate-800">
            My Placements
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your current and past placements.
          </p>
        </header>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No Active Placement</h2>
          <p className="text-muted-foreground">You don't have any active placements at the moment.</p>
        </div>
      </div>
    );
  }

  const progressPercentage = (currentPlacement.completedHours / currentPlacement.totalHours) * 100;

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-slate-800">
          My Placements
        </h1>
        <p className="text-muted-foreground mt-1">
          Track and manage your current and past placements.
        </p>
      </header>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Placement</TabsTrigger>
          <TabsTrigger value="hours">Hour Logs</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                        <Badge variant={currentPlacement.status === 'active' ? 'default' : 'secondary'}>
                          {currentPlacement.status === 'active' ? 'Current Placement' : 'Upcoming Placement'}
                        </Badge>
                        <CardTitle className="mt-2 text-2xl">{currentPlacement.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            <Building className="h-4 w-4" /> {currentPlacement.company.name}
                        </CardDescription>
                    </div>
                    <Button onClick={handleExportSummary}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Summary
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-semibold text-slate-600">Placement Progress</h3>
                            <span className="text-sm font-bold text-slate-800">
                              {currentPlacement.completedHours} / {currentPlacement.totalHours} hours
                            </span>
                        </div>
                        <Progress value={progressPercentage} className="h-3" />
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-800">Placement Details</h3>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-3 mt-1 text-muted-foreground" />
                        <div>
                            <p className="font-medium">{currentPlacement.company.address}</p>
                            <p className="text-muted-foreground">
                              {currentPlacement.company.city}, {currentPlacement.company.state} {currentPlacement.company.postcode}
                            </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span>
                          {new Date(currentPlacement.startDate).toLocaleDateString()} - {new Date(currentPlacement.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span>
                          {currentPlacement.schedule.days.join(', ')}, {currentPlacement.schedule.startTime} - {currentPlacement.schedule.endTime}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-800">Supervisor</h3>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={currentPlacement.supervisor.avatar} />
                                <AvatarFallback>
                                  {currentPlacement.supervisor.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{currentPlacement.supervisor.name}</p>
                                <p className="text-sm text-muted-foreground">{currentPlacement.supervisor.position}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                            <span>{currentPlacement.supervisor.email}</span>
                        </div>
                        <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                            <span>{currentPlacement.supervisor.phone}</span>
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                    <CardTitle>Placement Timeline</CardTitle>
                    <CardDescription>Key dates and milestones for your placement at {currentPlacement.company.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <div className="absolute left-3 top-0 h-full w-0.5 bg-slate-200" />
                        <ul className="space-y-8">
                            {currentPlacement.timeline.map((event, index) => (
                                <li key={event.id} className="flex items-start gap-4 animate-in fade-in-50" style={{animationDelay: `${index * 100}ms`}}>
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 shrink-0 ${
                                      event.isCompleted ? 'bg-primary' : 'bg-slate-300'
                                    }`}>
                                        {event.isCompleted && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                    <div className="flex-1 -mt-1">
                                        <p className="font-semibold">{event.title}</p>
                                        <p className="text-sm text-muted-foreground">{event.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {new Date(event.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - QR Code & Quick Actions */}
            <div className="lg:col-span-1 space-y-8">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>QR Attendance</CardTitle>
                  <CardDescription>
                    Scan to log your attendance on-site.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="w-48 h-48 p-4 border rounded-lg bg-white">
                    <QrCodeSvg />
                  </div>
                  <Button className="w-full">
                    <QrCode className="mr-2 h-4 w-4" /> Scan QR Code
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Log Hours
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Log Hours</DialogTitle>
                        <DialogDescription>
                          Record your work hours for this placement.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newHourLog.date}
                            onChange={(e) => setNewHourLog(prev => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                              id="startTime"
                              type="time"
                              value={newHourLog.startTime}
                              onChange={(e) => setNewHourLog(prev => ({ ...prev, startTime: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                              id="endTime"
                              type="time"
                              value={newHourLog.endTime}
                              onChange={(e) => setNewHourLog(prev => ({ ...prev, endTime: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Textarea
                            id="description"
                            placeholder="Describe the work you did..."
                            value={newHourLog.description}
                            onChange={(e) => setNewHourLog(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleLogHours} disabled={isLoggingHours}>
                          {isLoggingHours ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Clock className="h-4 w-4 mr-2" />
                          )}
                          Log Hours
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hours" className="space-y-6">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hour Logs</CardTitle>
                <CardDescription>Track your logged hours and their approval status.</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Log Hours
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Hours</DialogTitle>
                    <DialogDescription>
                      Record your work hours for this placement.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newHourLog.date}
                        onChange={(e) => setNewHourLog(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={newHourLog.startTime}
                          onChange={(e) => setNewHourLog(prev => ({ ...prev, startTime: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={newHourLog.endTime}
                          onChange={(e) => setNewHourLog(prev => ({ ...prev, endTime: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the work you did..."
                        value={newHourLog.description}
                        onChange={(e) => setNewHourLog(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleLogHours} disabled={isLoggingHours}>
                      {isLoggingHours ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 mr-2" />
                      )}
                      Log Hours
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hourLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{new Date(log.date).toLocaleDateString()}</h4>
                        <Badge variant={
                          log.status === 'approved' ? 'default' : 
                          log.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {log.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {log.startTime} - {log.endTime} ({log.hours} hours)
                      </p>
                      {log.description && (
                        <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                      )}
                    </div>
                  </div>
                ))}
                {hourLogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hours logged yet</p>
                    <p className="text-sm">Start logging your work hours to track your progress</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
                <CardTitle>Associated Documents</CardTitle>
                <CardDescription>Relevant documents for this placement.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {currentPlacement.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                          <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary"/>
                              <div>
                                <span className="font-medium">{doc.name}</span>
                                <p className="text-xs text-muted-foreground">
                                  Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                                </p>
                              </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4"/>
                              </a>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <a href={doc.url} download>
                                <Download className="h-4 w-4"/>
                              </a>
                            </Button>
                          </div>
                      </div>
                    ))}
                    {currentPlacement.documents.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No documents available</p>
                        <p className="text-sm">Documents related to your placement will appear here</p>
                      </div>
                    )}
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
