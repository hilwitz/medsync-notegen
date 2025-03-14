
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
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
import { Search, Plus, User, Trash2, Edit2, EyeIcon, AlertTriangle } from 'lucide-react';
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

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();
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
  }, []);
  
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
  
  const filteredPatients = patients.filter(patient => 
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medical_record_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        
        <SidebarInset className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
          <div className="container px-4 py-8">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Patients</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage and view your patients
                  </p>
                </div>
                
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <CustomButton 
                      variant="primary" 
                      size="md" 
                      className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
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
                          className="border-indigo-200 focus:border-indigo-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input 
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="border-indigo-200 focus:border-indigo-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-indigo-200 focus:border-indigo-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="border-indigo-200 focus:border-indigo-400"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger id="gender" className="border-indigo-200 focus:border-indigo-400">
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
                          className="border-indigo-200 focus:border-indigo-400"
                        />
                      </div>
                      
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="mrn">Medical Record Number</Label>
                        <Input 
                          id="mrn"
                          value={mrn}
                          onChange={(e) => setMrn(e.target.value)}
                          className="border-indigo-200 focus:border-indigo-400"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <CustomButton 
                        variant="outline" 
                        size="md"
                        onClick={() => setShowAddDialog(false)}
                        className="border-indigo-200 hover:bg-indigo-50"
                      >
                        Cancel
                      </CustomButton>
                      <CustomButton 
                        variant="primary" 
                        size="md"
                        onClick={handleAddPatient}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600"
                      >
                        Add Patient
                      </CustomButton>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-indigo-100 dark:border-indigo-900">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Patient List</CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        placeholder="Search patients..."
                        className="pl-10 border-indigo-200 focus:border-indigo-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="py-10 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-4 text-gray-500">Loading patients...</p>
                    </div>
                  ) : filteredPatients.length > 0 ? (
                    <div className="rounded-md border border-indigo-100 dark:border-indigo-900 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-indigo-50 dark:bg-indigo-900/30">
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
                            <TableRow key={patient.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10">
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
                                  ? new Date(patient.date_of_birth).toLocaleDateString() 
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <CustomButton
                                    variant="outline" 
                                    size="sm"
                                    className="h-8 w-8 p-0 border-indigo-200 hover:bg-indigo-50" 
                                    onClick={() => handleViewPatient(patient.id)}
                                  >
                                    <EyeIcon className="h-4 w-4 text-indigo-600" />
                                    <span className="sr-only">View</span>
                                  </CustomButton>
                                  <CustomButton
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 border-indigo-200 hover:bg-indigo-50"
                                    onClick={() => handleNewConsultation(
                                      patient.id, 
                                      patient.first_name, 
                                      patient.last_name
                                    )}
                                  >
                                    <Plus className="h-4 w-4 text-indigo-600" />
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
                      <User className="h-12 w-12 mx-auto text-indigo-400 opacity-50" />
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
                          className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600"
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
