'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  FileText, 
  Image, 
  File, 
  Award,
  BookOpen,
  Clock,
  CheckCircle,
  Settings,
  Eye,
  Share2,
  Printer,
  Upload,
  Folder,
  Calendar,
  User,
  Star,
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  type: 'Certificate' | 'Assessment' | 'Reflection' | 'Project' | 'Logbook' | 'Feedback' | 'Document';
  category: string;
  dateAdded: string;
  fileSize?: string;
  status: 'Complete' | 'Draft' | 'Pending Review';
  description: string;
  tags: string[];
  isSelected: boolean;
}

interface ExportSettings {
  format: 'PDF' | 'Word' | 'HTML' | 'Portfolio Website';
  includePersonalInfo: boolean;
  includeCoverLetter: boolean;
  includeReflections: boolean;
  template: 'Professional' | 'Academic' | 'Creative' | 'Minimal';
  quality: number;
  watermark: boolean;
}

interface PortfolioStats {
  totalItems: number;
  certificates: number;
  reflections: number;
  assessments: number;
  completionRate: number;
}

export default function PortfolioExportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalItems: 0,
    certificates: 0,
    reflections: 0,
    assessments: 0,
    completionRate: 0
  });
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'PDF',
    includePersonalInfo: true,
    includeCoverLetter: false,
    includeReflections: true,
    template: 'Professional',
    quality: 80,
    watermark: false
  });
  const [coverLetter, setCoverLetter] = useState('');
  const [personalStatement, setPersonalStatement] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [portfolioItems]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData: PortfolioItem[] = [
        {
          id: '1',
          title: 'First Aid Certificate',
          type: 'Certificate',
          category: 'Health & Safety',
          dateAdded: '2024-01-15',
          fileSize: '2.3 MB',
          status: 'Complete',
          description: 'Valid First Aid and CPR certification from Australian Red Cross',
          tags: ['Health', 'Safety', 'Required'],
          isSelected: true
        },
        {
          id: '2',
          title: 'Clinical Skills Assessment Report',
          type: 'Assessment',
          category: 'Clinical Practice',
          dateAdded: '2024-01-20',
          fileSize: '1.8 MB',
          status: 'Complete',
          description: 'Comprehensive assessment of clinical skills demonstration',
          tags: ['Clinical', 'Assessment', 'Skills'],
          isSelected: true
        },
        {
          id: '3',
          title: 'Placement Reflection Journal',
          type: 'Reflection',
          category: 'Professional Development',
          dateAdded: '2024-01-18',
          fileSize: '3.2 MB',
          status: 'Complete',
          description: 'Weekly reflections on placement experiences and learning outcomes',
          tags: ['Reflection', 'Learning', 'Development'],
          isSelected: true
        },
        {
          id: '4',
          title: 'Evidence-Based Practice Project',
          type: 'Project',
          category: 'Research',
          dateAdded: '2024-01-22',
          fileSize: '5.7 MB',
          status: 'Complete',
          description: 'Research project on implementing evidence-based practices in healthcare',
          tags: ['Research', 'EBP', 'Project'],
          isSelected: true
        },
        {
          id: '5',
          title: 'Digital Logbook Entries',
          type: 'Logbook',
          category: 'Activity Records',
          dateAdded: '2024-01-25',
          fileSize: '4.1 MB',
          status: 'Complete',
          description: 'Complete record of placement activities and hours',
          tags: ['Logbook', 'Activities', 'Hours'],
          isSelected: true
        },
        {
          id: '6',
          title: 'Supervisor Feedback Forms',
          type: 'Feedback',
          category: 'Performance Review',
          dateAdded: '2024-01-21',
          fileSize: '1.5 MB',
          status: 'Complete',
          description: 'Feedback and evaluations from placement supervisors',
          tags: ['Feedback', 'Evaluation', 'Performance'],
          isSelected: true
        },
        {
          id: '7',
          title: 'Professional Development Plan',
          type: 'Document',
          category: 'Career Planning',
          dateAdded: '2024-01-19',
          fileSize: '0.8 MB',
          status: 'Draft',
          description: 'Personal development plan for career progression',
          tags: ['Career', 'Planning', 'Goals'],
          isSelected: false
        },
        {
          id: '8',
          title: 'Communication Skills Workshop Certificate',
          type: 'Certificate',
          category: 'Professional Skills',
          dateAdded: '2024-01-16',
          fileSize: '1.2 MB',
          status: 'Complete',
          description: 'Certificate from professional communication skills workshop',
          tags: ['Communication', 'Workshop', 'Skills'],
          isSelected: true
        }
      ];

      setPortfolioItems(mockData);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portfolio data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalItems = portfolioItems.length;
    const certificates = portfolioItems.filter(item => item.type === 'Certificate').length;
    const reflections = portfolioItems.filter(item => item.type === 'Reflection').length;
    const assessments = portfolioItems.filter(item => item.type === 'Assessment').length;
    const completeItems = portfolioItems.filter(item => item.status === 'Complete').length;
    const completionRate = totalItems > 0 ? Math.round((completeItems / totalItems) * 100) : 0;

    setStats({
      totalItems,
      certificates,
      reflections,
      assessments,
      completionRate
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Certificate':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'Assessment':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Reflection':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'Project':
        return <Folder className="h-5 w-5 text-purple-500" />;
      case 'Logbook':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'Feedback':
        return <Star className="h-5 w-5 text-pink-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending Review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectItem = (itemId: string, isSelected: boolean) => {
    const updatedItems = portfolioItems.map(item =>
      item.id === itemId ? { ...item, isSelected } : item
    );
    setPortfolioItems(updatedItems);
  };

  const handleSelectAll = (isSelected: boolean) => {
    const updatedItems = portfolioItems.map(item => ({ ...item, isSelected }));
    setPortfolioItems(updatedItems);
  };

  const handleExportPortfolio = async () => {
    const selectedItems = portfolioItems.filter(item => item.isSelected);
    
    if (selectedItems.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one item to include in your portfolio.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsExporting(true);
      
      // Mock export process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: 'Portfolio Export Complete',
        description: `Successfully exported ${selectedItems.length} items as ${exportSettings.format}.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export portfolio. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreviewPortfolio = () => {
    const selectedItems = portfolioItems.filter(item => item.isSelected);
    
    if (selectedItems.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one item to preview.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Portfolio Preview',
      description: 'Preview functionality would open here.',
    });
  };

  const handleSharePortfolio = () => {
    toast({
      title: 'Share Portfolio',
      description: 'Portfolio sharing functionality would be implemented here.',
    });
  };

  const handleUploadDocument = () => {
    toast({
      title: 'Upload Document',
      description: 'Document upload functionality would be implemented here.',
    });
  };

  const selectedItemsCount = portfolioItems.filter(item => item.isSelected).length;
  const totalSelectedSize = portfolioItems
    .filter(item => item.isSelected)
    .reduce((total, item) => {
      const size = parseFloat(item.fileSize?.replace(' MB', '') || '0');
      return total + size;
    }, 0);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Export</h1>
          <p className="text-gray-600">Create and export your professional portfolio</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleUploadDocument}>
            <Upload className="h-4 w-4 mr-2" />
            Add Document
          </Button>
          <Button variant="outline" onClick={handlePreviewPortfolio}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleExportPortfolio} disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Portfolio
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <Folder className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.certificates}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assessments</p>
                <p className="text-2xl font-bold text-green-600">{stats.assessments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold mb-2">Export Summary</h3>
              <p className="text-gray-600">
                {selectedItemsCount} items selected • {totalSelectedSize.toFixed(1)} MB total size • {exportSettings.format} format
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{exportSettings.template} Template</Badge>
              <Badge variant="outline">Quality: {exportSettings.quality}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Portfolio Items</TabsTrigger>
          <TabsTrigger value="settings">Export Settings</TabsTrigger>
          <TabsTrigger value="content">Content Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Portfolio Items</CardTitle>
                  <CardDescription>Select items to include in your portfolio export</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedItemsCount === portfolioItems.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all">Select All</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioItems.map((item) => (
                  <Card key={item.id} className={`transition-all ${item.isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={item.isSelected}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(item.type)}
                            <h4 className="font-semibold">{item.title}</h4>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <Badge variant="outline">{item.type}</Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(item.dateAdded).toLocaleDateString()}
                              </div>
                              {item.fileSize && (
                                <div className="flex items-center">
                                  <File className="h-4 w-4 mr-1" />
                                  {item.fileSize}
                                </div>
                              )}
                              <div className="flex items-center">
                                <Folder className="h-4 w-4 mr-1" />
                                {item.category}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Format</CardTitle>
                <CardDescription>Choose the output format for your portfolio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select value={exportSettings.format} onValueChange={(value: any) => setExportSettings({ ...exportSettings, format: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF Document</SelectItem>
                      <SelectItem value="Word">Word Document</SelectItem>
                      <SelectItem value="HTML">HTML Website</SelectItem>
                      <SelectItem value="Portfolio Website">Interactive Portfolio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select value={exportSettings.template} onValueChange={(value: any) => setExportSettings({ ...exportSettings, template: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Creative">Creative</SelectItem>
                      <SelectItem value="Minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quality">Export Quality: {exportSettings.quality}%</Label>
                  <Slider
                    id="quality"
                    min={50}
                    max={100}
                    step={10}
                    value={[exportSettings.quality]}
                    onValueChange={(value) => setExportSettings({ ...exportSettings, quality: value[0] })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Options</CardTitle>
                <CardDescription>Customize what to include in your portfolio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="personal-info"
                    checked={exportSettings.includePersonalInfo}
                    onCheckedChange={(checked) => setExportSettings({ ...exportSettings, includePersonalInfo: checked as boolean })}
                  />
                  <Label htmlFor="personal-info">Include Personal Information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cover-letter"
                    checked={exportSettings.includeCoverLetter}
                    onCheckedChange={(checked) => setExportSettings({ ...exportSettings, includeCoverLetter: checked as boolean })}
                  />
                  <Label htmlFor="cover-letter">Include Cover Letter</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reflections"
                    checked={exportSettings.includeReflections}
                    onCheckedChange={(checked) => setExportSettings({ ...exportSettings, includeReflections: checked as boolean })}
                  />
                  <Label htmlFor="reflections">Include Reflections</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="watermark"
                    checked={exportSettings.watermark}
                    onCheckedChange={(checked) => setExportSettings({ ...exportSettings, watermark: checked as boolean })}
                  />
                  <Label htmlFor="watermark">Add Watermark</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Statement</CardTitle>
                <CardDescription>Write a brief introduction about yourself and your goals</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Write your personal statement here..."
                  value={personalStatement}
                  onChange={(e) => setPersonalStatement(e.target.value)}
                  rows={6}
                />
              </CardContent>
            </Card>

            {exportSettings.includeCoverLetter && (
              <Card>
                <CardHeader>
                  <CardTitle>Cover Letter</CardTitle>
                  <CardDescription>Customize your cover letter for specific opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Write your cover letter here..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={8}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Completion</CardTitle>
                <CardDescription>Track your portfolio completion progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall Completion</span>
                    <span className="text-sm font-medium">{stats.completionRate}%</span>
                  </div>
                  <Progress value={stats.completionRate} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Complete Items: {portfolioItems.filter(i => i.status === 'Complete').length}</div>
                    <div>Draft Items: {portfolioItems.filter(i => i.status === 'Draft').length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}