
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CustomButton } from "@/components/ui/CustomButton";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProgressNoteProps {
  noteContent: string;
  setNoteContent: (content: string) => void;
  enhanceWithAI: () => Promise<void>;
  isGeneratingWithAI: boolean;
}

export function ProgressNote({ 
  noteContent, 
  setNoteContent, 
  enhanceWithAI,
  isGeneratingWithAI 
}: ProgressNoteProps) {
  const { toast } = useToast();
  
  const [content, setContent] = useState('');

  // Parse noteContent
  useEffect(() => {
    if (noteContent) {
      try {
        // Try to parse as JSON if it's a formatted progress note
        const parsed = JSON.parse(noteContent);
        if (parsed.progress_note) {
          setContent(parsed.progress_note);
          return;
        }
      } catch (e) {
        // If not JSON or doesn't have the right structure, use as is
        setContent(noteContent);
      }
    }
  }, [noteContent]);

  const updateContent = (newContent: string) => {
    setContent(newContent);
    
    // Update the combined note content
    setNoteContent(JSON.stringify({ progress_note: newContent }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progress Note</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="Enter progress notes here..."
            className="min-h-[200px]"
          />

          <div className="flex justify-end mt-4">
            <CustomButton
              type="button"
              variant="secondary"
              size="sm"
              disabled={isGeneratingWithAI}
              onClick={enhanceWithAI}
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
        </CardContent>
      </Card>
    </div>
  );
}
