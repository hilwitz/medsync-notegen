
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CustomButton } from "@/components/ui/CustomButton";
import { Brain, FileText } from 'lucide-react';

interface ProgressNoteProps {
  noteContent: string;
  setNoteContent: (content: string) => void;
  enhanceWithAI?: (content: string) => void;
  isGeneratingWithAI?: boolean;
}

export const ProgressNote = ({ 
  noteContent = '', 
  setNoteContent,
  enhanceWithAI,
  isGeneratingWithAI = false
}: ProgressNoteProps) => {
  // Parse the note content as JSON or create default structure
  const parsedContent = (() => {
    try {
      return JSON.parse(noteContent);
    } catch (e) {
      return {
        progress_note: ''
      };
    }
  })();
  
  const handleContentChange = (value: string) => {
    const updatedContent = {
      progress_note: value
    };
    
    setNoteContent(JSON.stringify(updatedContent));
  };
  
  return (
    <Card className="shadow-md border-blue-100 dark:border-blue-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Progress Note
        </CardTitle>
        <CardDescription>
          Document the patient's progress and current status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Enter progress note including current status, interval history, changes in treatment plan, response to treatment, and any new findings..."
          className="min-h-[400px] border-blue-200 focus:border-blue-400"
          value={parsedContent.progress_note}
          onChange={(e) => handleContentChange(e.target.value)}
        />
      </CardContent>
    </Card>
  );
};
