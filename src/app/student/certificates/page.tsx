
'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
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
import {
  Award,
  Calendar,
  ChevronDown,
  Download,
  Linkedin,
  Medal,
  ShieldCheck,
  Star,
  Trophy,
  MoreVertical,
  CalendarClock,
  ExternalLink,
  Upload,
  FileText,
  AlertTriangle,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'valid' | 'expiring' | 'expired';
  category: string;
  certificateNumber?: string;
  description?: string;
  verificationUrl?: string;
  documentUrl?: string;
  isVerified: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earnedAt: string;
  points: number;
}

interface CertificatesData {
  certificates: Certificate[];
  achievements: Achievement[];
  stats: {
    total: number;
    valid: number;
    expiring: number;
    expired: number;
    achievementsEarned: number;
    totalPoints: number;
  };
  upcomingRenewals: Certificate[];
  student: {
    id: string;
    name: string;
    course: string;
  };
}

export default function CertificatesAchievementsPage() {
  const { user } = useAuthContext();
  const [certificatesData, setCertificatesData] = useState<CertificatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  // Fetch certificates data
  const fetchCertificatesData = async () => {
    if (!user?.uid) return;

    try {
      console.log('📜 Fetching certificates data...');
      const response = await fetch(`/api/student/certificates?studentId=${user.uid}&status=${filter === 'all' ? '' : filter}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch certificates data');
      }

      const result = await response.json();
      if (result.success) {
        setCertificatesData(result);
        console.log('✅ Certificates data loaded successfully');
      } else {
        throw new Error(result.error || 'Failed to load certificates');
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast({
        title: "Error",
        description: "Failed to load certificates data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle certificate sharing
  const handleShareCertificate = async (certificateId: string) => {
    try {
      const response = await fetch('/api/student/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.uid,
          action: 'share-certificate',
          certificateId
        })
      });

      const result = await response.json();
      if (result.success) {
        // Open LinkedIn sharing
        if (result.data.socialLinks.linkedin) {
          window.open(result.data.socialLinks.linkedin, '_blank');
        }
        toast({
          title: "Certificate Shared",
          description: "Certificate shared successfully!",
        });
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      toast({
        title: "Error",
        description: "Failed to share certificate.",
        variant: "destructive",
      });
    }
  };

  // Handle certificate download
  const handleDownloadCertificate = async (certificate: Certificate) => {
    try {
      if (certificate.documentUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = certificate.documentUrl;
        link.download = `${certificate.name.replace(/\s+/g, '_')}.pdf`;
        link.click();

        toast({
          title: "Download Started",
          description: `Downloading ${certificate.name}...`,
        });
      } else {
        toast({
          title: "No Document",
          description: "This certificate doesn't have a downloadable document.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: "Error",
        description: "Failed to download certificate.",
        variant: "destructive",
      });
    }
  };

  // Handle portfolio export
  const handleExportPortfolio = async () => {
    try {
      const response = await fetch(`/api/student/certificates?studentId=${user?.uid}&action=export`);
      const result = await response.json();
      
      if (result.success) {
        // Create and download portfolio
        const portfolioContent = JSON.stringify(result.data, null, 2);
        const blob = new Blob([portfolioContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `portfolio_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        toast({
          title: "Portfolio Exported",
          description: "Your portfolio has been exported successfully!",
        });
      }
    } catch (error) {
      console.error('Error exporting portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to export portfolio.",
        variant: "destructive",
      });
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCertificatesData();
  };

  // Get certificate icon based on category and status
  const getCertificateIcon = (certificate: Certificate) => {
    if (certificate.status === 'expiring') {
      return <CalendarClock className="h-8 w-8 text-yellow-500" />;
    }
    if (certificate.status === 'expired') {
      return <AlertTriangle className="h-8 w-8 text-red-500" />;
    }

    switch (certificate.category) {
      case 'safety':
        return <ShieldCheck className="h-8 w-8 text-primary" />;
      case 'compliance':
        return <FileText className="h-8 w-8 text-primary" />;
      default:
        return <ShieldCheck className="h-8 w-8 text-primary" />;
    }
  };

  // Get achievement icon
  const getAchievementIcon = (achievement: Achievement) => {
    switch (achievement.icon) {
      case '🎯':
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case '✅':
        return <Star className="h-8 w-8 text-yellow-500" />;
      case '🛡️':
        return <Medal className="h-8 w-8 text-yellow-500" />;
      default:
        return <Award className="h-8 w-8 text-yellow-500" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchCertificatesData();
  }, [user?.uid, filter]);

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
              Certificates & Achievements
            </h1>
            <p className="text-muted-foreground mt-1">
              {certificatesData?.student ? 
                `${certificatesData.student.name} - ${certificatesData.student.course}` : 
                'Showcase your credentials, track achievements, and see where you stand.'
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
            <Button onClick={handleExportPortfolio} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Portfolio
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>My Certificates</CardTitle>
              <CardDescription>
                Keep your professional documents up-to-date.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificatesData?.certificates?.length ? (
                certificatesData.certificates.map((cert) => (
                  <Card key={cert.id} className="flex flex-col">
                    <CardHeader className="flex-row items-start gap-4 space-y-0">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getCertificateIcon(cert)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{cert.name}</CardTitle>
                        <CardDescription>{cert.issuer}</CardDescription>
                        {cert.certificateNumber && (
                          <p className="text-xs text-muted-foreground mt-1">
                            #{cert.certificateNumber}
                          </p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                       <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Issued: {formatDate(cert.issuedDate)}</span>
                      </div>
                      {cert.expiryDate && (
                         <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarClock className="mr-2 h-4 w-4" />
                            <span>Expires: {formatDate(cert.expiryDate)}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {cert.status === 'expiring' && (
                          <Badge variant="destructive" className="bg-yellow-500 text-white">
                            Expiring Soon
                          </Badge>
                        )}
                        {cert.status === 'expired' && (
                          <Badge variant="destructive">
                            Expired
                          </Badge>
                        )}
                        {cert.isVerified && (
                          <Badge variant="default" className="bg-green-500">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardContent className="flex gap-2">
                       <Button 
                         variant="outline" 
                         className="w-full"
                         onClick={() => handleDownloadCertificate(cert)}
                       >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                      </Button>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleShareCertificate(cert.id)}
                      >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No certificates found</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
                <CardTitle>Badges & Achievements</CardTitle>
                <CardDescription>Milestones you've unlocked on your learning journey.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {certificatesData?.achievements?.length ? (
                  certificatesData.achievements.map((achievement) => (
                      <div key={achievement.id} className="flex flex-col items-center text-center gap-2 p-4 bg-slate-100 rounded-lg">
                          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                              {getAchievementIcon(achievement)}
                          </div>
                          <p className="font-semibold text-sm">{achievement.name}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          <div className="text-xs text-primary font-medium">
                            +{achievement.points} XP
                          </div>
                      </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-8">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No achievements yet</p>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-8">
            <Card className="card-hover">
                <CardHeader>
                    <CardTitle>Statistics</CardTitle>
                    <CardDescription>Your certification overview.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {certificatesData?.stats ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {certificatesData.stats.valid}
                            </div>
                            <div className="text-sm text-green-600">Valid</div>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">
                              {certificatesData.stats.expiring}
                            </div>
                            <div className="text-sm text-yellow-600">Expiring</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              {certificatesData.stats.expired}
                            </div>
                            <div className="text-sm text-red-600">Expired</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {certificatesData.stats.total}
                            </div>
                            <div className="text-sm text-blue-600">Total</div>
                          </div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {certificatesData.stats.totalPoints?.toLocaleString() || '0'}
                          </div>
                          <div className="text-sm text-purple-600">Total XP</div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Loading statistics...</p>
                      </div>
                    )}
                </CardContent>
            </Card>
            
            {/* Upcoming Renewals */}
            {certificatesData?.upcomingRenewals?.length ? (
              <Card className="card-hover border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Renewal Reminders
                  </CardTitle>
                  <CardDescription>Certificates expiring soon.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {certificatesData.upcomingRenewals.slice(0, 3).map((cert) => (
                    <div key={cert.id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                      <CalendarClock className="h-4 w-4 text-yellow-600" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Expires {formatDate(cert.expiryDate || '')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {certificatesData.upcomingRenewals.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{certificatesData.upcomingRenewals.length - 3} more expiring
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : null}

            <Card className="card-hover">
                <CardHeader>
                    <CardTitle>Portfolio</CardTitle>
                    <CardDescription>Export your achievements as a professional document.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" onClick={handleExportPortfolio}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Portfolio
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
