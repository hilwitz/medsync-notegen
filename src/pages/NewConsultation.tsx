
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { supabase } from '@/integrations/supabase/client';
import { CustomButton } from '@/components/ui/CustomButton';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Keyboard, ArrowRight, Sparkles } from 'lucide-react';

const NewConsultation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'select-type' | 'input-method' | 'create'>('select-type');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [patientFirstName, setPatientFirstName] = useState('');
  const [patientLastName, setPatientLastName] = useState('');
  const [noteType, setNoteType] = useState('SOAP');
  const [inputMethod, setInputMethod] = useState<'text' | 'voice'>('text');
  const [noteContent, setNoteContent] = useState('');
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a consultation",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }
      
      // First create or retrieve patient
      const { data: existingPatients, error: searchError } = await supabase
        .from('patients')
        .select()
        .eq('user_id', user.id)
        .eq('first_name', patientFirstName)
        .eq('last_name', patientLastName);
      
      if (searchError) {
        throw searchError;
      }
      
      let patientId;
      
      if (existingPatients && existingPatients.length > 0) {
        // Use existing patient
        patientId = existingPatients[0].id;
      } else {
        // Create new patient
        const { data: newPatient, error: insertError } = await supabase
          .from('patients')
          .insert({
            user_id: user.id,
            first_name: patientFirstName,
            last_name: patientLastName
          })
          .select()
          .single();
        
        if (insertError) {
          throw insertError;
        }
        
        patientId = newPatient.id;
      }
      
      // Create content object based on note type
      let contentObj = {};
      
      if (noteType === 'SOAP') {
        contentObj = {
          subjective: noteContent,
          objective: '',
          assessment: '',
          plan: ''
        };
      } else if (noteType === 'H&P') {
        contentObj = {
          history: noteContent,
          physical_exam: '',
          assessment: '',
          plan: ''
        };
      } else {
        contentObj = {
          progress_note: noteContent
        };
      }
      
      // Create new consultation
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          patient_id: patientId,
          note_type: noteType,
          status: 'in_progress',
          content: contentObj
        })
        .select()
        .single();
      
      if (consultationError) {
        throw consultationError;
      }
      
      toast({
        title: "Success!",
        description: "New consultation created",
      });
      
      // Navigate to consultation detail/edit page
      navigate(`/consultations/${consultation.id}`);
      
    } catch (error) {
      console.error('Error creating consultation:', error);
      toast({
        title: "Error",
        description: "Failed to create new consultation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhanceWithAI = () => {
    if (!noteContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to enhance",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingWithAI(true);
    
    // Simulate AI enhancement (replace with actual API call in production)
    setTimeout(() => {
      const enhancedContent = `Based on the patient's presentation, I've documented the following:\n\n${noteContent}\n\nAdditional clinical observations include normal vital signs with BP 120/80, HR 72, RR 16, Temp 98.6°F. Patient appears well-nourished and in no acute distress.`;
      setNoteContent(enhancedContent);
      setIsGeneratingWithAI(false);
      
      toast({
        title: "Success!",
        description: "Content enhanced with AI",
      });
    }, 2500);
  };
  
  const renderStep = () => {
    switch (step) {
      case 'select-type':
        return (
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">New Consultation</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Select Note Type</CardTitle>
                <CardDescription>
                  Choose the type of note you want to create
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup 
                  defaultValue="SOAP" 
                  value={noteType}
                  onValueChange={setNoteType}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer">
                    <RadioGroupItem value="SOAP" id="SOAP" />
                    <Label htmlFor="SOAP" className="cursor-pointer font-medium">SOAP Note</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer">
                    <RadioGroupItem value="H&P" id="HP" />
                    <Label htmlFor="HP" className="cursor-pointer font-medium">History & Physical</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer">
                    <RadioGroupItem value="Progress" id="Progress" />
                    <Label htmlFor="Progress" className="cursor-pointer font-medium">Progress Note</Label>
                  </div>
                </RadioGroup>
                
                <div className="flex justify-end">
                  <CustomButton 
                    type="button" 
                    variant="primary"
                    size="md"
                    className="mt-4"
                    onClick={() => setStep('input-method')}
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </CustomButton>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'input-method':
        return (
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Input Method</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>How would you like to create your note?</CardTitle>
                <CardDescription>
                  Choose your preferred input method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div 
                    className={`flex flex-col items-center justify-center p-6 border rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-all ${inputMethod === 'text' ? 'ring-2 ring-medsync-500 bg-neutral-50 dark:bg-neutral-800/50' : ''}`}
                    onClick={() => setInputMethod('text')}
                  >
                    <Keyboard className="h-12 w-12 text-medsync-600 mb-3" />
                    <span className="text-sm font-medium">Type</span>
                  </div>
                  
                  <div 
                    className={`flex flex-col items-center justify-center p-6 border rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-all ${inputMethod === 'voice' ? 'ring-2 ring-medsync-500 bg-neutral-50 dark:bg-neutral-800/50' : ''}`}
                    onClick={() => setInputMethod('voice')}
                  >
                    <Mic className="h-12 w-12 text-medsync-600 mb-3" />
                    <span className="text-sm font-medium">Voice</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <CustomButton 
                    type="button" 
                    variant="outline"
                    size="md"
                    onClick={() => setStep('select-type')}
                  >
                    Back
                  </CustomButton>
                  
                  <CustomButton 
                    type="button" 
                    variant="primary"
                    size="md"
                    onClick={() => setStep('create')}
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </CustomButton>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'create':
        return (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">
              {noteType === 'SOAP' ? 'SOAP Note' : 
               noteType === 'H&P' ? 'History & Physical' : 'Progress Note'}
            </h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <input
                      id="firstName"
                      type="text"
                      value={patientFirstName}
                      onChange={(e) => setPatientFirstName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-medsync-500 dark:bg-neutral-700 dark:border-neutral-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <input
                      id="lastName"
                      type="text"
                      value={patientLastName}
                      onChange={(e) => setPatientLastName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-medsync-500 dark:bg-neutral-700 dark:border-neutral-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{inputMethod === 'text' ? 'Type Your Note' : 'Record Your Note'}</CardTitle>
                <CardDescription>
                  {inputMethod === 'text' 
                    ? 'Type your clinical notes below' 
                    : 'Click the microphone button and start speaking'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inputMethod === 'text' ? (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Enter your clinical notes here..."
                      className="min-h-[200px]"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                    />
                    
                    <div className="flex justify-end">
                      <CustomButton
                        type="button"
                        variant="secondary"
                        size="md"
                        disabled={isGeneratingWithAI}
                        onClick={handleEnhanceWithAI}
                        className="flex items-center gap-2"
                      >
                        {isGeneratingWithAI ? (
                          <>
                            <div className="animate-pulse">Enhancing...</div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm rounded-md">
                              <div className="animate-spin h-8 w-8 border-4 border-medsync-600 border-t-transparent rounded-full"></div>
                            </div>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Enhance with AI
                          </>
                        )}
                      </CustomButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <button
                      type="button"
                      className="p-6 rounded-full bg-medsync-100 hover:bg-medsync-200 transition-colors"
                    >
                      <Mic className="h-8 w-8 text-medsync-600" />
                    </button>
                    <p className="text-neutral-500">Click to start recording</p>
                    
                    {noteContent && (
                      <div className="w-full mt-4 p-4 border rounded-md bg-neutral-50 dark:bg-neutral-800/50">
                        <p className="text-sm font-medium mb-2">Transcription:</p>
                        <p>{noteContent}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <CustomButton
                type="button"
                variant="outline"
                size="md"
                onClick={() => setStep('input-method')}
              >
                Back
              </CustomButton>
              
              <CustomButton
                type="submit" 
                variant="primary"
                size="md"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Consultation"}
              </CustomButton>
            </div>
          </form>
        );
    }
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        
        <SidebarInset className="bg-neutral-50 dark:bg-neutral-900">
          <div className="container px-4 py-12">
            {renderStep()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default NewConsultation;
