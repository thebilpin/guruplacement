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
  Database, 
  Download,
  RefreshCw,
  Calendar,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Filter,
  Search,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  BookOpen
} from 'lucide-react';

interface NCVERSubmission {
  id: string;
  submissionType: 'NAT00010' | 'NAT00020' | 'NAT00030' | 'NAT00040' | 'NAT00060' | 'NAT00080' | 'NAT00090' | 'NAT00120';
  period: string;
  status: 'Draft' | 'Validated' | 'Submitted' | 'Accepted' | 'Rejected';
  createdAt: string;
  submittedAt?: string;
  validatedAt?: string;
  dueDate: string;
  totalRecords: number;
  validRecords: number;
  errorRecords: number;
  warningRecords: number;
  fileSize: string;
  fileName: string;
  submissionNotes?: string;
  rejectionReason?: string;
  ncverResponse?: string;
}

interface ValidationError {
  id: string;
  submissionId: string;
  recordNumber: number;
  fieldName: string;
  errorType: 'Error' | 'Warning';
  errorCode: string;
  errorMessage: string;
  suggestedFix?: string;
}

export default function NCVERExportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<NCVERSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<NCVERSubmission[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showErrorsModal, setShowErrorsModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<NCVERSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
    fetchValidationErrors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [submissions, searchTerm, statusFilter, typeFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockSubmissions: NCVERSubmission[] = [
        {
          id: '1',
          submissionType: 'NAT00120',
          period: '2024 Q1',
          status: 'Accepted',
          createdAt: '2024-01-20T09:00:00Z',
          submittedAt: '2024-01-25T14:30:00Z',
          validatedAt: '2024-01-20T10:15:00Z',
          dueDate: '2024-01-31T23:59:59Z',
          totalRecords: 245,
          validRecords: 245,
          errorRecords: 0,
          warningRecords: 3,
          fileSize: '2.8 MB',
          fileName: 'RTO123_NAT00120_2024Q1.xml',
          submissionNotes: 'Regular quarterly submission - all records validated successfully.',
          ncverResponse: 'Submission accepted. Processing complete.'
        },
        {
          id: '2',
          submissionType: 'NAT00010',
          period: '2024 Jan',
          status: 'Submitted',
          createdAt: '2024-01-28T11:20:00Z',
          submittedAt: '2024-01-28T15:45:00Z',
          validatedAt: '2024-01-28T11:45:00Z',
          dueDate: '2024-02-05T23:59:59Z',
          totalRecords: 89,
          validRecords: 87,
          errorRecords: 2,
          warningRecords: 5,
          fileSize: '1.2 MB',
          fileName: 'RTO123_NAT00010_202401.xml',
          submissionNotes: 'Monthly enrolment data submission.'
        },
        {
          id: '3',
          submissionType: 'NAT00020',
          period: '2024 Jan',
          status: 'Validated',
          createdAt: '2024-01-29T08:30:00Z',
          validatedAt: '2024-01-29T09:15:00Z',
          dueDate: '2024-02-05T23:59:59Z',
          totalRecords: 67,
          validRecords: 65,
          errorRecords: 2,
          warningRecords: 8,
          fileSize: '0.9 MB',
          fileName: 'RTO123_NAT00020_202401.xml',
          submissionNotes: 'Subject completion data - ready for submission.'
        },
        {
          id: '4',
          submissionType: 'NAT00030',
          period: '2024 Jan',
          status: 'Rejected',
          createdAt: '2024-01-26T14:10:00Z',
          submittedAt: '2024-01-27T16:20:00Z',
          validatedAt: '2024-01-26T14:30:00Z',
          dueDate: '2024-02-05T23:59:59Z',
          totalRecords: 156,
          validRecords: 142,
          errorRecords: 14,
          warningRecords: 12,
          fileSize: '1.8 MB',
          fileName: 'RTO123_NAT00030_202401.xml',
          submissionNotes: 'Qualification completion data.',
          rejectionReason: 'Multiple validation errors in Unit of Competency codes. Please review and resubmit.',
          ncverResponse: 'Submission rejected due to data quality issues. See error report for details.'
        },
        {
          id: '5',
          submissionType: 'NAT00060',
          period: '2024 Jan',
          status: 'Draft',
          createdAt: '2024-01-30T10:00:00Z',
          dueDate: '2024-02-05T23:59:59Z',
          totalRecords: 23,
          validRecords: 0,
          errorRecords: 0,
          warningRecords: 0,
          fileSize: '0.3 MB',
          fileName: 'RTO123_NAT00060_202401_draft.xml',
          submissionNotes: 'Disability data submission - still in preparation.'
        }
      ];

      setSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load NCVER submissions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchValidationErrors = async () => {
    try {
      // Mock validation errors
      const mockErrors: ValidationError[] = [
        {
          id: '1',
          submissionId: '4',
          recordNumber: 45,
          fieldName: 'Unit of Competency Code',
          errorType: 'Error',
          errorCode: 'E001',
          errorMessage: 'Invalid Unit of Competency code: BSBCMM999',
          suggestedFix: 'Use valid Training.gov.au unit code'
        },
        {
          id: '2',
          submissionId: '4',
          recordNumber: 67,
          fieldName: 'Completion Date',
          errorType: 'Error',
          errorCode: 'E002',
          errorMessage: 'Completion date cannot be in the future',
          suggestedFix: 'Ensure completion date is not after today'
        },
        {
          id: '3',
          submissionId: '2',
          recordNumber: 23,
          fieldName: 'Student USI',
          errorType: 'Warning',
          errorCode: 'W001',
          errorMessage: 'USI format appears unusual but is valid',
          suggestedFix: 'Verify USI with student if necessary'
        }
      ];

      setValidationErrors(mockErrors);
    } catch (error) {
      console.error('Error fetching validation errors:', error);
    }
  };

  const applyFilters = () => {
    let filtered = submissions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.submissionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(submission => submission.submissionType === typeFilter);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredSubmissions(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Validated':
        return 'bg-blue-100 text-blue-800';
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Settings className="h-4 w-4" />;
      case 'Validated':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Submitted':
        return <Clock className="h-4 w-4" />;
      case 'Accepted':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Rejected':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getSubmissionTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      'NAT00010': 'Enrolment Data',
      'NAT00020': 'Subject Completion',
      'NAT00030': 'Qualification Completion',
      'NAT00040': 'Course Completion',
      'NAT00060': 'Disability Data',
      'NAT00080': 'Prior Educational Achievement',
      'NAT00090': 'Course Details',
      'NAT00120': 'Total VET Activity'
    };
    return descriptions[type] || type;
  };

  const handleValidateSubmission = (submissionId: string) => {
    setSubmissions(prev => prev.map(sub =>
      sub.id === submissionId
        ? { ...sub, status: 'Validated', validatedAt: new Date().toISOString() }
        : sub
    ));
    toast({
      title: 'Validation Complete',
      description: 'Submission has been validated successfully.',
    });
  };

  const handleSubmitToNCVER = (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;

    if (submission.errorRecords > 0) {
      toast({
        title: 'Cannot Submit',
        description: 'Please fix all errors before submitting to NCVER.',
        variant: 'destructive',
      });
      return;
    }

    setSubmissions(prev => prev.map(sub =>
      sub.id === submissionId
        ? { ...sub, status: 'Submitted', submittedAt: new Date().toISOString() }
        : sub
    ));
    toast({
      title: 'Submitted to NCVER',
      description: 'Submission has been sent to NCVER for processing.',
    });
  };

  const handleDownloadSubmission = (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;

    toast({
      title: 'Download Started',
      description: `Downloading ${submission.fileName}...`,
    });
  };

  const handleViewErrors = (submission: NCVERSubmission) => {
    setSelectedSubmission(submission);
    setShowErrorsModal(true);
  };

  const getDaysUntilDue = (dueDateStr: string) => {
    const dueDate = new Date(dueDateStr);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const stats = {
    total: submissions.length,
    draft: submissions.filter(s => s.status === 'Draft').length,
    pending: submissions.filter(s => s.status === 'Submitted').length,
    accepted: submissions.filter(s => s.status === 'Accepted').length,
    rejected: submissions.filter(s => s.status === 'Rejected').length
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NCVER Data Submissions</h1>
          <p className="text-gray-600">Manage and submit AVETMISS data to NCVER</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchSubmissions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            New Submission
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
              <Settings className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Validated">Validated</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="NAT00010">NAT00010 - Enrolments</SelectItem>
                  <SelectItem value="NAT00020">NAT00020 - Subject Completions</SelectItem>
                  <SelectItem value="NAT00030">NAT00030 - Qualification Completions</SelectItem>
                  <SelectItem value="NAT00120">NAT00120 - Total VET Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map((submission) => {
          const daysUntilDue = getDaysUntilDue(submission.dueDate);
          const isOverdue = daysUntilDue < 0;
          const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
          const hasErrors = submission.errorRecords > 0;
          const hasWarnings = submission.warningRecords > 0;

          return (
            <Card key={submission.id} className={`${isOverdue ? 'border-red-300 bg-red-50' : isUrgent ? 'border-yellow-300 bg-yellow-50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{submission.submissionType}</h3>
                      <Badge className={getStatusColor(submission.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(submission.status)}
                          <span>{submission.status}</span>
                        </div>
                      </Badge>
                      {hasErrors && (
                        <Badge variant="destructive">
                          {submission.errorRecords} Errors
                        </Badge>
                      )}
                      {hasWarnings && (
                        <Badge variant="outline" className="border-yellow-300 text-yellow-800">
                          {submission.warningRecords} Warnings
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{getSubmissionTypeDescription(submission.submissionType)}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                      <div><Calendar className="inline h-4 w-4 mr-1" />Period: {submission.period}</div>
                      <div><FileSpreadsheet className="inline h-4 w-4 mr-1" />File: {submission.fileName}</div>
                      <div><Database className="inline h-4 w-4 mr-1" />Size: {submission.fileSize}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Due: {new Date(submission.dueDate).toLocaleDateString()}
                      {isOverdue && (
                        <span className="ml-2 text-red-600 font-medium">
                          ({Math.abs(daysUntilDue)} days overdue)
                        </span>
                      )}
                      {isUrgent && (
                        <span className="ml-2 text-yellow-600 font-medium">
                          ({daysUntilDue} days remaining)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Record Statistics */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-600">{submission.totalRecords}</div>
                    <div className="text-xs text-gray-600">Total Records</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-green-600">{submission.validRecords}</div>
                    <div className="text-xs text-gray-600">Valid</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-red-600">{submission.errorRecords}</div>
                    <div className="text-xs text-gray-600">Errors</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-yellow-600">{submission.warningRecords}</div>
                    <div className="text-xs text-gray-600">Warnings</div>
                  </div>
                </div>

                {/* Notes and Response */}
                {submission.submissionNotes && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Notes:</strong> {submission.submissionNotes}
                    </div>
                  </div>
                )}

                {submission.rejectionReason && (
                  <div className="mb-3 p-3 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-800">
                      <strong>Rejection Reason:</strong> {submission.rejectionReason}
                    </div>
                  </div>
                )}

                {submission.ncverResponse && (
                  <div className="mb-3 p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-800">
                      <strong>NCVER Response:</strong> {submission.ncverResponse}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Created: {new Date(submission.createdAt).toLocaleDateString()}
                    {submission.submittedAt && (
                      <span className="ml-4">Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownloadSubmission(submission.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {(hasErrors || hasWarnings) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewErrors(submission)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Issues
                      </Button>
                    )}
                    {submission.status === 'Draft' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleValidateSubmission(submission.id)}
                        disabled={submission.totalRecords === 0}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Validate
                      </Button>
                    )}
                    {submission.status === 'Validated' && !hasErrors && (
                      <Button 
                        size="sm"
                        onClick={() => handleSubmitToNCVER(submission.id)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Submit to NCVER
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSubmissions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No NCVER Submissions Found</h3>
            <p className="text-gray-600">
              {submissions.length === 0 
                ? "No NCVER submissions have been created yet."
                : "No submissions match your current filters."
              }
            </p>
            {submissions.length === 0 && (
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Create Your First Submission
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}