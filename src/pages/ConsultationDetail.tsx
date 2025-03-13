
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CustomButton } from '@/components/ui/CustomButton';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  medical_record_number?: string;
}

interface Consultation {
  id: string;
  user_id: string;
  patient_id: string;
  note_type: string;
  status: string;
  date: string;
  content: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

const ConsultationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [content, setContent] = useState<any>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  // Fetch consultation and patient data
  useEffect(() => {
    const fetchConsultation = async () => {
      if (!id) return;
      
      try {
        const { data: consultationData, error: consultationError } = await supabase
          .from('consultations')
          .select('*')
          .eq('id', id)
          .single();
        
        if (consultationError) {
          throw consultationError;
        }
        
        if (!consultationData) {
          toast({
            title: "Not Found",
            description: "Consultation not found",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        setConsultation(consultationData);
        
        if (consultationData.content) {
          setContent({
            subjective: consultationData.content.subjective || '',
            objective: consultationData.content.objective || '',
            assessment: consultationData.content.assessment || '',
            plan: consultationData.content.plan || ''
          });
        }
        
        // Fetch patient info
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', consultationData.patient_id)
          .single();
        
        if (patientError) {
          throw patientError;
        }
        
        setPatient(patientData);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load consultation",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConsultation();
  }, [id, navigate, toast]);

  // Save content changes
  const saveConsultation = async () => {
    if (!consultation) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('consultations')
        .update({
          content,
          status: 'in_progress', // Update status when content is saved
          updated_at: new Date().toISOString()
        })
        .eq('id', consultation.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Consultation saved successfully"
      });
    } catch (error: any) {
      console.error('Error saving consultation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save consultation",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle content changes
  const handleContentChange = (section: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [section]: value
    }));
  };

  // Complete consultation
  const completeConsultation = async () => {
    if (!consultation) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('consultations')
        .update({
          content,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', consultation.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Consultation completed successfully"
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error completing consultation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete consultation",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-medsync-600" />
      </div>
    );
  }

  if (!consultation || !patient) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Consultation not found</h1>
          <p className="mt-2 text-gray-600">The consultation you're looking for doesn't exist or you don't have access to it.</p>
          <CustomButton
            variant="primary"
            size="md"
            className="mt-4"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </CustomButton>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(consultation.created_at).toLocaleDateString();
  const formattedTime = new Date(consultation.created_at).toLocaleTimeString();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Consultation Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {formattedDate} at {formattedTime}
          </p>
        </div>
        <div className="flex gap-4">
          <CustomButton
            variant="outline"
            size="md"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </CustomButton>
          <CustomButton
            variant="primary"
            size="md"
            onClick={saveConsultation}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </CustomButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium">{patient.first_name} {patient.last_name}</p>
              </div>
              
              {patient.date_of_birth && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                  <p className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                </div>
              )}
              
              {patient.gender && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                  <p className="font-medium">{patient.gender}</p>
                </div>
              )}
              
              {patient.email && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              )}
              
              {patient.phone && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
              )}
              
              {patient.medical_record_number && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Medical Record #</p>
                  <p className="font-medium">{patient.medical_record_number}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Consultation Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Note Type</p>
                  <p className="font-medium">{consultation.note_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className="font-medium capitalize">{consultation.status.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 mb-8">
        <Tabs defaultValue="subjective" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="subjective">Subjective</TabsTrigger>
            <TabsTrigger value="objective">Objective</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subjective" className="space-y-4">
            <h3 className="text-lg font-semibold">Subjective</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Record the patient's symptoms, complaints, and medical history as described by the patient.</p>
            <Textarea 
              value={content.subjective} 
              onChange={(e) => handleContentChange('subjective', e.target.value)}
              className="min-h-[200px]"
              placeholder="Enter subjective information..."
            />
          </TabsContent>
          
          <TabsContent value="objective" className="space-y-4">
            <h3 className="text-lg font-semibold">Objective</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Document measurable, observable data from the physical examination and diagnostic tests.</p>
            <Textarea 
              value={content.objective} 
              onChange={(e) => handleContentChange('objective', e.target.value)}
              className="min-h-[200px]"
              placeholder="Enter objective findings..."
            />
          </TabsContent>
          
          <TabsContent value="assessment" className="space-y-4">
            <h3 className="text-lg font-semibold">Assessment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Provide your clinical assessment, diagnosis, or interpretation of the patient's condition.</p>
            <Textarea 
              value={content.assessment} 
              onChange={(e) => handleContentChange('assessment', e.target.value)}
              className="min-h-[200px]"
              placeholder="Enter assessment information..."
            />
          </TabsContent>
          
          <TabsContent value="plan" className="space-y-4">
            <h3 className="text-lg font-semibold">Plan</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Detail the treatment plan, medications, follow-up instructions, and referrals.</p>
            <Textarea 
              value={content.plan} 
              onChange={(e) => handleContentChange('plan', e.target.value)}
              className="min-h-[200px]"
              placeholder="Enter treatment plan..."
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-end space-x-4">
        <CustomButton
          variant="outline"
          size="lg"
          onClick={() => navigate('/dashboard')}
        >
          Cancel
        </CustomButton>
        
        <CustomButton
          variant="primary"
          size="lg"
          onClick={completeConsultation}
          disabled={isSaving}
        >
          {isSaving ? "Completing..." : "Complete Consultation"}
        </CustomButton>
      </div>
    </div>
  );
};

export default ConsultationDetail;
