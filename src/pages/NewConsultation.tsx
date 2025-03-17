
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Calendar, ArrowLeft, User } from 'lucide-react';
import { CustomButton } from '@/components/ui/CustomButton';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import PatientSearch from '@/components/PatientSearch';
import SOAPNote from '@/components/note-templates/SOAPNote';
import HPNote from '@/components/note-templates/HPNote';
import { ProgressNote } from '@/components/note-templates/ProgressNote';
import SubscriptionConfirmation from '@/components/SubscriptionConfirmation';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

const NewConsultation = () => {
  const location = useLocation();
  const initialPatientId = location.state?.patientId || '';
  const initialPatientFirstName = location.state?.patientFirstName || '';
  const initialPatientLastName = location.state?.patientLastName || '';
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);
  const [patientName, setPatientName] = useState<string>(
    initialPatientFirstName && initialPatientLastName 
      ? `${initialPatientFirstName} ${initialPatientLastName}`
      : ''
  );
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [noteType, setNoteType] = useState<string>('SOAP');
  const [status, setStatus] = useState<string>('scheduled');
  const [patientSymptoms, setPatientSymptoms] = useState<string>('');
  const [medicalHistory, setMedicalHistory] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [consultationsCount, setConsultationsCount] = useState<number>(0);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  
  useEffect(() => {
    setNoteContent('');
    
    // Check if user is premium
    const checkPremiumStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // First check if we have a subscription record
        try {
          const { data, error } = await supabase.functions.invoke('check-subscription', {
            body: { userId: user.id }
          });
          
          if (!error && data && data.isSubscribed) {
            setIsPremium(true);
            return;
          }
        } catch (e) {
          console.log("Couldn't use check-subscription, falling back to email check");
        }
        
        // Fallback to email check
        setIsPremium(user.email === "hilwitz.solutions@gmail.com");
        
        // Count consultations for free users
        if (user.email !== "hilwitz.solutions@gmail.com") {
          const { count, error } = await supabase
            .from('consultations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          if (!error) {
            setConsultationsCount(count || 0);
          }
        }
      }
    };
    
    checkPremiumStatus();
  }, [noteType]);
  
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setPatientName(`${patient.first_name} ${patient.last_name}`);
  };
  
  const handleCreateConsultation = async () => {
    if (!selectedPatientId) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive"
      });
      return;
    }
    
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive"
      });
      return;
    }

    if (!noteContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter consultation notes",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a consultation",
          variant: "destructive"
        });
        return;
      }
      
      // Check if user has reached consultation limit
      if (!isPremium && consultationsCount >= 1) {
        // Show subscription dialog instead of error
        setSelectedPlan('monthly');
        setShowSubscriptionDialog(true);
        return;
      }
      
      const dateTime = time ? `${date}T${time}:00` : `${date}T00:00:00`;
      
      const { data, error } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          patient_id: selectedPatientId,
          date: dateTime,
          note_type: noteType,
          status: status,
          content: {
            chief_complaint: patientSymptoms,
            medical_history: medicalHistory,
            note: noteContent
          }
        })
        .select()
        .single();
      
      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Consultation created successfully!",
      });
      
      // If this is their first consultation (free tier), show the subscription dialog
      if (!isPremium && consultationsCount === 0) {
        setSelectedPlan('monthly');
        setShowSubscriptionDialog(true);
      } else {
        navigate(`/consultations/${data.id}`);
      }
      
    } catch (error) {
      console.error('Error creating consultation:', error);
      toast({
        title: "Error",
        description: "Failed to create consultation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const renderNoteTemplate = () => {
    switch (noteType) {
      case 'SOAP':
        return (
          <SOAPNote 
            noteContent={noteContent} 
            setNoteContent={setNoteContent}
          />
        );
      case 'H&P':
        return (
          <HPNote 
            noteContent={noteContent} 
            setNoteContent={setNoteContent}
          />
        );
      case 'Progress':
        return (
          <ProgressNote 
            noteContent={noteContent} 
            setNoteContent={setNoteContent}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        
        <SidebarInset className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950">
          <div className="container px-4 py-8">
            <div className="flex items-center gap-2 mb-8">
              <CustomButton
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </CustomButton>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                New Consultation
              </h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-6">
                <Card className="shadow-md border-blue-100 dark:border-blue-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Patient Information
                    </CardTitle>
                    <CardDescription>
                      Select or search for a patient
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!selectedPatientId ? (
                      <PatientSearch onSelect={handlePatientSelect} />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{patientName}</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Selected Patient</p>
                          </div>
                          <CustomButton
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPatientId('');
                              setPatientName('');
                            }}
                          >
                            Change
                          </CustomButton>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-blue-100 dark:border-blue-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Consultation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="noteType">Note Type</Label>
                      <Select value={noteType} onValueChange={setNoteType}>
                        <SelectTrigger id="noteType">
                          <SelectValue placeholder="Select note type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SOAP">SOAP Note</SelectItem>
                          <SelectItem value="H&P">History & Physical</SelectItem>
                          <SelectItem value="Progress">Progress Note</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-blue-100 dark:border-blue-900">
                  <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                    <CardDescription>
                      Enter information about the patient
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientSymptoms">Patient Symptoms / Chief Complaint</Label>
                      <Textarea
                        id="patientSymptoms"
                        value={patientSymptoms}
                        onChange={(e) => setPatientSymptoms(e.target.value)}
                        placeholder="Describe the patient's symptoms..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="medicalHistory">Relevant Medical History</Label>
                      <Textarea
                        id="medicalHistory"
                        value={medicalHistory}
                        onChange={(e) => setMedicalHistory(e.target.value)}
                        placeholder="Enter any relevant medical history..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="md:col-span-2 shadow-md border-blue-100 dark:border-blue-900">
                <CardHeader>
                  <CardTitle>
                    {noteType === 'SOAP' ? 'SOAP Note' : 
                     noteType === 'H&P' ? 'History & Physical' : 
                     'Progress Note'}
                  </CardTitle>
                  <CardDescription>
                    Write a medical note for this consultation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderNoteTemplate()}
                  
                  <div className="mt-6 flex justify-end">
                    <CustomButton
                      variant="primary"
                      size="lg"
                      onClick={handleCreateConsultation}
                      disabled={isLoading || !selectedPatientId}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      {isLoading ? 'Creating...' : 'Create Consultation'}
                    </CustomButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
      
      <SubscriptionConfirmation
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        plan={selectedPlan}
      />
    </SidebarProvider>
  );
};

export default NewConsultation;
