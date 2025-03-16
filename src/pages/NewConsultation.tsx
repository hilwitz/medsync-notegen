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
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [medicalHistory, setMedicalHistory] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState<boolean>(false);
  
  useEffect(() => {
    setNoteContent('');
  }, [noteType]);
  
  const handlePatientSelect = (patient: any) => {
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
            chief_complaint: chiefComplaint,
            medical_history: medicalHistory,
            note: noteContent
          }
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Consultation created successfully!",
      });
      
      navigate(`/consultations/${data.id}`);
      
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

  const handleWriteWithAI = async () => {
    if (!chiefComplaint && !medicalHistory) {
      toast({
        title: "Error",
        description: "Please provide at least some information about the patient's symptoms or medical history.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGeneratingWithAI(true);

      const { data, error } = await supabase.functions.invoke('write-with-gemini', {
        body: {
          noteType: noteType,
          patientInfo: patientName,
          symptoms: chiefComplaint,
          medicalHistory: medicalHistory
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setNoteContent(data.note);

      toast({
        title: "Success",
        description: "Note generated successfully!"
      });

    } catch (error) {
      console.error('Error generating note with AI:', error);
      toast({
        title: "Error",
        description: `Failed to generate note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingWithAI(false);
    }
  };
  
  const renderNoteTemplate = () => {
    switch (noteType) {
      case 'SOAP':
        return (
          <SOAPNote 
            noteContent={noteContent} 
            setNoteContent={setNoteContent}
            onWriteWithAI={handleWriteWithAI}
            isGeneratingWithAI={isGeneratingWithAI}
          />
        );
      case 'H&P':
        return (
          <HPNote 
            noteContent={noteContent} 
            setNoteContent={setNoteContent}
            onWriteWithAI={handleWriteWithAI}
            isGeneratingWithAI={isGeneratingWithAI}
          />
        );
      case 'Progress':
        return (
          <ProgressNote 
            noteContent={noteContent} 
            setNoteContent={setNoteContent}
            onWriteWithAI={handleWriteWithAI}
            isGeneratingWithAI={isGeneratingWithAI}
          />
        );
      default:
        return (
          <div className="p-4 border rounded-md">
            <textarea
              className="w-full h-64 p-2 border rounded-md"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter consultation notes here..."
            />
          </div>
        );
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
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-blue-100 dark:border-blue-900">
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
                      <div className="space-y-4">
                        <PatientSearch 
                          onSelect={handlePatientSelect as any} 
                        />
                        
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Search for a patient by name or add a new patient first.
                        </p>
                      </div>
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
                
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-blue-100 dark:border-blue-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Consultation Details
                    </CardTitle>
                    <CardDescription>
                      Enter consultation date and type
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="noteType">Note Type</Label>
                      <Select value={noteType} onValueChange={setNoteType}>
                        <SelectTrigger id="noteType" className="border-blue-200 focus:border-blue-400">
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
                        <SelectTrigger id="status" className="border-blue-200 focus:border-blue-400">
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
                
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-blue-100 dark:border-blue-900">
                  <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                    <CardDescription>
                      Enter patient details for this visit
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="chiefComplaint">Chief Complaint / Symptoms</Label>
                      <Textarea
                        id="chiefComplaint"
                        value={chiefComplaint}
                        onChange={(e) => setChiefComplaint(e.target.value)}
                        placeholder="Describe the patient's main symptoms and concerns..."
                        className="min-h-[100px] border-blue-200 focus:border-blue-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="medicalHistory">Medical History</Label>
                      <Textarea
                        id="medicalHistory"
                        value={medicalHistory}
                        onChange={(e) => setMedicalHistory(e.target.value)}
                        placeholder="Enter relevant medical history..."
                        className="min-h-[100px] border-blue-200 focus:border-blue-400"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow duration-300 border-blue-100 dark:border-blue-900">
                <CardHeader>
                  <CardTitle>
                    {noteType === 'SOAP' ? 'SOAP Note' : 
                     noteType === 'H&P' ? 'History & Physical' : 
                     noteType === 'Progress' ? 'Progress Note' : 'Consultation Note'}
                  </CardTitle>
                  <CardDescription>
                    Create a detailed medical note for this consultation
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
    </SidebarProvider>
  );
};

export default NewConsultation;
