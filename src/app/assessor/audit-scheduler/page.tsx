'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Search,
  Filter,
  Eye,
  Plus,
  RefreshCw,
  User,
  Building,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Edit3,
  X,
  Save,
  ChevronRight,
  Activity
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AuditScheduleItem {
  id: string;
  auditId: string;
  studentId: string;
  studentName: string;
  rtoName: string;
  placementTitle: string;
  providerName: string;
  auditType: 'routine' | 'competency-check' | 'progress-review' | 'intervention' | 'final-assessment';
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // in minutes
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assessorAssigned: string;
  location: AuditLocation;
  requirements: string[];
  preparationItems: PreparationItem[];
  participants: AuditParticipant[];
  assessmentFocus: AssessmentFocus[];
  complianceAreas: string[];
  previousAuditDate?: string;
  nextScheduledAudit?: string;
  notes: string;
  reminders: AuditReminder[];
  attachments: AuditAttachment[];
  createdAt: string;
  updatedAt: string;
}

interface AuditLocation {
  type: 'workplace' | 'rto' | 'online' | 'assessment-center';
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  accessInstructions?: string;
  meetingLink?: string;
  roomNumber?: string;
  specialRequirements?: string[];
}

interface PreparationItem {
  id: string;
  description: string;
  assignedTo: 'assessor' | 'student' | 'supervisor' | 'rto-staff';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  completedDate?: string;
  notes?: string;
}

interface AuditParticipant {
  id: string;
  name: string;
  role: 'student' | 'workplace-supervisor' | 'rto-trainer' | 'assessor' | 'observer';
  email: string;
  phone?: string;
  confirmationStatus: 'pending' | 'confirmed' | 'declined';
  attendanceStatus?: 'present' | 'absent' | 'late';
  specialRequirements?: string;
}

interface AssessmentFocus {
  id: string;
  unitCode: string;
  unitTitle: string;
  competencyElements: string[];
  assessmentMethods: ('observation' | 'questioning' | 'portfolio-review' | 'simulation' | 'project-presentation')[];
  evidenceRequirements: string[];
  timeAllocation: number; // in minutes
  criticalSafetyAspects?: string[];
}

interface AuditReminder {
  id: string;
  recipientRole: 'assessor' | 'student' | 'supervisor' | 'rto-staff';
  reminderType: 'initial' | '24-hours' | '2-hours' | 'follow-up';
  scheduledTime: string;
  status: 'scheduled' | 'sent' | 'failed';
  message: string;
}

interface AuditAttachment {
  id: string;
  name: string;
  type: string;
  category: 'assessment-plan' | 'checklist' | 'evidence-guide' | 'student-work' | 'reference-material';
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  size: number;
}

export default function AuditSchedulerPage() {
  const [auditSchedule, setAuditSchedule] = useState<AuditScheduleItem[]>([]);
  const [filteredSchedule, setFilteredSchedule] = useState<AuditScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedAudit, setSelectedAudit] = useState<AuditScheduleItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchAuditSchedule();
  }, []);

  useEffect(() => {
    filterSchedule();
  }, [auditSchedule, searchTerm, statusFilter, typeFilter, priorityFilter, dateFilter]);

  const fetchAuditSchedule = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSchedule: AuditScheduleItem[] = [
        {
          id: '1',
          auditId: 'AUD-2024-ASS-001',
          studentId: 'STU001',
          studentName: 'Emily Johnson',
          rtoName: 'Tech Institute Australia',
          placementTitle: 'Certificate IV in Information Technology',
          providerName: 'TechCorp Solutions',
          auditType: 'competency-check',
          scheduledDate: '2024-02-05',
          scheduledTime: '10:00',
          duration: 120,
          status: 'confirmed',
          priority: 'high',
          assessorAssigned: 'Dr. Sarah Williams',
          location: {
            type: 'workplace',
            address: '123 Collins Street, Melbourne VIC 3000',
            contactPerson: 'Mark Thompson',
            contactPhone: '+61 3 9123 4567',
            accessInstructions: 'Reception on Level 12, ask for workplace supervisor',
            specialRequirements: ['Parking validation required']
          },
          requirements: [
            'Student portfolio review',
            'Practical demonstration of network setup',
            'Questioning on troubleshooting procedures',
            'Safety compliance observation'
          ],
          preparationItems: [
            {
              id: 'prep1',
              description: 'Review student portfolio and previous assessments',
              assignedTo: 'assessor',
              status: 'completed',
              dueDate: '2024-02-04',
              completedDate: '2024-02-03',
              notes: 'Portfolio comprehensive, good evidence quality'
            },
            {
              id: 'prep2',
              description: 'Prepare network equipment for practical assessment',
              assignedTo: 'supervisor',
              status: 'completed',
              dueDate: '2024-02-04',
              completedDate: '2024-02-04'
            },
            {
              id: 'prep3',
              description: 'Submit final project documentation',
              assignedTo: 'student',
              status: 'in-progress',
              dueDate: '2024-02-04'
            }
          ],
          participants: [
            {
              id: 'part1',
              name: 'Emily Johnson',
              role: 'student',
              email: 'emily.johnson@email.com',
              phone: '+61 400 123 456',
              confirmationStatus: 'confirmed',
              specialRequirements: 'None'
            },
            {
              id: 'part2',
              name: 'Mark Thompson',
              role: 'workplace-supervisor',
              email: 'mark.thompson@techcorp.com',
              phone: '+61 3 9123 4567',
              confirmationStatus: 'confirmed'
            },
            {
              id: 'part3',
              name: 'Dr. Sarah Williams',
              role: 'assessor',
              email: 'sarah.williams@assessments.edu.au',
              phone: '+61 400 987 654',
              confirmationStatus: 'confirmed'
            }
          ],
          assessmentFocus: [
            {
              id: 'focus1',
              unitCode: 'ICTICT308',
              unitTitle: 'Use advanced features of computer applications',
              competencyElements: [
                'Plan use of advanced features',
                'Use advanced features to complete tasks',
                'Customise software applications'
              ],
              assessmentMethods: ['observation', 'questioning', 'portfolio-review'],
              evidenceRequirements: [
                'Demonstration of advanced Excel functions',
                'Custom macro development',
                'Database query optimization'
              ],
              timeAllocation: 60
            },
            {
              id: 'focus2',
              unitCode: 'ICTICT301',
              unitTitle: 'Create user documentation',
              competencyElements: [
                'Determine documentation requirements',
                'Produce user documentation',
                'Test documentation'
              ],
              assessmentMethods: ['portfolio-review', 'questioning'],
              evidenceRequirements: [
                'User manual examples',
                'Help documentation',
                'Testing feedback incorporation'
              ],
              timeAllocation: 40
            }
          ],
          complianceAreas: [
            'WHS compliance',
            'Professional communication',
            'Time management',
            'Quality standards adherence'
          ],
          previousAuditDate: '2024-01-15',
          nextScheduledAudit: '2024-03-05',
          notes: 'Student has shown excellent progress. Focus on advanced troubleshooting skills.',
          reminders: [
            {
              id: 'rem1',
              recipientRole: 'student',
              reminderType: '24-hours',
              scheduledTime: '2024-02-04T10:00:00Z',
              status: 'sent',
              message: 'Assessment reminder: Tomorrow at 10:00 AM at TechCorp Solutions'
            },
            {
              id: 'rem2',
              recipientRole: 'supervisor',
              reminderType: '2-hours',
              scheduledTime: '2024-02-05T08:00:00Z',
              status: 'scheduled',
              message: 'Assessment starting in 2 hours. Equipment prep completed?'
            }
          ],
          attachments: [
            {
              id: 'att1',
              name: 'Assessment_Plan_ICTICT308.pdf',
              type: 'application/pdf',
              category: 'assessment-plan',
              url: '/attachments/assessment-plan.pdf',
              uploadedBy: 'Dr. Sarah Williams',
              uploadedAt: '2024-02-01T14:30:00Z',
              size: 256000
            }
          ],
          createdAt: '2024-01-25T09:00:00Z',
          updatedAt: '2024-02-03T16:30:00Z'
        },
        {
          id: '2',
          auditId: 'AUD-2024-ASS-002',
          studentId: 'STU002',
          studentName: 'James Wilson',
          rtoName: 'Business Excellence Institute',
          placementTitle: 'Diploma of Business Administration',
          providerName: 'Corporate Services Ltd',
          auditType: 'progress-review',
          scheduledDate: '2024-02-06',
          scheduledTime: '14:00',
          duration: 90,
          status: 'scheduled',
          priority: 'medium',
          assessorAssigned: 'Mark Thompson',
          location: {
            type: 'rto',
            address: '456 Business Ave, Sydney NSW 2000',
            roomNumber: 'Room 301',
            contactPerson: 'Lisa Anderson',
            contactPhone: '+61 2 9876 5432',
            accessInstructions: 'Main entrance, elevator to Level 3'
          },
          requirements: [
            'Review attendance improvement plan',
            'Assess recent project submissions',
            'Discuss career development goals',
            'Plan upcoming assessment schedule'
          ],
          preparationItems: [
            {
              id: 'prep4',
              description: 'Review attendance records and improvement plan',
              assignedTo: 'assessor',
              status: 'pending',
              dueDate: '2024-02-05'
            },
            {
              id: 'prep5',
              description: 'Prepare recent work samples for review',
              assignedTo: 'student',
              status: 'pending',
              dueDate: '2024-02-05'
            }
          ],
          participants: [
            {
              id: 'part4',
              name: 'James Wilson',
              role: 'student',
              email: 'james.wilson@email.com',
              phone: '+61 400 234 567',
              confirmationStatus: 'pending'
            },
            {
              id: 'part5',
              name: 'Mark Thompson',
              role: 'assessor',
              email: 'mark.thompson@assessments.edu.au',
              phone: '+61 400 876 543',
              confirmationStatus: 'confirmed'
            }
          ],
          assessmentFocus: [
            {
              id: 'focus3',
              unitCode: 'BSBADM502',
              unitTitle: 'Manage meetings',
              competencyElements: [
                'Prepare for meetings',
                'Conduct meetings',
                'Follow up meetings'
              ],
              assessmentMethods: ['questioning', 'portfolio-review'],
              evidenceRequirements: [
                'Meeting agendas prepared',
                'Meeting minutes examples',
                'Follow-up action tracking'
              ],
              timeAllocation: 45
            }
          ],
          complianceAreas: [
            'Attendance improvement',
            'Professional development',
            'Communication skills',
            'Project management'
          ],
          previousAuditDate: '2024-01-20',
          notes: 'Student showing improvement in attendance. Need to assess recent work quality.',
          reminders: [
            {
              id: 'rem3',
              recipientRole: 'student',
              reminderType: 'initial',
              scheduledTime: '2024-02-01T09:00:00Z',
              status: 'sent',
              message: 'Assessment scheduled for Feb 6th. Please confirm attendance and prepare work samples.'
            }
          ],
          attachments: [],
          createdAt: '2024-01-28T11:00:00Z',
          updatedAt: '2024-01-28T11:00:00Z'
        },
        {
          id: '3',
          auditId: 'AUD-2024-ASS-003',
          studentId: 'STU003',
          studentName: 'Sarah Chen',
          rtoName: 'Health Sciences Academy',
          placementTitle: 'Certificate III in Individual Support',
          providerName: 'Community Care Services',
          auditType: 'intervention',
          scheduledDate: '2024-02-07',
          scheduledTime: '09:30',
          duration: 180,
          status: 'confirmed',
          priority: 'urgent',
          assessorAssigned: 'Lisa Anderson',
          location: {
            type: 'workplace',
            address: '789 Care Street, Brisbane QLD 4000',
            contactPerson: 'Jennifer Brown',
            contactPhone: '+61 7 3456 7890',
            accessInstructions: 'Staff entrance, visitor badges required',
            specialRequirements: ['Police clearance verification', 'Health screening current']
          },
          requirements: [
            'Competency gap analysis review',
            'Practical skills demonstration',
            'Remedial action plan development',
            'Supervisor consultation'
          ],
          preparationItems: [
            {
              id: 'prep6',
              description: 'Review competency gap analysis report',
              assignedTo: 'assessor',
              status: 'completed',
              dueDate: '2024-02-06',
              completedDate: '2024-02-05'
            },
            {
              id: 'prep7',
              description: 'Arrange client interaction scenario',
              assignedTo: 'supervisor',
              status: 'in-progress',
              dueDate: '2024-02-06'
            },
            {
              id: 'prep8',
              description: 'Complete self-assessment reflection',
              assignedTo: 'student',
              status: 'pending',
              dueDate: '2024-02-06'
            }
          ],
          participants: [
            {
              id: 'part6',
              name: 'Sarah Chen',
              role: 'student',
              email: 'sarah.chen@email.com',
              phone: '+61 400 345 678',
              confirmationStatus: 'confirmed'
            },
            {
              id: 'part7',
              name: 'Jennifer Brown',
              role: 'workplace-supervisor',
              email: 'jennifer.brown@communitycare.org',
              phone: '+61 7 3456 7890',
              confirmationStatus: 'confirmed'
            },
            {
              id: 'part8',
              name: 'Lisa Anderson',
              role: 'assessor',
              email: 'lisa.anderson@assessments.edu.au',
              phone: '+61 400 765 432',
              confirmationStatus: 'confirmed'
            }
          ],
          assessmentFocus: [
            {
              id: 'focus4',
              unitCode: 'CHCCOM005',
              unitTitle: 'Communicate and work in health or community services',
              competencyElements: [
                'Communicate effectively with people',
                'Communicate effectively in the workplace',
                'Complete workplace documentation'
              ],
              assessmentMethods: ['observation', 'simulation', 'questioning'],
              evidenceRequirements: [
                'Client interaction demonstration',
                'Team communication examples',
                'Documentation completion'
              ],
              timeAllocation: 90,
              criticalSafetyAspects: [
                'Client confidentiality protocols',
                'Incident reporting procedures',
                'Emergency response protocols'
              ]
            }
          ],
          complianceAreas: [
            'Client safety protocols',
            'Professional boundaries',
            'Documentation accuracy',
            'Ethical practice standards'
          ],
          previousAuditDate: '2024-01-22',
          notes: 'Intensive intervention required. Student needs additional support to meet competency standards.',
          reminders: [
            {
              id: 'rem4',
              recipientRole: 'student',
              reminderType: '24-hours',
              scheduledTime: '2024-02-06T09:30:00Z',
              status: 'scheduled',
              message: 'Important assessment tomorrow. Please ensure all preparation items are completed.'
            }
          ],
          attachments: [
            {
              id: 'att2',
              name: 'Competency_Gap_Analysis.pdf',
              type: 'application/pdf',
              category: 'assessment-plan',
              url: '/attachments/gap-analysis.pdf',
              uploadedBy: 'Lisa Anderson',
              uploadedAt: '2024-02-01T10:15:00Z',
              size: 384000
            }
          ],
          createdAt: '2024-01-28T14:00:00Z',
          updatedAt: '2024-02-05T12:00:00Z'
        }
      ];

      setAuditSchedule(mockSchedule);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch audit schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSchedule = () => {
    let filtered = auditSchedule;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.auditId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rtoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.placementTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.providerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.auditType === typeFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    if (dateFilter !== 'all') {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(item => item.scheduledDate === todayStr);
          break;
        case 'tomorrow':
          filtered = filtered.filter(item => item.scheduledDate === tomorrowStr);
          break;
        case 'this-week':
          filtered = filtered.filter(item => item.scheduledDate >= todayStr && item.scheduledDate <= weekFromNow);
          break;
        case 'overdue':
          filtered = filtered.filter(item => item.scheduledDate < todayStr && !['completed', 'cancelled'].includes(item.status));
          break;
      }
    }

    setFilteredSchedule(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'in-progress':
        return <Badge className="bg-purple-100 text-purple-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge className="bg-orange-100 text-orange-800">Rescheduled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      'routine': 'Routine',
      'competency-check': 'Competency Check',
      'progress-review': 'Progress Review',
      'intervention': 'Intervention',
      'final-assessment': 'Final Assessment'
    };

    return <Badge variant="outline">{typeLabels[type as keyof typeof typeLabels] || type}</Badge>;
  };

  const getScheduleStats = () => {
    const total = auditSchedule.length;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = auditSchedule.filter(item => item.scheduledDate === today).length;
    const confirmedCount = auditSchedule.filter(item => item.status === 'confirmed').length;
    const urgentCount = auditSchedule.filter(item => item.priority === 'urgent').length;
    const overdueCount = auditSchedule.filter(item => 
      item.scheduledDate < today && !['completed', 'cancelled'].includes(item.status)
    ).length;

    return { total, todayCount, confirmedCount, urgentCount, overdueCount };
  };

  const stats = getScheduleStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading audit schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Scheduler (Assessment Check)</h1>
          <p className="text-gray-600 mt-2">Schedule and manage student assessment audits</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Audit
          </Button>
          <Button variant="outline" onClick={fetchAuditSchedule}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.urgentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdueCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by student, audit ID, RTO, or placement"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="competency-check">Competency Check</SelectItem>
                  <SelectItem value="progress-review">Progress Review</SelectItem>
                  <SelectItem value="intervention">Intervention</SelectItem>
                  <SelectItem value="final-assessment">Final Assessment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule List */}
      <div className="grid gap-6">
        {filteredSchedule.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No audits scheduled</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No audit sessions scheduled.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSchedule.map((audit) => (
            <Card key={audit.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{audit.studentName}</h3>
                      {getStatusBadge(audit.status)}
                      {getPriorityBadge(audit.priority)}
                      {getTypeBadge(audit.auditType)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {audit.auditId}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {audit.rtoName}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {audit.placementTitle}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {new Date(audit.scheduledDate).toLocaleDateString()} at {audit.scheduledTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{audit.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm">{audit.assessorAssigned}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {audit.location.type === 'workplace' ? 'Workplace' : 
                         audit.location.type === 'rto' ? 'RTO' : 
                         audit.location.type === 'online' ? 'Online' : 'Assessment Center'}
                        {audit.location.address && ` - ${audit.location.address}`}
                        {audit.location.roomNumber && ` (${audit.location.roomNumber})`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedAudit(audit)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{audit.studentName} - Assessment Audit</DialogTitle>
                          <DialogDescription>
                            {audit.auditId} • {new Date(audit.scheduledDate).toLocaleDateString()} at {audit.scheduledTime} • {audit.duration} minutes
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="preparation">Preparation</TabsTrigger>
                            <TabsTrigger value="participants">Participants</TabsTrigger>
                            <TabsTrigger value="assessment">Assessment Focus</TabsTrigger>
                            <TabsTrigger value="logistics">Logistics</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Student Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div>
                                    <Label className="text-sm font-medium">Name</Label>
                                    <p className="text-sm text-gray-600">{audit.studentName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">RTO</Label>
                                    <p className="text-sm text-gray-600">{audit.rtoName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Placement</Label>
                                    <p className="text-sm text-gray-600">{audit.placementTitle}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Provider</Label>
                                    <p className="text-sm text-gray-600">{audit.providerName}</p>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Audit Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Status</span>
                                    {getStatusBadge(audit.status)}
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Priority</span>
                                    {getPriorityBadge(audit.priority)}
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Type</span>
                                    {getTypeBadge(audit.auditType)}
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Assessor</span>
                                    <span className="text-sm">{audit.assessorAssigned}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Duration</span>
                                    <span className="text-sm">{audit.duration} minutes</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Requirements</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {audit.requirements.map((requirement, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                      <span className="text-sm">{requirement}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                            
                            {audit.notes && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Assessor Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-gray-700">{audit.notes}</p>
                                </CardContent>
                              </Card>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="preparation" className="space-y-4">
                            <div className="space-y-3">
                              {audit.preparationItems.map((item) => (
                                <Card key={item.id}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <h5 className="font-medium">{item.description}</h5>
                                        <div className="text-sm text-gray-600 mt-1">
                                          <p>Assigned to: {item.assignedTo.replace('-', ' ')}</p>
                                          <p>Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                                          {item.completedDate && (
                                            <p>Completed: {new Date(item.completedDate).toLocaleDateString()}</p>
                                          )}
                                          {item.notes && <p>Notes: {item.notes}</p>}
                                        </div>
                                      </div>
                                      <Badge variant={
                                        item.status === 'completed' ? 'default' :
                                        item.status === 'in-progress' ? 'secondary' :
                                        'outline'
                                      }>
                                        {item.status}
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="participants" className="space-y-4">
                            <div className="space-y-3">
                              {audit.participants.map((participant) => (
                                <Card key={participant.id}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <h5 className="font-medium">{participant.name}</h5>
                                        <div className="text-sm text-gray-600 mt-1">
                                          <p>Role: {participant.role.replace('-', ' ')}</p>
                                          <p>Email: {participant.email}</p>
                                          {participant.phone && <p>Phone: {participant.phone}</p>}
                                          {participant.specialRequirements && (
                                            <p>Special Requirements: {participant.specialRequirements}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-1 items-end">
                                        <Badge variant={
                                          participant.confirmationStatus === 'confirmed' ? 'default' :
                                          participant.confirmationStatus === 'declined' ? 'destructive' :
                                          'secondary'
                                        }>
                                          {participant.confirmationStatus}
                                        </Badge>
                                        {participant.attendanceStatus && (
                                          <Badge variant={
                                            participant.attendanceStatus === 'present' ? 'default' :
                                            participant.attendanceStatus === 'absent' ? 'destructive' :
                                            'secondary'
                                          }>
                                            {participant.attendanceStatus}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="assessment" className="space-y-4">
                            <div className="space-y-4">
                              {audit.assessmentFocus.map((focus) => (
                                <Card key={focus.id}>
                                  <CardHeader>
                                    <div className="flex justify-between items-center">
                                      <CardTitle className="text-lg">{focus.unitCode} - {focus.unitTitle}</CardTitle>
                                      <Badge variant="outline">{focus.timeAllocation} minutes</Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium">Competency Elements</Label>
                                        <ul className="mt-2 space-y-1">
                                          {focus.competencyElements.map((element, index) => (
                                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                              <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                                              {element}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      
                                      <div>
                                        <Label className="text-sm font-medium">Assessment Methods</Label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {focus.assessmentMethods.map((method, index) => (
                                            <Badge key={index} variant="outline">
                                              {method.replace('-', ' ')}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <Label className="text-sm font-medium">Evidence Requirements</Label>
                                        <ul className="mt-2 space-y-1">
                                          {focus.evidenceRequirements.map((requirement, index) => (
                                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                              {requirement}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      
                                      {focus.criticalSafetyAspects && focus.criticalSafetyAspects.length > 0 && (
                                        <div>
                                          <Label className="text-sm font-medium">Critical Safety Aspects</Label>
                                          <ul className="mt-2 space-y-1">
                                            {focus.criticalSafetyAspects.map((aspect, index) => (
                                              <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                                                <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                                                {aspect}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Compliance Areas</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {audit.complianceAreas.map((area, index) => (
                                    <Badge key={index} variant="outline">{area}</Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          
                          <TabsContent value="logistics" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Location Details</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium">Type</Label>
                                  <p className="text-sm text-gray-600 capitalize">{audit.location.type.replace('-', ' ')}</p>
                                </div>
                                {audit.location.address && (
                                  <div>
                                    <Label className="text-sm font-medium">Address</Label>
                                    <p className="text-sm text-gray-600">{audit.location.address}</p>
                                  </div>
                                )}
                                {audit.location.roomNumber && (
                                  <div>
                                    <Label className="text-sm font-medium">Room</Label>
                                    <p className="text-sm text-gray-600">{audit.location.roomNumber}</p>
                                  </div>
                                )}
                                {audit.location.contactPerson && (
                                  <div>
                                    <Label className="text-sm font-medium">Contact Person</Label>
                                    <p className="text-sm text-gray-600">{audit.location.contactPerson}</p>
                                    {audit.location.contactPhone && (
                                      <p className="text-sm text-gray-600">{audit.location.contactPhone}</p>
                                    )}
                                  </div>
                                )}
                                {audit.location.accessInstructions && (
                                  <div>
                                    <Label className="text-sm font-medium">Access Instructions</Label>
                                    <p className="text-sm text-gray-600">{audit.location.accessInstructions}</p>
                                  </div>
                                )}
                                {audit.location.meetingLink && (
                                  <div>
                                    <Label className="text-sm font-medium">Meeting Link</Label>
                                    <p className="text-sm text-blue-600">{audit.location.meetingLink}</p>
                                  </div>
                                )}
                                {audit.location.specialRequirements && audit.location.specialRequirements.length > 0 && (
                                  <div>
                                    <Label className="text-sm font-medium">Special Requirements</Label>
                                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                                      {audit.location.specialRequirements.map((requirement, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
                                          {requirement}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Reminders & Notifications</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {audit.reminders.map((reminder) => (
                                    <div key={reminder.id} className="border rounded-lg p-3">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">
                                            {reminder.reminderType.replace('-', ' ')} reminder for {reminder.recipientRole.replace('-', ' ')}
                                          </p>
                                          <p className="text-sm text-gray-600 mt-1">{reminder.message}</p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            Scheduled: {new Date(reminder.scheduledTime).toLocaleString()}
                                          </p>
                                        </div>
                                        <Badge variant={
                                          reminder.status === 'sent' ? 'default' :
                                          reminder.status === 'failed' ? 'destructive' :
                                          'secondary'
                                        }>
                                          {reminder.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                            
                            {audit.attachments.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Attachments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    {audit.attachments.map((attachment) => (
                                      <div key={attachment.id} className="flex justify-between items-center border rounded-lg p-3">
                                        <div className="flex-1">
                                          <h5 className="font-medium">{attachment.name}</h5>
                                          <div className="text-sm text-gray-600">
                                            <p>Category: {attachment.category.replace('-', ' ')}</p>
                                            <p>Uploaded by: {attachment.uploadedBy}</p>
                                            <p>Size: {(attachment.size / 1024).toFixed(1)} KB</p>
                                          </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </TabsContent>
                        </Tabs>
                        
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            Previous audit: {audit.previousAuditDate ? new Date(audit.previousAuditDate).toLocaleDateString() : 'None'}
                          </div>
                          <div className="text-sm text-gray-600">
                            Next scheduled: {audit.nextScheduledAudit ? new Date(audit.nextScheduledAudit).toLocaleDateString() : 'Not scheduled'}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {audit.preparationItems.filter(item => item.status !== 'completed').length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-700">
                        {audit.preparationItems.filter(item => item.status !== 'completed').length} Pending Preparation Items
                      </span>
                    </div>
                    <div className="space-y-1">
                      {audit.preparationItems.filter(item => item.status !== 'completed').slice(0, 2).map((item) => (
                        <div key={item.id} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                          {item.description} ({item.assignedTo})
                        </div>
                      ))}
                      {audit.preparationItems.filter(item => item.status !== 'completed').length > 2 && (
                        <div className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                          +{audit.preparationItems.filter(item => item.status !== 'completed').length - 2} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}