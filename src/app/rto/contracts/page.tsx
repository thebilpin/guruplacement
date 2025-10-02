'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Building,
  CalendarDays,
  Users,
  Eye,
  Download,
  PenTool,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface Contract {
  id: string;
  rtoId: string;
  rtoName: string;
  providerId: string;
  providerName: string;
  contractType: 'placement_agreement' | 'assessment_agreement' | 'full_partnership';
  status: 'draft' | 'pending_signatures' | 'active' | 'expired' | 'terminated';
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  maxStudents?: number;
  signedByProvider?: boolean;
  signedByRto?: boolean;
  providerSignedAt?: Date;
  rtoSignedAt?: Date;
}

interface CreateContractFormData {
  providerId: string;
  contractType: 'placement_agreement' | 'assessment_agreement' | 'full_partnership';
  startDate: string;
  endDate: string;
  maxStudents: string;
}

export default function RTOContractsPage() {
  const { userData } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<CreateContractFormData>({
    providerId: '',
    contractType: 'placement_agreement',
    startDate: '',
    endDate: '',
    maxStudents: '',
  });

  const resetForm = () => {
    setFormData({
      providerId: '',
      contractType: 'placement_agreement',
      startDate: '',
      endDate: '',
      maxStudents: '',
    });
  };

  const fetchContracts = async () => {
    if (!userData) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/contracts?rtoId=${userData.id}&organizationType=rto`);
      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async () => {
    if (!userData || !formData.providerId || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rtoId: userData.id,
          providerId: formData.providerId,
          contractType: formData.contractType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : undefined,
        }),
      });

      if (response.ok) {
        alert('✅ Contract created successfully!');
        resetForm();
        setCreateDialogOpen(false);
        await fetchContracts();
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to create contract: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('❌ Failed to create contract. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Fetch contracts on component mount
  React.useEffect(() => {
    fetchContracts();
  }, [userData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      case 'pending_signatures':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Signatures
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case 'terminated':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Terminated
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getContractTypeDisplay = (type: string) => {
    switch (type) {
      case 'placement_agreement':
        return 'Placement Agreement';
      case 'assessment_agreement':
        return 'Assessment Agreement';
      case 'full_partnership':
        return 'Full Partnership';
      default:
        return type;
    }
  };

  const handleSignContract = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sign_rto',
          signedBy: userData?.id,
        }),
      });

      if (response.ok) {
        alert('✅ Contract signed successfully!');
        await fetchContracts();
        setDetailsDialogOpen(false);
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to sign contract: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      alert('❌ Failed to sign contract. Please try again.');
    }
  };

  const openContractDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setDetailsDialogOpen(true);
  };

  const isSigningRequired = (contract: Contract) => {
    return contract.status === 'pending_signatures' && !contract.signedByRto;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts & Partnerships</h1>
          <p className="text-gray-600">Manage your partnership agreements with workplace providers</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
              <DialogDescription>
                Create a new partnership agreement with a workplace provider.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="providerId">Provider Organization *</Label>
                <Input
                  id="providerId"
                  value={formData.providerId}
                  onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                  placeholder="Enter provider organization ID"
                />
                <p className="text-xs text-gray-500 mt-1">
                  In production, this would be a searchable dropdown of verified providers
                </p>
              </div>

              <div>
                <Label htmlFor="contractType">Contract Type *</Label>
                <Select
                  value={formData.contractType}
                  onValueChange={(value: 'placement_agreement' | 'assessment_agreement' | 'full_partnership') => 
                    setFormData({ ...formData, contractType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placement_agreement">Placement Agreement</SelectItem>
                    <SelectItem value="assessment_agreement">Assessment Agreement</SelectItem>
                    <SelectItem value="full_partnership">Full Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxStudents">Maximum Students (Optional)</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateContract}
                disabled={creating || !formData.providerId || !formData.startDate || !formData.endDate}
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Contract
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contracts Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold">{contracts.filter(c => c.status === 'active').length}</p>
                <p className="text-sm text-gray-600">Active Contracts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold">{contracts.filter(c => c.status === 'pending_signatures').length}</p>
                <p className="text-sm text-gray-600">Pending Signatures</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold">{new Set(contracts.map(c => c.providerId)).size}</p>
                <p className="text-sm text-gray-600">Partner Providers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold">{contracts.reduce((sum, c) => sum + (c.maxStudents || 0), 0)}</p>
                <p className="text-sm text-gray-600">Max Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <Card>
        <CardHeader>
          <CardTitle>Partnership Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading contracts...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
              <p className="text-gray-600 mb-4">Create your first partnership agreement with a workplace provider.</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Contract
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider Partner</TableHead>
                  <TableHead>Contract Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contract Period</TableHead>
                  <TableHead>Max Students</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-green-600 mr-2" />
                        <div>
                          <p className="font-medium">{contract.providerName}</p>
                          <p className="text-sm text-gray-600">Workplace Provider</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        {getContractTypeDisplay(contract.contractType)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(contract.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm">
                            {new Date(contract.startDate).toLocaleDateString('en-AU')} - 
                            {new Date(contract.endDate).toLocaleDateString('en-AU')}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        {contract.maxStudents || 'Unlimited'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openContractDetails(contract)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {isSigningRequired(contract) && (
                          <Button
                            size="sm"
                            onClick={() => handleSignContract(contract.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <PenTool className="h-4 w-4 mr-1" />
                            Sign
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Contract Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
            <DialogDescription>
              Review the contract details and signature status
            </DialogDescription>
          </DialogHeader>

          {selectedContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Provider Partner</Label>
                  <p className="font-medium">{selectedContract.providerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Contract Type</Label>
                  <p className="font-medium">{getContractTypeDisplay(selectedContract.contractType)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Start Date</Label>
                  <p className="font-medium">{new Date(selectedContract.startDate).toLocaleDateString('en-AU')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">End Date</Label>
                  <p className="font-medium">{new Date(selectedContract.endDate).toLocaleDateString('en-AU')}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Maximum Students</Label>
                <p className="font-medium">{selectedContract.maxStudents || 'Unlimited'}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Contract Status</Label>
                <div className="mt-1">
                  {getStatusBadge(selectedContract.status)}
                </div>
              </div>

              {/* Signature Status */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-600">Signature Status</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-purple-600 mr-2" />
                      <span>RTO (You)</span>
                    </div>
                    {selectedContract.signedByRto ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          Signed {selectedContract.rtoSignedAt 
                            ? new Date(selectedContract.rtoSignedAt).toLocaleDateString('en-AU')
                            : ''
                          }
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-green-600 mr-2" />
                      <span>Provider</span>
                    </div>
                    {selectedContract.signedByProvider ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          Signed {selectedContract.providerSignedAt 
                            ? new Date(selectedContract.providerSignedAt).toLocaleDateString('en-AU')
                            : ''
                          }
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            {selectedContract && isSigningRequired(selectedContract) && (
              <Button
                onClick={() => handleSignContract(selectedContract.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <PenTool className="h-4 w-4 mr-2" />
                Sign Contract
              </Button>
            )}
            {selectedContract && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add the Label component since it's used
function Label({ children, className, htmlFor }: { children: React.ReactNode; className?: string; htmlFor?: string }) {
  return <label className={className} htmlFor={htmlFor}>{children}</label>;
}