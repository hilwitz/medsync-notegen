
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CustomButton } from "@/components/ui/CustomButton";
import { Brain, Sparkles, FileText, PenLine } from 'lucide-react';

interface SOAPNoteProps {
  noteContent: string;
  setNoteContent: (content: string) => void;
  enhanceWithAI?: (content: string) => void;
  isGeneratingWithAI?: boolean;
}

export const SOAPNote = ({ 
  noteContent = '', 
  setNoteContent,
  enhanceWithAI,
  isGeneratingWithAI = false
}: SOAPNoteProps) => {
  const [activeTab, setActiveTab] = useState('subjective');
  
  // Parse the note content as JSON or create default structure
  const parsedContent = (() => {
    try {
      return JSON.parse(noteContent);
    } catch (e) {
      return {
        subjective: '',
        objective: '',
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
          <TabsTrigger value="subjective" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-300">
            Subjective
          </TabsTrigger>
          <TabsTrigger value="objective" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-300">
            Objective
          </TabsTrigger>
          <TabsTrigger value="assessment" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-300">
            Assessment
          </TabsTrigger>
          <TabsTrigger value="plan" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-300">
            Plan
          </TabsTrigger>
        </TabsList>
        
        <Card className="shadow-md border-blue-100 dark:border-blue-900/50">
          <TabsContent value="subjective" className="m-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Subjective
              </CardTitle>
              <CardDescription>
                Patient's chief complaint and history of present illness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter subjective information such as chief complaint, history of present illness, review of systems..."
                className="min-h-[300px] border-blue-200 focus:border-blue-400"
                value={parsedContent.subjective}
                onChange={(e) => handleContentChange('subjective', e.target.value)}
              />
            </CardContent>
          </TabsContent>
          
          <TabsContent value="objective" className="m-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <PenLine className="h-5 w-5 text-blue-600" />
                Objective
              </CardTitle>
              <CardDescription>
                Physical examination findings and test results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter objective information such as vital signs, physical examination findings, lab results..."
                className="min-h-[300px] border-blue-200 focus:border-blue-400"
                value={parsedContent.objective}
                onChange={(e) => handleContentChange('objective', e.target.value)}
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
