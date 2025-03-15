
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { SidebarOpener } from '@/components/SidebarOpener';
import { supabase } from '@/integrations/supabase/client';
import { CustomButton } from '@/components/ui/CustomButton';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Keyboard, ArrowRight, Sparkles, FileText, PenLine, Brain } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SOAPNote } from '@/components/note-templates/SOAPNote';
import { HPNote } from '@/components/note-templates/HPNote';
import { ProgressNote } from '@/components/note-templates/ProgressNote';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const NewConsultation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'select-type' | 'create'>('select-type');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [patientFirstName, setPatientFirstName] = useState('');
  const [patientLastName, setPatientLastName] = useState('');
  const [noteType, setNoteType] = useState('SOAP');
  const [inputMethod, setInputMethod] = useState<'text' | 'voice'>('text');
  const [noteContent, setNoteContent] = useState('');
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [quickPrompt, setQuickPrompt] = useState('');
  const [isUsingAI, setIsUsingAI] = useState(false);
  
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
      let contentObj: any = {};
      
      if (noteType === 'SOAP') {
        try {
          contentObj = JSON.parse(noteContent);
        } catch (e) {
          contentObj = {
            subjective: noteContent,
            objective: '',
            assessment: '',
            plan: ''
          };
        }
      } else if (noteType === 'H&P') {
        try {
          contentObj = JSON.parse(noteContent);
        } catch (e) {
          contentObj = {
            history: noteContent,
            physical_exam: '',
            assessment: '',
            plan: ''
          };
        }
      } else {
        try {
          contentObj = JSON.parse(noteContent);
        } catch (e) {
          contentObj = {
            progress_note: noteContent
          };
        }
      }
      
      // Create new consultation
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          patient_id: patientId,
          note_type: noteType,
          status: 'scheduled',
          content: contentObj as Json,
          date: new Date().toISOString()
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

  const handleEnhanceWithAI = async () => {
    if (!noteContent.trim() && !quickPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to enhance",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingWithAI(true);
    
    try {
      const content = isUsingAI ? quickPrompt : noteContent;
      
      // Call our backend function instead of requiring user API key
      const { data, error } = await supabase.functions.invoke('enhance-medical-note', {
        body: { content, noteType }
      });
      
      if (error) throw new Error(error.message);
      
      if (data?.enhancedContent) {
        if (isUsingAI) {
          // For AI quick prompt, replace the entire content
          setNoteContent(data.enhancedContent);
          // Hide the AI prompt section after generating
          setIsUsingAI(false);
        } else {
          // For regular enhancement, just replace the current noteContent
          setNoteContent(data.enhancedContent);
        }
        
        toast({
          title: "Success!",
          description: "Content enhanced with AI",
        });
      } else {
        throw new Error("No content returned from AI service");
      }
    } catch (error) {
      console.error("AI enhancement error:", error);
      toast({
        title: "AI Enhancement Failed",
        description: error instanceof Error ? error.message : "Could not enhance content with AI",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingWithAI(false);
    }
  };
  
  // Voice recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const chunks: Blob[] = [];
      setAudioChunks(chunks);
      
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        // Convert to base64 to send to backend
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          
          if (base64Audio) {
            toast({
              title: "Processing",
              description: "Transcribing your recording...",
            });
            
            try {
              const { data, error } = await supabase.functions.invoke('transcribe-audio', {
                body: { audio: base64Audio }
              });
              
              if (error) throw new Error(error.message);
              
              if (data?.text) {
                setNoteContent(data.text);
              } else {
                throw new Error("No transcription returned");
              }
            } catch (error) {
              console.error("Transcription error:", error);
              toast({
                title: "Transcription Failed",
                description: error instanceof Error ? error.message : "Could not transcribe audio",
                variant: "destructive"
              });
            }
          }
        };
      };
      
      recorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone",
      });
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      if (audioStream) {
        audioStream.getAudioTracks().forEach(track => track.stop());
      }
      
      toast({
        title: "Recording Stopped",
        description: "Processing your audio...",
      });
    }
  };
  
  const renderNoteEditor = () => {
    if (isUsingAI) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Write with AI</CardTitle>
            <CardDescription>
              Provide a brief description of the patient's condition and we'll generate a complete {noteType === 'SOAP' ? 'SOAP note' : noteType === 'H&P' ? 'History & Physical' : 'Progress Note'} for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: 45-year-old male presenting with fever and cough for 3 days. Patient reports fatigue and mild shortness of breath."
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              className="min-h-[150px]"
            />
            
            <div className="flex justify-end space-x-2">
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => setIsUsingAI(false)}
              >
                Cancel
              </CustomButton>
              
              <CustomButton
                type="button"
                variant="primary"
                disabled={isGeneratingWithAI || !quickPrompt.trim()}
                onClick={handleEnhanceWithAI}
                className="flex items-center gap-2"
              >
                {isGeneratingWithAI ? (
                  <>
                    <div className="animate-pulse">Generating...</div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm rounded-md">
                      <div className="animate-spin h-8 w-8 border-4 border-medsync-600 border-t-transparent rounded-full"></div>
                    </div>
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Generate Complete Note
                  </>
                )}
              </CustomButton>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (inputMethod === 'voice') {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Record Your Note</CardTitle>
            <CardDescription>
              Click the microphone button and start speaking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <button
                type="button"
                className={`p-6 rounded-full transition-colors ${isRecording 
                  ? 'bg-red-100 hover:bg-red-200 text-red-600 animate-pulse' 
                  : 'bg-medsync-100 hover:bg-medsync-200 text-medsync-600'}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                <Mic className="h-8 w-8" />
              </button>
              <p className="text-neutral-500">
                {isRecording 
                  ? 'Recording... Click to stop' 
                  : 'Click to start recording'}
              </p>
              
              {noteContent && (
                <div className="w-full mt-4 p-4 border rounded-md bg-neutral-50 dark:bg-neutral-800/50">
                  <p className="text-sm font-medium mb-2">Transcription:</p>
                  <p>{noteContent}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Text input mode with different note templates
    switch (noteType) {
      case 'SOAP':
        return (
          <SOAPNote 
            noteContent={noteContent}
            setNoteContent={setNoteContent}
            enhanceWithAI={handleEnhanceWithAI}
            isGeneratingWithAI={isGeneratingWithAI}
          />
        );
      case 'H&P':
        return (
          <HPNote 
            noteContent={noteContent}
            setNoteContent={setNoteContent}
            enhanceWithAI={handleEnhanceWithAI}
            isGeneratingWithAI={isGeneratingWithAI}
          />
        );
      default:
        return (
          <ProgressNote 
            noteContent={noteContent}
            setNoteContent={setNoteContent}
            enhanceWithAI={handleEnhanceWithAI}
            isGeneratingWithAI={isGeneratingWithAI}
          />
        );
    }
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
            <h1 className="text-3xl font-bold mb-6 text-center">
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Create Note</CardTitle>
                  <CardDescription>
                    Choose your input method and create your note
                  </CardDescription>
                </div>
                
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Segmented control for input method */}
                  <SegmentedControl
                    value={inputMethod}
                    onValueChange={(value) => setInputMethod(value as 'text' | 'voice')}
                    options={[
                      { value: 'text', label: 'Type', icon: <Keyboard className="h-4 w-4" /> },
                      { value: 'voice', label: 'Voice', icon: <Mic className="h-4 w-4" /> }
                    ]}
                    className="min-w-52"
                  />
                  
                  {/* Write with AI Button - only show in text mode */}
                  {inputMethod === 'text' && !isUsingAI && (
                    <CustomButton
                      type="button"
                      variant="outline"
                      onClick={() => setIsUsingAI(true)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Brain className="h-4 w-4" />
                      Write with AI
                    </CustomButton>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderNoteEditor()}
              </CardContent>
            </Card>
            
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
                type="submit" 
                variant="primary"
                size="md"
                disabled={isLoading || !noteContent.trim()}
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
        <SidebarOpener />
        
        <SidebarInset className="bg-gradient-blue">
          <div className="container px-4 py-12">
            {renderStep()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default NewConsultation;
