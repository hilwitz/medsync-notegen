
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { SidebarOpener } from '@/components/SidebarOpener';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/CustomButton';
import { Search, Plus, User, Trash2, Edit2, EyeIcon, AlertTriangle, ArrowLeft, Calendar, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  medical_record_number: string | null;
  created_at: string;
}

interface Consultation {
  id: string;
  created_at: string;
  date: string;
  note_type: string;
  status: string;
  content: any;
}

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  
  const navigate = useNavigate();
  const { id: patientIdParam } = useParams();
  const { toast } = useToast();
  
  // New patient form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [mrn, setMrn] = useState('');
  
  useEffect(() => {
    fetchPatients();
    
    // If a patient ID is provided in the URL, fetch that patient's details
    if (patientIdParam) {
      setViewMode('detail');
      fetchPatientDetails(patientIdParam);
    }
  }, [patientIdParam]);
  
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('last_name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchPatientDetails = async (patientId: string) => {
    try {
      setIsLoading(true);
      
      // Fetch patient details
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      
      if (patientError) throw patientError;
      setSelectedPatient(patientData);
      
      // Fetch patient's consultations
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });
      
      if (consultationsError) throw consultationsError;
      setConsultations(consultationsData || []);
      
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast({
        title: "Error",
        description: "Failed to load patient details",
        variant: "destructive"
      });
      setViewMode('list');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddPatient = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }
      
      const { data, error } = await supabase
        .from('patients')
        .insert({
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          email: email || null,
          phone: phone || null,
          gender: gender || null,
          date_of_birth: dob || null,
          medical_record_number: mrn || null
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Patient added successfully",
      });
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setGender('');
      setDob('');
      setMrn('');
      
      // Close dialog
      setShowAddDialog(false);
      
      // Refresh list
      fetchPatients();
    } catch (error) {
      console.error('Error adding patient:', error);
      toast({
        title: "Error",
        description: "Failed to add patient",
        variant: "destructive"
      });
    }
  };
  
  const openDeleteDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDeleteDialog(true);
  };
  
  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', selectedPatient.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
      
      // Update the local state
      setPatients(patients.filter(p => p.id !== selectedPatient.id));
      setShowDeleteDialog(false);
      
      // If we're viewing the deleted patient, go back to list
      if (viewMode === 'detail') {
        setViewMode('list');
        navigate('/patients');
      }
      
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Error",
        description: "Failed to delete patient. They may have associated consultations.",
        variant: "destructive"
      });
    }
  };
  
  const handleViewPatient = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };
  
  const handleNewConsultation = (patientId: string, firstName: string, lastName: string) => {
    navigate('/consultations/new', { 
      state: { 
        patientId,
        patientFirstName: firstName,
        patientLastName: lastName
      } 
    });
  };
  
  const handleViewConsultation = (consultationId: string) => {
    navigate(`/consultations/${consultationId}`);
  };
  
  const handleBackToList = () => {
    setViewMode('list');
    navigate('/patients');
  };
  
  const filteredPatients = patients.filter(patient => 
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medical_record_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatConsultationDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return dateStr.substring(0, 10);
    }
  };

  const formatConsultationTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'h:mm a');
    } catch (e) {
      return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'SOAP':
        return 'SOAP Note';
      case 'H&P':
        return 'History & Physical';
      case 'Progress':
        return 'Progress Note';
      default:
        return type;
    }
  };
  
  const renderPatientDetail = () => {
    if (isLoading) {
      return (
        <div className="py-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading patient data...</p>
        </div>
      );
    }
    
    if (!selectedPatient) {
      return (
        <div className="py-10 text-center">
          <p className="text-gray-500">Patient not found</p>
          <CustomButton 
            variant="primary" 
            onClick={handleBackToList}
            className="mt-4"
          >
            Back to Patients
          </CustomButton>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <CustomButton
            variant="outline"
            size="sm"
            onClick={handleBackToList}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </CustomButton>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            {selectedPatient.first_name} {selectedPatient.last_name}
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Info Card */}
          <Card className="md:col-span-1 shadow-md hover:shadow-lg transition-shadow duration-300 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {selectedPatient.medical_record_number && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">MRN</h4>
                    <p className="font-medium">{selectedPatient.medical_record_number}</p>
                  </div>
                )}
                
                {selectedPatient.date_of_birth && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</h4>
                    <p>{formatConsultationDate(selectedPatient.date_of_birth)}</p>
                  </div>
                )}
                
                {selectedPatient.gender && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</h4>
                    <p className="capitalize">{selectedPatient.gender}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Information</h4>
                  {selectedPatient.email && <p>{selectedPatient.email}</p>}
                  {selectedPatient.phone && <p>{selectedPatient.phone}</p>}
                  {!selectedPatient.email && !selectedPatient.phone && <p className="text-gray-400">No contact information</p>}
                </div>
                
                <div className="pt-2 flex gap-2">
                  <CustomButton
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500"
                    onClick={() => handleNewConsultation(
                      selectedPatient.id,
                      selectedPatient.first_name,
                      selectedPatient.last_name
                    )}
                  >
                    <Plus className="h-4 w-4 mr-1" /> New Consultation
                  </CustomButton>
                  
                  <CustomButton
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 border-red-200 hover:bg-red-50 text-red-600"
                    onClick={() => openDeleteDialog(selectedPatient)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </CustomButton>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Consultations Card */}
          <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow duration-300 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Consultation History
              </CardTitle>
              <CardDescription>
                View all consultations for this patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consultations.length > 0 ? (
                <div className="rounded-md border border-blue-100 dark:border-blue-900 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-blue-50 dark:bg-blue-900/30">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consultations.map((consultation) => (
                        <TableRow key={consultation.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                          <TableCell>
                            {formatConsultationDate(consultation.date)}
                          </TableCell>
                          <TableCell>
                            {formatConsultationTime(consultation.date)}
                          </TableCell>
                          <TableCell>
                            {getNoteTypeLabel(consultation.note_type)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                              {consultation.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <CustomButton
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0 border-blue-200 hover:bg-blue-50" 
                              onClick={() => handleViewConsultation(consultation.id)}
                            >
                              <EyeIcon className="h-4 w-4 text-blue-600" />
                              <span className="sr-only">View</span>
                            </CustomButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-blue-400 opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No consultations yet</h3>
                  <p className="mt-1 text-gray-500">
                    This patient doesn't have any consultations
                  </p>
                  <CustomButton
                    variant="primary"
                    size="md"
                    className="mt-4 bg-gradient-to-r from-blue-600 to-blue-500"
                    onClick={() => handleNewConsultation(
                      selectedPatient.id,
                      selectedPatient.first_name,
                      selectedPatient.last_name
                    )}
                  >
                    <Plus className="mr-2 h-4 w-4" /> New Consultation
                  </CustomButton>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  const renderPatientList = () => {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Patients</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage and view your patients
            </p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <CustomButton 
                variant="primary" 
                size="md" 
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Plus size={16} />
                Add Patient
              </CustomButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                  Enter the patient's information below
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender" className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input 
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="mrn">Medical Record Number</Label>
                  <Input 
                    id="mrn"
                    value={mrn}
                    onChange={(e) => setMrn(e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <CustomButton 
                  variant="outline" 
                  size="md"
                  onClick={() => setShowAddDialog(false)}
                  className="border-blue-200 hover:bg-blue-50"
                >
                  Cancel
                </CustomButton>
                <CustomButton 
                  variant="primary" 
                  size="md"
                  onClick={handleAddPatient}
                  className="bg-gradient-to-r from-blue-500 to-blue-600"
                >
                  Add Patient
                </CustomButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-blue-100 dark:border-blue-900">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Patient List</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search patients..."
                  className="pl-10 border-blue-200 focus:border-blue-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading patients...</p>
              </div>
            ) : filteredPatients.length > 0 ? (
              <div className="rounded-md border border-blue-100 dark:border-blue-900 overflow-hidden">
                <Table>
                  <TableHeader className="bg-blue-50 dark:bg-blue-900/30">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>MRN</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>DOB</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                        <TableCell className="font-medium">
                          {patient.first_name} {patient.last_name}
                        </TableCell>
                        <TableCell>{patient.medical_record_number || '-'}</TableCell>
                        <TableCell>
                          {patient.email && <div>{patient.email}</div>}
                          {patient.phone && <div>{patient.phone}</div>}
                          {!patient.email && !patient.phone && '-'}
                        </TableCell>
                        <TableCell>{patient.gender || '-'}</TableCell>
                        <TableCell>
                          {patient.date_of_birth 
                            ? formatConsultationDate(patient.date_of_birth)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <CustomButton
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0 border-blue-200 hover:bg-blue-50" 
                              onClick={() => handleViewPatient(patient.id)}
                            >
                              <EyeIcon className="h-4 w-4 text-blue-600" />
                              <span className="sr-only">View</span>
                            </CustomButton>
                            <CustomButton
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleNewConsultation(
                                patient.id, 
                                patient.first_name, 
                                patient.last_name
                              )}
                            >
                              <Plus className="h-4 w-4 text-blue-600" />
                              <span className="sr-only">New Consultation</span>
                            </CustomButton>
                            <CustomButton
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
                              onClick={() => openDeleteDialog(patient)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Delete</span>
                            </CustomButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <User className="h-12 w-12 mx-auto text-blue-400 opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No patients found</h3>
                <p className="mt-1 text-gray-500">
                  {searchTerm 
                    ? `No results for "${searchTerm}"`
                    : "Get started by adding your first patient"}
                </p>
                {!searchTerm && (
                  <CustomButton
                    variant="primary"
                    size="md"
                    className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Patient
                  </CustomButton>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <SidebarOpener />
        
        <SidebarInset className="bg-gradient-to-br from-blue-50 to-sky-100 dark:from-gray-900 dark:to-blue-950">
          <div className="container px-4 py-8">
            {viewMode === 'list' ? renderPatientList() : renderPatientDetail()}
          </div>
        </SidebarInset>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete patient "{selectedPatient?.first_name} {selectedPatient?.last_name}"? 
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePatient}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default Patients;
