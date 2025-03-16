
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { CustomButton } from '@/components/ui/CustomButton';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SOAPNote from '@/components/note-templates/SOAPNote';
import HPNote from '@/components/note-templates/HPNote';
import { ProgressNote } from '@/components/note-templates/ProgressNote';

const ConsultationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [consultation, setConsultation] = useState<any>(null);
  const [patientName, setPatientName] = useState('');
  const [noteContent, setNoteContent] = useState('');
  
  const returnToPatientId = location.state?.returnToPatient;

  useEffect(() => {
    if (id) {
      fetchConsultationDetails(id);
    }
  }, [id]);

  const fetchConsultationDetails = async (consultationId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          patients (
            first_name,
            last_name
          )
        `)
        .eq('id', consultationId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setConsultation(data);
        // Fix: Only try to access note if content is an object
        if (data.content && typeof data.content === 'object') {
          setNoteContent(data.content.note || '');
        } else {
          setNoteContent('');
        }
        
        if (data.patients) {
          setPatientName(`${data.patients.first_name} ${data.patients.last_name}`);
        }
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load consultation details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveNote = async () => {
    if (!id) return;
    
    try {
      const updatedContent = consultation.content || {};
      updatedContent.note = noteContent;
      
      const { error } = await supabase
        .from('consultations')
        .update({
          content: updatedContent,
          status: 'completed'
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Note saved successfully',
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save note',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'MMMM d, yyyy');
    } catch (e) {
      return dateStr.substring(0, 10);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'h:mm a');
    } catch (e) {
      return '';
    }
  };

  const handleBack = () => {
    if (returnToPatientId) {
      navigate(`/patients/${returnToPatientId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const renderNoteTemplate = () => {
    if (!consultation) return null;
    
    switch (consultation.note_type) {
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
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
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
                    Consultation Note
                  </h1>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-1 shadow-md hover:shadow-lg transition-shadow duration-300 border-blue-100 dark:border-blue-900">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        Patient Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Patient Name</h4>
                        <p className="font-medium">{patientName}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h4>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <p>{consultation?.date ? formatDate(consultation.date) : 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</h4>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <p>{consultation?.date ? formatTime(consultation.date) : 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Note Type</h4>
                        <p>{consultation?.note_type || 'Standard Note'}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                        <p className="capitalize">{consultation?.status || 'Unknown'}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow duration-300 border-blue-100 dark:border-blue-900">
                    <CardHeader>
                      <CardTitle>
                        {consultation?.note_type || 'Standard'} Note
                      </CardTitle>
                      <CardDescription>
                        Review and edit the consultation note below
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderNoteTemplate()}
                      
                      <div className="mt-4 flex justify-end">
                        <CustomButton
                          variant="primary"
                          size="md"
                          onClick={saveNote}
                          className="bg-gradient-to-r from-blue-600 to-blue-500"
                        >
                          Save Note
                        </CustomButton>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ConsultationDetail;
