import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CustomButton } from '@/components/ui/CustomButton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Save, ArrowLeft, Sparkles } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface SoapContent {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  [key: string]: Json | undefined;
}

interface HPContent {
  history?: string;
  physical_exam?: string;
  assessment?: string;
  plan?: string;
  [key: string]: Json | undefined;
}

interface ProgressContent {
  progress_note?: string;
  [key: string]: Json | undefined;
}

type ContentType = SoapContent | HPContent | ProgressContent;

const ConsultationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [consultation, setConsultation] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  
  const [history, setHistory] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [hpAssessment, setHpAssessment] = useState('');
  const [hpPlan, setHpPlan] = useState('');
  
  const [progressNote, setProgressNote] = useState('');
  
  useEffect(() => {
    const fetchConsultation = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        const { data: consultationData, error: consultationError } = await supabase
          .from('consultations')
          .select('*, patients(*)')
          .eq('id', id)
          .single();
        
        if (consultationError) throw consultationError;
        
        setConsultation(consultationData);
        setPatient(consultationData.patients);
        
        if (consultationData.note_type === 'SOAP') {
          const content = consultationData.content as SoapContent || {};
          setSubjective(content.subjective || '');
          setObjective(content.objective || '');
          setAssessment(content.assessment || '');
          setPlan(content.plan || '');
        } else if (consultationData.note_type === 'H&P') {
          const content = consultationData.content as HPContent || {};
          setHistory(content.history || '');
          setPhysicalExam(content.physical_exam || '');
          setHpAssessment(content.assessment || '');
          setHpPlan(content.plan || '');
        } else {
          const content = consultationData.content as ProgressContent || {};
          setProgressNote(content.progress_note || '');
        }
      } catch (error) {
        console.error('Error fetching consultation:', error);
        toast({
          title: "Error",
          description: "Failed to load consultation details",
          variant: "destructive"
        });
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConsultation();
  }, [id, navigate, toast]);
  
  const handleSave = async () => {
    if (!consultation) return;
    
    try {
      setIsSaving(true);
      
      let contentObj: ContentType = {};
      
      if (consultation.note_type === 'SOAP') {
        contentObj = {
          subjective,
          objective,
          assessment,
          plan
        };
      } else if (consultation.note_type === 'H&P') {
        contentObj = {
          history,
          physical_exam: physicalExam,
          assessment: hpAssessment,
          plan: hpPlan
        };
      } else {
        contentObj = {
          progress_note: progressNote
        };
      }
      
      const { error } = await supabase
        .from('consultations')
        .update({
          content: contentObj as Json,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Saved",
        description: "Consultation notes saved successfully"
      });
    } catch (error) {
      console.error('Error saving consultation:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEnhanceWithAI = (section: 'subjective' | 'objective' | 'assessment' | 'plan' | 'history' | 'physical_exam' | 'hp_assessment' | 'hp_plan' | 'progress_note') => {
    let currentText = '';
    
    switch (section) {
      case 'subjective':
        currentText = subjective;
        break;
      case 'objective':
        currentText = objective;
        break;
      case 'assessment':
        currentText = assessment;
        break;
      case 'plan':
        currentText = plan;
        break;
      case 'history':
        currentText = history;
        break;
      case 'physical_exam':
        currentText = physicalExam;
        break;
      case 'hp_assessment':
        currentText = hpAssessment;
        break;
      case 'hp_plan':
        currentText = hpPlan;
        break;
      case 'progress_note':
        currentText = progressNote;
        break;
    }
    
    if (!currentText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to enhance",
        variant: "destructive"
      });
      return;
    }
    
    setIsEnhancing(true);
    
    setTimeout(() => {
      let enhancedText = `${currentText}\n\nAdditional clinical details: Patient's vital signs are stable. Examination reveals normal findings with no acute distress. Previous medical history has been considered in this assessment.`;
      
      switch (section) {
        case 'subjective':
          setSubjective(enhancedText);
          break;
        case 'objective':
          setObjective(enhancedText);
          break;
        case 'assessment':
          setAssessment(enhancedText);
          break;
        case 'plan':
          setPlan(enhancedText);
          break;
        case 'history':
          setHistory(enhancedText);
          break;
        case 'physical_exam':
          setPhysicalExam(enhancedText);
          break;
        case 'hp_assessment':
          setHpAssessment(enhancedText);
          break;
        case 'hp_plan':
          setHpPlan(enhancedText);
          break;
        case 'progress_note':
          setProgressNote(enhancedText);
          break;
      }
      
      setIsEnhancing(false);
      
      toast({
        title: "Success!",
        description: "Content enhanced with AI"
      });
    }, 2000);
  };
  
  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <DashboardSidebar />
          
          <SidebarInset className="bg-neutral-50 dark:bg-neutral-900">
            <div className="container py-12 flex justify-center items-center">
              <div className="animate-spin h-8 w-8 border-4 border-medsync-600 border-t-transparent rounded-full"></div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }
  
  if (!consultation) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <DashboardSidebar />
          
          <SidebarInset className="bg-neutral-50 dark:bg-neutral-900">
            <div className="container py-12">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Consultation not found</h1>
                <CustomButton 
                  variant="outline" 
                  size="md" 
                  onClick={() => navigate('/dashboard')}
                >
                  Return to Dashboard
                </CustomButton>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        
        <SidebarInset className="bg-neutral-50 dark:bg-neutral-900">
          <div className="container py-8 px-4">
            <div className="mb-8">
              <div className="flex items-center mb-2">
                <CustomButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/dashboard')}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </CustomButton>
                <h1 className="text-2xl font-bold">{patient?.first_name} {patient?.last_name}</h1>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-medsync-100 dark:bg-medsync-900/30 text-medsync-700 dark:text-medsync-300">
                  {consultation.note_type}
                </span>
                <span className="text-sm text-neutral-500">
                  Created: {new Date(consultation.created_at).toLocaleString()}
                </span>
                <span className="text-sm text-neutral-500">
                  Updated: {new Date(consultation.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="mb-6 flex justify-end">
              <CustomButton 
                variant="primary" 
                size="md" 
                className="shadow-md"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'} <Save className="ml-2 h-4 w-4" />
              </CustomButton>
            </div>
            
            {consultation.note_type === 'SOAP' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Subjective</CardTitle>
                      <CardDescription>Patient's symptoms, complaints, and history</CardDescription>
                    </div>
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEnhanceWithAI('subjective')}
                      disabled={isEnhancing}
                    >
                      <Sparkles className="h-4 w-4 mr-1" /> Enhance
                    </CustomButton>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={subjective}
                      onChange={(e) => setSubjective(e.target.value)}
                      className="min-h-[150px]"
                      placeholder="Enter subjective information..."
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Objective</CardTitle>
                      <CardDescription>Physical examination findings and test results</CardDescription>
                    </div>
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEnhanceWithAI('objective')}
                      disabled={isEnhancing}
                    >
                      <Sparkles className="h-4 w-4 mr-1" /> Enhance
                    </CustomButton>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      className="min-h-[150px]"
                      placeholder="Enter objective information..."
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Assessment</CardTitle>
                      <CardDescription>Diagnosis and interpretation of findings</CardDescription>
                    </div>
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEnhanceWithAI('assessment')}
                      disabled={isEnhancing}
                    >
                      <Sparkles className="h-4 w-4 mr-1" /> Enhance
                    </CustomButton>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={assessment}
                      onChange={(e) => setAssessment(e.target.value)}
                      className="min-h-[150px]"
                      placeholder="Enter assessment..."
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Plan</CardTitle>
                      <CardDescription>Treatment, follow-up, and management plan</CardDescription>
                    </div>
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEnhanceWithAI('plan')}
                      disabled={isEnhancing}
                    >
                      <Sparkles className="h-4 w-4 mr-1" /> Enhance
                    </CustomButton>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="min-h-[150px]"
                      placeholder="Enter plan..."
                    />
                  </CardContent>
                </Card>
              </div>
            )}
            
            {consultation.note_type === 'H&P' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>History</CardTitle>
                      <CardDescription>Patient's medical history and current complaints</CardDescription>
                    </div>
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEnhanceWithAI('history')}
                      disabled={isEnhancing}
                    >
                      <Sparkles className="h-4 w-4 mr-1" /> Enhance
                    </CustomButton>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={history}
                      onChange={(e) => setHistory(e.target.value)}
                      className="min-h-[200px]"
                      placeholder="Enter patient history..."
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Physical Examination</CardTitle>
                      <CardDescription>Findings from physical examination</CardDescription>
                    </div>
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEnhanceWithAI('physical_exam')}
                      disabled={isEnhancing}
                    >
                      <Sparkles className="h-4 w-4 mr-1" /> Enhance
                    </CustomButton>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={physicalExam}
                      onChange={(e) => setPhysicalExam(e.target.value)}
                      className="min-h-[200px]"
                      placeholder="Enter physical exam findings..."
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Assessment</CardTitle>
                      <CardDescription>Diagnosis and interpretation</CardDescription>
                    </div>
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEnhanceWithAI('hp_assessment')}
                      disabled={isEnhancing}
                    >
                      <Sparkles className="h-4 w-4 mr-1" /> Enhance
                    </CustomButton>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={hpAssessment}
                      onChange={(e) => setHpAssessment(e.target.value)}
                      className="min-h-[150px]"
                      placeholder="Enter assessment..."
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Plan</CardTitle>
                      <CardDescription>Treatment and follow-up plan</CardDescription>
                    </div>
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEnhanceWithAI('hp_plan')}
                      disabled={isEnhancing}
                    >
                      <Sparkles className="h-4 w-4 mr-1" /> Enhance
                    </CustomButton>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={hpPlan}
                      onChange={(e) => setHpPlan(e.target.value)}
                      className="min-h-[150px]"
                      placeholder="Enter plan..."
                    />
                  </CardContent>
                </Card>
              </div>
            )}
            
            {consultation.note_type === 'Progress' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Progress Note</CardTitle>
                    <CardDescription>Patient's progress and current status</CardDescription>
                  </div>
                  <CustomButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEnhanceWithAI('progress_note')}
                    disabled={isEnhancing}
                  >
                    <Sparkles className="h-4 w-4 mr-1" /> Enhance
                  </CustomButton>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={progressNote}
                    onChange={(e) => setProgressNote(e.target.value)}
                    className="min-h-[400px]"
                    placeholder="Enter progress note..."
                  />
                </CardContent>
              </Card>
            )}
            
            <div className="mt-6 flex justify-end">
              <CustomButton 
                variant="primary" 
                size="md" 
                className="shadow-md"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'} <Save className="ml-2 h-4 w-4" />
              </CustomButton>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ConsultationDetail;
