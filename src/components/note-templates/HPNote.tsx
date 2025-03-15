
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CustomButton } from "@/components/ui/CustomButton";
import { Brain, Sparkles, FileText, PenLine, ActivityIcon } from 'lucide-react';

interface HPNoteProps {
  noteContent: string;
  setNoteContent: (content: string) => void;
  onWriteWithAI?: () => void;
  isGeneratingWithAI?: boolean;
}

export const HPNote = ({ 
  noteContent = '', 
  setNoteContent,
  onWriteWithAI,
  isGeneratingWithAI = false
}: HPNoteProps) => {
  const [activeTab, setActiveTab] = useState('history');
  
  // Parse the note content as JSON or create default structure
  const parsedContent = (() => {
    try {
      return JSON.parse(noteContent);
    } catch (e) {
      return {
        history: '',
        physical_exam: '',
        assessment: '',
        plan: ''
      };
    }
  })();
  
  const handleContentChange = (section: string, value: string) => {
    const updatedContent = {
      ...parsedContent,
      [section]: value
    };
    
    setNoteContent(JSON.stringify(updatedContent));
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="history" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-300">
            History
          </TabsTrigger>
          <TabsTrigger value="physical_exam" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-300">
            Physical Exam
          </TabsTrigger>
          <TabsTrigger value="assessment" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-300">
            Assessment
          </TabsTrigger>
          <TabsTrigger value="plan" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-300">
            Plan
          </TabsTrigger>
        </TabsList>
        
        <Card className="shadow-md border-blue-100 dark:border-blue-900/50">
          <TabsContent value="history" className="m-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                History
              </CardTitle>
              <CardDescription>
                Patient's medical history and background
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter history information including chief complaint, HPI, past medical history, family history, social history, review of systems..."
                className="min-h-[300px] border-blue-200 focus:border-blue-400"
                value={parsedContent.history}
                onChange={(e) => handleContentChange('history', e.target.value)}
              />
            </CardContent>
          </TabsContent>
          
          <TabsContent value="physical_exam" className="m-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ActivityIcon className="h-5 w-5 text-blue-600" />
                Physical Examination
              </CardTitle>
              <CardDescription>
                Comprehensive physical examination findings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter physical examination findings including vitals, general appearance, and systematic examination by body system..."
                className="min-h-[300px] border-blue-200 focus:border-blue-400"
                value={parsedContent.physical_exam}
                onChange={(e) => handleContentChange('physical_exam', e.target.value)}
              />
            </CardContent>
          </TabsContent>
          
          <TabsContent value="assessment" className="m-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Assessment
              </CardTitle>
              <CardDescription>
                Diagnoses and clinical impressions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter assessment information such as diagnoses, differential diagnoses, clinical impressions..."
                className="min-h-[300px] border-blue-200 focus:border-blue-400"
                value={parsedContent.assessment}
                onChange={(e) => handleContentChange('assessment', e.target.value)}
              />
            </CardContent>
          </TabsContent>
          
          <TabsContent value="plan" className="m-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Plan
              </CardTitle>
              <CardDescription>
                Treatment plan and follow-up instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter plan information such as medications, treatments, follow-up instructions..."
                className="min-h-[300px] border-blue-200 focus:border-blue-400"
                value={parsedContent.plan}
                onChange={(e) => handleContentChange('plan', e.target.value)}
              />
            </CardContent>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
};
