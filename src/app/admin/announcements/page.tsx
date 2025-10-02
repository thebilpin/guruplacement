
'use client'

import { useState, useEffect } from 'react';
import { ADMIN_CONTENT } from '@/lib/content';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Megaphone, 
  Send, 
  Eye,
  Edit,
  Trash2,
  Users,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Info,
  Star,
  Archive,
  Plus
} from "lucide-react";
import { 
  Announcement, 
  AnnouncementType, 
  UserRole, 
  CreateAnnouncementData,
  getAnnouncementTypeStyle,
  getRoleDisplayName
} from '@/lib/schemas/announcements';

interface AnnouncementFormData {
  title: string;
  content: string;
  type: AnnouncementType;
  targetRoles: UserRole[];
  targetAllUsers: boolean;
  sendImmediately: boolean;
  scheduledDate: string;
  scheduledTime: string;
  imageUrl: string;
  actionButtonText: string;
  actionButtonUrl: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('new');

  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    type: 'info',
    targetRoles: [],
    targetAllUsers: false,
    sendImmediately: true,
    scheduledDate: '',
    scheduledTime: '',
    imageUrl: '',
    actionButtonText: '',
    actionButtonUrl: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    if (!formData.targetAllUsers && formData.targetRoles.length === 0) {
      alert(ADMIN_CONTENT.announcements.validation.selectRoles);
      return;
    }

    setCreating(true);

    try {
      const announcementData: CreateAnnouncementData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        targetRoles: formData.targetRoles,
        targetAllUsers: formData.targetAllUsers,
        sendImmediately: formData.sendImmediately,
        scheduledAt: !formData.sendImmediately && formData.scheduledDate && formData.scheduledTime
          ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
          : undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        actionButton: formData.actionButtonText.trim() && formData.actionButtonUrl.trim()
          ? {
              text: formData.actionButtonText.trim(),
              url: formData.actionButtonUrl.trim()
            }
          : undefined
      };

      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...announcementData,
          adminId: 'admin-system' // TODO: Get from auth
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        
        // Reset form
        setFormData({
          title: '',
          content: '',
          type: 'info',
          targetRoles: [],
          targetAllUsers: false,
          sendImmediately: true,
          scheduledDate: '',
          scheduledTime: '',
          imageUrl: '',
          actionButtonText: '',
          actionButtonUrl: ''
        });

        // Refresh announcements list
        fetchAnnouncements();
        setActiveTab('sent');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement');
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (announcement: Announcement) => {
    const badges = {
      draft: <Badge variant="outline" className="bg-gray-50">{ADMIN_CONTENT.announcements.statuses.draft}</Badge>,
      scheduled: <Badge variant="outline" className="bg-blue-50 text-blue-700">{ADMIN_CONTENT.announcements.statuses.scheduled}</Badge>,
      published: <Badge variant="outline" className="bg-green-50 text-green-700">{ADMIN_CONTENT.announcements.statuses.published}</Badge>,
      archived: <Badge variant="outline" className="bg-gray-50 text-gray-500">{ADMIN_CONTENT.announcements.statuses.archived}</Badge>,
      cancelled: <Badge variant="outline" className="bg-red-50 text-red-700">{ADMIN_CONTENT.announcements.statuses.cancelled}</Badge>
    };
    return badges[announcement.status];
  };

  const getTypeIcon = (type: AnnouncementType) => {
    const icons = {
      info: <Info className="h-4 w-4" />,
      success: <CheckCircle2 className="h-4 w-4" />,
      warning: <AlertCircle className="h-4 w-4" />,
      critical: <AlertCircle className="h-4 w-4" />
    };
    return icons[type];
  };

  const formatDate = (date: any) => {
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">
            Announcements & Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage platform-wide announcements with real Firebase notifications.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Sent Announcements
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scheduled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Megaphone className="h-5 w-5 text-primary" />
                    <CardTitle>New Announcement</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g., Upcoming System Maintenance"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea 
                      id="content" 
                      placeholder="Write your announcement here..."
                      rows={8}
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Notification Type</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: AnnouncementType) => 
                          setFormData(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-blue-600" />
                              Information
                            </div>
                          </SelectItem>
                          <SelectItem value="success">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              Success
                            </div>
                          </SelectItem>
                          <SelectItem value="warning">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              Warning
                            </div>
                          </SelectItem>
                          <SelectItem value="critical">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              Critical
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Optional Features</Label>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL (optional)</Label>
                        <Input 
                          id="imageUrl" 
                          placeholder="https://example.com/image.jpg"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="actionButtonText">Action Button Text</Label>
                          <Input 
                            id="actionButtonText" 
                            placeholder="e.g., Learn More"
                            value={formData.actionButtonText}
                            onChange={(e) => setFormData(prev => ({ ...prev, actionButtonText: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="actionButtonUrl">Action Button URL</Label>
                          <Input 
                            id="actionButtonUrl" 
                            placeholder="https://example.com"
                            value={formData.actionButtonUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, actionButtonUrl: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Targeting
                  </CardTitle>
                  <CardDescription>Select which user roles will receive this notification.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label>All Users</Label>
                    <Switch 
                      checked={formData.targetAllUsers}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, targetAllUsers: checked, targetRoles: checked ? [] : prev.targetRoles }))
                      }
                    />
                  </div>
                  
                  {!formData.targetAllUsers && (
                    <>
                      {(['student', 'rto_admin', 'provider_admin', 'supervisor', 'assessor'] as UserRole[]).map(role => (
                        <div key={role} className="flex items-center justify-between rounded-lg border p-3">
                          <Label>{getRoleDisplayName(role)}</Label>
                          <Switch 
                            checked={formData.targetRoles.includes(role)}
                            onCheckedChange={() => handleRoleToggle(role)}
                          />
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Scheduling
                  </CardTitle>
                  <CardDescription>Send immediately or schedule for a later time.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label>Send Immediately</Label>
                    <Switch 
                      checked={formData.sendImmediately}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, sendImmediately: checked }))
                      }
                    />
                  </div>
                  
                  {!formData.sendImmediately && (
                    <div className="space-y-3">
                      <Label>Schedule for...</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          type="date" 
                          value={formData.scheduledDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        />
                        <Input 
                          type="time" 
                          value={formData.scheduledTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button 
                size="lg" 
                className="w-full" 
                onClick={handleSubmit}
                disabled={creating}
              >
                {creating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {formData.sendImmediately ? 'Send Now' : 'Schedule Announcement'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Sent Announcements
              </CardTitle>
              <CardDescription>
                View and manage all published announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading announcements...</div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No announcements found. Create your first announcement!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements
                      .filter(a => a.status === 'published')
                      .map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{announcement.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {announcement.content}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 ${getAnnouncementTypeStyle(announcement.type).text}`}>
                            {getTypeIcon(announcement.type)}
                            <span className="capitalize">{announcement.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(announcement)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{announcement.totalRecipients} sent</div>
                            <div className="text-gray-500">
                              {announcement.deliveredCount} delivered • {announcement.readCount} read
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {announcement.publishedAt ? formatDate(announcement.publishedAt) : 'Not sent'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAnnouncement(announcement);
                                setShowDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Announcements
              </CardTitle>
              <CardDescription>
                Announcements scheduled for future delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              {announcements.filter(a => a.status === 'scheduled').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No scheduled announcements found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Scheduled For</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements
                      .filter(a => a.status === 'scheduled')
                      .map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{announcement.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {announcement.content}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 ${getAnnouncementTypeStyle(announcement.type).text}`}>
                            {getTypeIcon(announcement.type)}
                            <span className="capitalize">{announcement.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {announcement.targetAllUsers ? 'All Users' : 
                            announcement.targetRoles.map(role => getRoleDisplayName(role)).join(', ')
                          }
                        </TableCell>
                        <TableCell>
                          {announcement.scheduledAt ? formatDate(announcement.scheduledAt) : 'Not scheduled'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAnnouncement(announcement);
                                setShowDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Announcement Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Announcement Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedAnnouncement && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedAnnouncement)}
                <div className={`flex items-center gap-1 ${getAnnouncementTypeStyle(selectedAnnouncement.type).text}`}>
                  {getTypeIcon(selectedAnnouncement.type)}
                  <span className="capitalize text-sm">{selectedAnnouncement.type}</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{selectedAnnouncement.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedAnnouncement.content}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Recipients:</span>
                  <div className="text-gray-600">
                    {selectedAnnouncement.targetAllUsers ? 'All Users' :
                      selectedAnnouncement.targetRoles.map(role => getRoleDisplayName(role)).join(', ')
                    }
                  </div>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <div className="text-gray-600">{formatDate(selectedAnnouncement.createdAt)}</div>
                </div>
                {selectedAnnouncement.publishedAt && (
                  <div>
                    <span className="font-medium">Published:</span>
                    <div className="text-gray-600">{formatDate(selectedAnnouncement.publishedAt)}</div>
                  </div>
                )}
                <div>
                  <span className="font-medium">Statistics:</span>
                  <div className="text-gray-600">
                    {selectedAnnouncement.totalRecipients} sent, {selectedAnnouncement.deliveredCount} delivered, {selectedAnnouncement.readCount} read
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
