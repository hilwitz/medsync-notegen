
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomButton } from "@/components/ui/CustomButton";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HPNoteProps {
  noteContent: string;
  setNoteContent: (content: string) => void;
  enhanceWithAI: () => Promise<void>;
  isGeneratingWithAI: boolean;
}

export function HPNote({ 
  noteContent, 
  setNoteContent, 
  enhanceWithAI,
  isGeneratingWithAI 
}: HPNoteProps) {
  const [activeSection, setActiveSection] = useState<'history' | 'physical_exam' | 'assessment' | 'plan'>('history');
  const { toast } = useToast();
  
  const [sections, setSections] = useState({
    history: '',
    physical_exam: '',
    assessment: '',
    plan: ''
  });

  // Parse noteContent into sections if it contains data
  useState(() => {
    if (noteContent) {
      try {
        // Try to parse as JSON if it's a formatted H&P note
        const parsed = JSON.parse(noteContent);
        if (parsed.history || parsed.physical_exam || parsed.assessment || parsed.plan) {
          setSections({
            history: parsed.history || '',
            physical_exam: parsed.physical_exam || '',
            assessment: parsed.assessment || '',
            plan: parsed.plan || ''
          });
          return;
        }
      } catch (e) {
        // If not JSON or doesn't have the right structure, use as history
        setSections(prev => ({...prev, history: noteContent}));
      }
    }
  });

  const updateSection = (section: 'history' | 'physical_exam' | 'assessment' | 'plan', content: string) => {
    const newSections = {...sections, [section]: content};
    setSections(newSections);
    
    // Update the combined note content
    setNoteContent(JSON.stringify(newSections));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <CustomButton 
          variant={activeSection === 'history' ? 'primary' : 'outline'} 
          size="sm" 
          onClick={() => setActiveSection('history')}
        >
          History
        </CustomButton>
        <CustomButton 
          variant={activeSection === 'physical_exam' ? 'primary' : 'outline'} 
          size="sm" 
          onClick={() => setActiveSection('physical_exam')}
        >
          Physical Exam
        </CustomButton>
        <CustomButton 
          variant={activeSection === 'assessment' ? 'primary' : 'outline'} 
          size="sm" 
          onClick={() => setActiveSection('assessment')}
        >
          Assessment
        </CustomButton>
        <CustomButton 
          variant={activeSection === 'plan' ? 'primary' : 'outline'} 
          size="sm" 
          onClick={() => setActiveSection('plan')}
        >
          Plan
        </CustomButton>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg capitalize">{activeSection.replace('_', ' ')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={sections[activeSection]}
            onChange={(e) => updateSection(activeSection, e.target.value)}
            placeholder={`Enter ${activeSection.replace('_', ' ')} notes here...`}
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
