
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  CheckCircle,
  Clock,
  Edit,
  File as FileIcon,
  FileCheck,
  FileClock,
  FileX,
  Globe,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  ShieldCheck,
  Upload,
  User,
  Loader2,
  Eye,
  Download,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  profileImage?: string;
  bio?: string;
  academicInfo?: {
    course: string;
    institution: string;
    year: number;
    gpa?: number;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    publicProfile: boolean;
  };
}

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'verified' | 'pending' | 'expired' | 'rejected';
  uploadDate: string;
  expiryDate?: string;
  fileUrl?: string;
}

interface Activity {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
}

const QrCodeSvg = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path
      fill="currentColor"
      d="M10 10h20v20h-20z m60 0h20v20h-20z m-60 60h20v20h-20z M15 15v10h10V15z m60 0v10h10V15z m-60 60v10h10v-10z M40 10h10v10h-10z m20 0h10v10h-10z m-10 10h10v10h-10z m-10 10h10v10h-10z m10 0h10v10h-10z m-20 20h10v10h-10z m10 0h10v10h-10z m20 0h10v10h-10z m10 0h10v10h-10z M10 40h10v10h-10z m20 0h10v10h-10z m10 10h10v10h-10z m-20 20h10v10h-10z m60 -50h10v10h-10z m-10 10h10v10h-10z m10 10h10v10h-10z m-20 10h10v10h-10z m10 0h10v10h-10z m10 10h10v10h-10z m10 0h10v10h-10z m-50 10h10v10h-10z m10 0h10v10h-10z m-10 10h10v10h-10z"
    />
  </svg>
);

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<StudentProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/student/profile?studentId=${user.uid}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data.profile);
        setDocuments(data.documents || []);
        setActivities(data.activities || []);
        setEditedProfile(data.profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.uid]);

  const handleSaveProfile = async () => {
    if (!editedProfile || !user?.uid) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.uid,
          ...editedProfile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocumentUpload = async (file: File, documentType: string) => {
    if (!user?.uid) return;

    try {
      setUploadingDocument(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('studentId', user.uid);
      formData.append('documentType', documentType);

      const response = await fetch('/api/student/profile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const data = await response.json();
      setDocuments(prev => [...prev, data.document]);
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!user?.uid) return;

    try {
      const response = await fetch(`/api/student/profile?studentId=${user.uid}&documentId=${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const getDocumentIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <FileCheck className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <FileClock className="h-5 w-5 text-yellow-500" />;
      case 'expired':
      case 'rejected':
        return <FileX className="h-5 w-5 text-destructive" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getBadgeClassName = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information, documents, and settings.
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditedProfile(profile);
                }}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage 
                    src={profile.profileImage} 
                    alt={profile.name} 
                  />
                  <AvatarFallback className="text-lg">
                    {profile.name?.split(' ').map(n => n[0]).join('') || 'ST'}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing ? (
                  <div className="w-full space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={editedProfile?.name || ''}
                        onChange={(e) => setEditedProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editedProfile?.bio || ''}
                        onChange={(e) => setEditedProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold">{profile.name}</h3>
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {profile.bio}
                      </p>
                    )}
                  </>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={editedProfile?.phone || ''}
                        onChange={(e) => setEditedProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={editedProfile?.address || ''}
                        onChange={(e) => setEditedProfile(prev => prev ? {...prev, address: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={editedProfile?.dateOfBirth || ''}
                        onChange={(e) => setEditedProfile(prev => prev ? {...prev, dateOfBirth: e.target.value} : null)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span className="text-sm">{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span className="text-sm">{profile.phone}</span>
                      </div>
                    )}
                    {profile.address && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span className="text-sm">{profile.address}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* QR Code Card */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Student ID</CardTitle>
              <CardDescription>
                Scan this QR code for quick access to your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-32 h-32 bg-slate-200 rounded-lg flex items-center justify-center">
                <QrCodeSvg />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-6">
              <Card className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Document Management</CardTitle>
                    <CardDescription>
                      Upload and manage your required documents for placements.
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload New Document</DialogTitle>
                        <DialogDescription>
                          Select a document type and upload your file.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="documentType">Document Type</Label>
                          <select className="w-full p-2 border rounded-md" id="documentType">
                            <option value="police-check">Police Check</option>
                            <option value="wwcc">Working with Children Check</option>
                            <option value="first-aid">First Aid Certificate</option>
                            <option value="vaccination">Vaccination Certificate</option>
                            <option value="resume">Resume</option>
                            <option value="transcript">Academic Transcript</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="documentFile">File</Label>
                          <Input
                            id="documentFile"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.png"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={uploadingDocument}
                          onClick={() => {
                            const fileInput = document.getElementById('documentFile') as HTMLInputElement;
                            const typeSelect = document.getElementById('documentType') as HTMLSelectElement;
                            if (fileInput.files && fileInput.files[0]) {
                              handleDocumentUpload(fileInput.files[0], typeSelect.value);
                            }
                          }}
                        >
                          {uploadingDocument ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Upload
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.map((doc, index) => (
                      <div
                        key={doc.id}
                        className="flex items-center p-3 bg-slate-100 rounded-lg animate-in fade-in-50"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center flex-1">
                          {getDocumentIcon(doc.status)}
                          <div className="ml-3">
                            <span className="font-medium">{doc.name}</span>
                            <p className="text-xs text-muted-foreground">
                              Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                              {doc.expiryDate && (
                                <> • Expires: {new Date(doc.expiryDate).toLocaleDateString()}</>
                              )}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={getBadgeVariant(doc.status)}
                          className={getBadgeClassName(doc.status)}
                        >
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </Badge>
                        <div className="ml-2 flex gap-1">
                          {doc.fileUrl && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this document? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                    {documents.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No documents uploaded yet</p>
                        <p className="text-sm">Upload your required documents to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic" className="space-y-6">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                  <CardDescription>
                    Your course and academic details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="course">Course</Label>
                        <Input
                          id="course"
                          value={editedProfile?.academicInfo?.course || ''}
                          onChange={(e) => setEditedProfile(prev => prev ? {
                            ...prev,
                            academicInfo: { ...prev.academicInfo, course: e.target.value }
                          } : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="institution">Institution</Label>
                        <Input
                          id="institution"
                          value={editedProfile?.academicInfo?.institution || ''}
                          onChange={(e) => setEditedProfile(prev => prev ? {
                            ...prev,
                            academicInfo: { ...prev.academicInfo, institution: e.target.value }
                          } : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="year">Year Level</Label>
                        <Input
                          id="year"
                          type="number"
                          value={editedProfile?.academicInfo?.year || ''}
                          onChange={(e) => setEditedProfile(prev => prev ? {
                            ...prev,
                            academicInfo: { ...prev.academicInfo, year: parseInt(e.target.value) }
                          } : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gpa">GPA (Optional)</Label>
                        <Input
                          id="gpa"
                          type="number"
                          step="0.01"
                          value={editedProfile?.academicInfo?.gpa || ''}
                          onChange={(e) => setEditedProfile(prev => prev ? {
                            ...prev,
                            academicInfo: { ...prev.academicInfo, gpa: parseFloat(e.target.value) }
                          } : null)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Course</Label>
                        <p className="text-sm text-muted-foreground">
                          {profile.academicInfo?.course || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Institution</Label>
                        <p className="text-sm text-muted-foreground">
                          {profile.academicInfo?.institution || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Year Level</Label>
                        <p className="text-sm text-muted-foreground">
                          {profile.academicInfo?.year || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">GPA</Label>
                        <p className="text-sm text-muted-foreground">
                          {profile.academicInfo?.gpa || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                  <CardDescription>
                    Contact information for emergencies.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="emergencyName">Name</Label>
                        <Input
                          id="emergencyName"
                          value={editedProfile?.emergencyContact?.name || ''}
                          onChange={(e) => setEditedProfile(prev => prev ? {
                            ...prev,
                            emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                          } : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyPhone">Phone</Label>
                        <Input
                          id="emergencyPhone"
                          type="tel"
                          value={editedProfile?.emergencyContact?.phone || ''}
                          onChange={(e) => setEditedProfile(prev => prev ? {
                            ...prev,
                            emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                          } : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyRelationship">Relationship</Label>
                        <Input
                          id="emergencyRelationship"
                          value={editedProfile?.emergencyContact?.relationship || ''}
                          onChange={(e) => setEditedProfile(prev => prev ? {
                            ...prev,
                            emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                          } : null)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {profile.emergencyContact?.name || 'Not specified'}</p>
                      <p><strong>Phone:</strong> {profile.emergencyContact?.phone || 'Not specified'}</p>
                      <p><strong>Relationship:</strong> {profile.emergencyContact?.relationship || 'Not specified'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={editedProfile?.preferences?.emailNotifications ?? true}
                      onCheckedChange={(checked) => setEditedProfile(prev => prev ? {
                        ...prev,
                        preferences: { ...prev.preferences, emailNotifications: checked }
                      } : null)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive urgent updates via SMS
                      </p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={editedProfile?.preferences?.smsNotifications ?? false}
                      onCheckedChange={(checked) => setEditedProfile(prev => prev ? {
                        ...prev,
                        preferences: { ...prev.preferences, smsNotifications: checked }
                      } : null)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="publicProfile">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to providers
                      </p>
                    </div>
                    <Switch
                      id="publicProfile"
                      checked={editedProfile?.preferences?.publicProfile ?? false}
                      onCheckedChange={(checked) => setEditedProfile(prev => prev ? {
                        ...prev,
                        preferences: { ...prev.preferences, publicProfile: checked }
                      } : null)}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Activity History */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                A log of recent changes to your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.action}</p>
                      {activity.details && (
                        <p className="text-xs text-muted-foreground">{activity.details}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}const QrCodeSvg = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path
      fill="currentColor"
      d="M10 10h20v20h-20z m60 0h20v20h-20z m-60 60h20v20h-20z M15 15v10h10V15z m60 0v10h10V15z m-60 60v10h10v-10z M40 10h10v10h-10z m20 0h10v10h-10z m-10 10h10v10h-10z m-10 10h10v10h-10z m10 0h10v10h-10z m-20 20h10v10h-10z m10 0h10v10h-10z m20 0h10v10h-10z m10 0h10v10h-10z M10 40h10v10h-10z m20 0h10v10h-10z m10 10h10v10h-10z m-20 20h10v10h-10z m60 -50h10v10h-10z m-10 10h10v10h-10z m10 10h10v10h-10z m-20 10h10v10h-10z m10 0h10v10h-10z m10 10h10v10h-10z m10 0h10v10h-10z m-50 10h10v10h-10z m10 0h10v10h-10z m-10 10h10v10h-10z"
    />
  </svg>
);

export default function StudentProfilePage() {
  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-slate-800">
          My Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information, documents, and settings.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow-lg">
                <AvatarImage src="https://picsum.photos/seed/student/200/200" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">Sarah Johnson</h2>
              <p className="text-muted-foreground">Student ID: STU-12345</p>
              <p className="text-sm font-medium text-primary mt-1">
                Diploma of Nursing
              </p>
              <div className="text-left space-y-4 mt-6 text-sm">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>sarah.j@student.edu</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>+61 412 345 678</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>Sydney, NSW, Australia</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Digital Student ID</CardTitle>
              <CardDescription>
                Scan this QR code for verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="w-48 h-48 p-4 border rounded-lg bg-white">
                <QrCodeSvg />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>
                Upload and manage your required documents for placements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {documents.map((doc, index) => (
                  <li
                    key={doc.name}
                    className="flex items-center p-3 bg-slate-100 rounded-lg animate-in fade-in-50"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className="flex items-center flex-1">
                      {doc.icon}
                      <span className="ml-3 font-medium">{doc.name}</span>
                    </div>
                    <Badge
                      variant={
                        doc.status === 'Verified'
                          ? 'default'
                          : doc.status === 'Pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className={
                        doc.status === 'Verified' ? 'bg-green-100 text-green-800' : 
                        doc.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''
                      }
                    >
                      {doc.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6">
                <Upload className="mr-2 h-4 w-4" /> Upload New Document
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                A log of recent changes to your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {activityHistory.map((activity, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-4">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.date}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
