
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import PatientSearch from '@/components/PatientSearch';
import { CustomButton } from '@/components/ui/CustomButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';
import { MoreVertical, Edit, Trash2, User, Calendar, Mail, Phone, Users, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import PatientDetail from '@/components/PatientDetail';

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  medicalRecordNumber?: string;
}

const PatientList = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const patientSchema = z.object({
    firstName: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email({
      message: "Please enter a valid email.",
    }).optional().or(z.literal('')),
    medicalRecordNumber: z.string().optional(),
  });

  const form = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
      email: "",
      medicalRecordNumber: "",
    },
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('last_name', { ascending: true });

      if (error) throw error;

      // Transform database field names to our component's expected format
      const formattedPatients: PatientData[] = (data || []).map(patient => ({
        id: patient.id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        dateOfBirth: patient.date_of_birth || undefined,
        gender: patient.gender || undefined,
        phone: patient.phone || undefined,
        email: patient.email || undefined,
        medicalRecordNumber: patient.medical_record_number || undefined
      }));

      setPatients(formattedPatients);
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

  const handlePatientSelect = (patient: PatientData) => {
    setSelectedPatient(patient);
    setShowDetail(true);
  };

  const handlePatientUpdated = () => {
    fetchPatients();
  };

  const calculateAge = (dateOfBirth?: string): number | undefined => {
    if (!dateOfBirth) return undefined;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // If birthday hasn't occurred yet this year, subtract 1 from age
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleCreatePatient = async (values: z.infer<typeof patientSchema>) => {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Transform our component's field names to match database field names
      const { error } = await supabase
        .from('patients')
        .insert([{
          first_name: values.firstName,
          last_name: values.lastName,
          date_of_birth: values.dateOfBirth,
          gender: values.gender,
          phone: values.phone,
          email: values.email,
          medical_record_number: values.medicalRecordNumber,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Patient Created",
        description: "Patient has been successfully created",
      });

      setOpen(false);
      form.reset();
      fetchPatients();
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: "Error",
        description: "Failed to create patient",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this patient? This action cannot be undone.");
      
      if (!confirmed) return;
      
      setIsLoading(true);
      
      // First delete all consultations associated with this patient
      const { error: consultationsError } = await supabase
        .from('consultations')
        .delete()
        .eq('patient_id', patientId);
      
      if (consultationsError) throw consultationsError;
      
      // Then delete the patient
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);
      
      if (error) throw error;
      
      // Remove the patient from local state
      setPatients(patients.filter(p => p.id !== patientId));
      
      // If the deleted patient was selected, clear the selection
      if (selectedPatient?.id === patientId) {
        setSelectedPatient(null);
      }
      
      toast({
        title: "Patient Deleted",
        description: "Patient has been successfully deleted",
      });
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const PatientCard = ({ patient }: { patient: PatientData }) => {
    const age = calculateAge(patient.dateOfBirth);
    
    return (
      <div 
        className={cn(
          "p-6 rounded-lg cursor-pointer transition-all hover:shadow-md border relative overflow-hidden",
          selectedPatient?.id === patient.id 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
            : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
        )}
        onClick={() => handlePatientSelect(patient)}
      >
        {/* Decorative Pattern */}
        <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 opacity-30"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-medium text-lg">{patient.firstName} {patient.lastName}</h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 space-x-3">
                  {patient.gender && <span className="capitalize">{patient.gender}</span>}
                  {age !== undefined && <span>{age} years</span>}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {patient.email && (
                <div className="flex items-center text-sm">
                  <Mail size={14} className="text-gray-400 mr-2" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
              
              {patient.phone && (
                <div className="flex items-center text-sm">
                  <Phone size={14} className="text-gray-400 mr-2" />
                  <span>{patient.phone}</span>
                </div>
              )}
              
              {patient.medicalRecordNumber && (
                <div className="flex items-center text-sm">
                  <Calendar size={14} className="text-gray-400 mr-2" />
                  <span>MRN: {patient.medicalRecordNumber}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePatient(patient.id);
              }}
              className="p-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label="Delete patient"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />

        <SidebarInset className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950">
          <div className="pt-6 pb-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-medium bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Patients</h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">Manage your patients</p>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <PatientSearch />

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <CustomButton
                      variant="primary"
                      size="md"
                      className="shadow-lg shadow-blue-500/20 hover:shadow-blue-600/20 transition-all bg-gradient-to-r from-blue-500 to-blue-600"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Patient
                    </CustomButton>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Patient</DialogTitle>
                      <DialogDescription>
                        Create a new patient record.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleCreatePatient)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="123-456-7890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="john.doe@example.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="medicalRecordNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medical Record Number</FormLabel>
                              <FormControl>
                                <Input placeholder="MRN12345" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <CustomButton 
                          type="submit" 
                          variant="primary" 
                          disabled={isCreating} 
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          {isCreating ? "Creating..." : "Create Patient"}
                        </CustomButton>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <Users size={32} className="text-blue-500" />
                </div>
                <h2 className="text-xl font-medium mb-2">No patients yet</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Start by adding your first patient to begin creating consultations and medical notes.
                </p>
                <CustomButton
                  variant="primary"
                  size="md"
                  onClick={() => setOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Plus size={16} className="mr-2" />
                  Add Your First Patient
                </CustomButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>
            )}
          </div>
        </SidebarInset>
      </div>

      {showDetail && selectedPatient && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-white dark:bg-gray-900 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-5">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setShowDetail(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6">
              <PatientDetail patient={selectedPatient} onPatientUpdated={handlePatientUpdated} />
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
};

export default PatientList;
