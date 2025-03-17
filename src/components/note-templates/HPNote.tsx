
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export interface HPNoteProps {
  noteContent: string;
  setNoteContent: (content: string) => void;
  readOnly?: boolean;
}

const HPNote = ({ noteContent, setNoteContent, readOnly = false }: HPNoteProps) => {
  // Parse the note content as JSON or create default structure
  const parsedContent = (() => {
    try {
      return JSON.parse(noteContent || '{}');
    } catch (e) {
      return {
        history: '',
        physical_exam: '',
        assessment: '',
        plan: ''
      };
    }
  })();
  
  const handleContentChange = (field: string, value: string) => {
    if (readOnly) return;
    
    const updatedContent = {
      ...parsedContent,
      [field]: value
    };
    
    setNoteContent(JSON.stringify(updatedContent));
  };
  
  return (
    <div className="space-y-4">
      <Card className="border-blue-100 dark:border-blue-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">History</CardTitle>
          <CardDescription>Document patient's history</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Document history of present illness, past medical history, medications, allergies, family history, social history, etc."
            className="min-h-[150px]"
            value={parsedContent.history || ''}
            onChange={(e) => handleContentChange('history', e.target.value)}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>
      
      <Card className="border-blue-100 dark:border-blue-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Physical Examination</CardTitle>
          <CardDescription>Document physical exam findings</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Document physical examination findings, vital signs, etc."
            className="min-h-[150px]"
            value={parsedContent.physical_exam || ''}
            onChange={(e) => handleContentChange('physical_exam', e.target.value)}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>
      
      <Card className="border-blue-100 dark:border-blue-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Assessment</CardTitle>
          <CardDescription>Document clinical assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Document diagnosis, differential diagnoses, clinical impressions, etc."
            className="min-h-[120px]"
            value={parsedContent.assessment || ''}
            onChange={(e) => handleContentChange('assessment', e.target.value)}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>
      
      <Card className="border-blue-100 dark:border-blue-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Plan</CardTitle>
          <CardDescription>Document treatment plan</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Document treatment plan, medications, follow-up recommendations, etc."
            className="min-h-[120px]"
            value={parsedContent.plan || ''}
            onChange={(e) => handleContentChange('plan', e.target.value)}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HPNote;
