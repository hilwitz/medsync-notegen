
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
import { 
  Mic, 
  Keyboard, 
  ArrowRight, 
  FileText, 
  Brain 
} from 'lucide-react';
import { Json } from '@/integrations/supabase/types';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SOAPNote } from '@/components/note-templates/SOAPNote';
import { HPNote } from '@/components/note-templates/HPNote';
import { ProgressNote } from '@/components/note-templates/ProgressNote';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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
  const [status, setStatus] = useState('scheduled');
  
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
          status: status,
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

  const handleWriteWithAI = async () => {
    if (!quickPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for AI to generate from",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingWithAI(true);
    
    try {
      // Call the Gemini API via Supabase edge function
      const { data, error } = await supabase.functions.invoke('generate-with-gemini', {
        body: { 
          prompt: quickPrompt,
          noteType: noteType 
        }
      });
      
      if (error) throw new Error(error.message);
      
      if (data?.generatedContent) {
        setNoteContent(data.generatedContent);
        setIsUsingAI(false);
        
        toast({
          title: "Success!",
          description: "Content generated with AI",
        });
      } else {
        throw new Error("No content returned from AI service");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast({
        title: "AI Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate content with AI",
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
        <Card className="shadow-md border-blue-100 dark:border-blue-900/50">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400">Write with AI</CardTitle>
            <CardDescription>
              Provide a brief description of the patient's condition and we'll generate a complete {noteType === 'SOAP' ? 'SOAP note' : noteType === 'H&P' ? 'History & Physical' : 'Progress Note'} for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: 45-year-old male presenting with fever and cough for 3 days. Patient reports fatigue and mild shortness of breath."
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              className="min-h-[150px] border-blue-200 focus:border-blue-400"
            />
            
            <div className="flex justify-end space-x-2">
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => setIsUsingAI(false)}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Cancel
              </CustomButton>
              
              <CustomButton
                type="button"
                variant="primary"
                disabled={isGeneratingWithAI || !quickPrompt.trim()}
                onClick={handleWriteWithAI}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingWithAI ? (
                  <>
                    <div className="animate-pulse">Generating...</div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm rounded-md">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
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
        <Card className="shadow-md border-blue-100 dark:border-blue-900/50">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400">Record Your Note</CardTitle>
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
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-600'}`}
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
                <div className="w-full mt-4 p-4 border rounded-md bg-neutral-50 dark:bg-neutral-800/50 border-blue-100 dark:border-blue-900/50">
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
            onWriteWithAI={() => setIsUsingAI(true)}
            isGeneratingWithAI={isGeneratingWithAI}
          />
        );
      case 'H&P':
        return (
          <HPNote 
            noteContent={noteContent}
            setNoteContent={setNoteContent}
            onWriteWithAI={() => setIsUsingAI(true)}
            isGeneratingWithAI={isGeneratingWithAI}
          />
        );
      default:
        return (
          <ProgressNote 
            noteContent={noteContent}
            setNoteContent={setNoteContent}
            onWriteWithAI={() => setIsUsingAI(true)}
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
            <h1 className="text-3xl font-bold mb-8 text-center text-blue-800 dark:text-blue-300">New Consultation</h1>
            
            <Card className="shadow-md border-blue-100 dark:border-blue-900/50">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-400">Select Note Type</CardTitle>
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
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border-blue-200 dark:border-blue-800/50">
                    <RadioGroupItem value="SOAP" id="SOAP" className="text-blue-600" />
                    <Label htmlFor="SOAP" className="cursor-pointer font-medium">SOAP Note</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border-blue-200 dark:border-blue-800/50">
                    <RadioGroupItem value="H&P" id="HP" className="text-blue-600" />
                    <Label htmlFor="HP" className="cursor-pointer font-medium">History & Physical</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border-blue-200 dark:border-blue-800/50">
                    <RadioGroupItem value="Progress" id="Progress" className="text-blue-600" />
                    <Label htmlFor="Progress" className="cursor-pointer font-medium">Progress Note</Label>
                  </div>
                </RadioGroup>
                
                <div className="flex justify-end">
                  <CustomButton 
                    type="button" 
                    variant="primary"
                    size="md"
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
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
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-800 dark:text-blue-300">
              {noteType === 'SOAP' ? 'SOAP Note' : 
               noteType === 'H&P' ? 'History & Physical' : 'Progress Note'}
            </h1>
            
            <Card className="shadow-md border-blue-100 dark:border-blue-900/50">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-400">Patient Information</CardTitle>
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
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 border-blue-200"
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
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 border-blue-200"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="status">Consultation Status</Label>
                  <Select
                    value={status}
                    onValueChange={setStatus}
                  >
                    <SelectTrigger className="w-full border-blue-200 focus:ring-blue-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md border-blue-100 dark:border-blue-900/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-blue-700 dark:text-blue-400">Create Note</CardTitle>
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
                      className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
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
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Back
              </CustomButton>
              
              <CustomButton
                type="submit" 
                variant="primary"
                size="md"
                disabled={isLoading || !noteContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
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
        
        <SidebarInset className="bg-gradient-to-br from-blue-50 to-sky-100 dark:from-gray-900 dark:to-blue-950">
          <div className="container px-4 py-12">
            {renderStep()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default NewConsultation;
