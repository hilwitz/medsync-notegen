
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomButton } from "@/components/ui/CustomButton";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SOAPNoteProps {
  noteContent: string;
  setNoteContent: (content: string) => void;
  enhanceWithAI: () => Promise<void>;
  isGeneratingWithAI: boolean;
}

export function SOAPNote({ 
  noteContent, 
  setNoteContent, 
  enhanceWithAI,
  isGeneratingWithAI 
}: SOAPNoteProps) {
  const [activeSection, setActiveSection] = useState<'subjective' | 'objective' | 'assessment' | 'plan'>('subjective');
  const { toast } = useToast();
  
  const [sections, setSections] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  // Parse noteContent into sections if it contains data
  useState(() => {
    if (noteContent) {
      try {
        // Try to parse as JSON if it's a formatted SOAP note
        const parsed = JSON.parse(noteContent);
        if (parsed.subjective || parsed.objective || parsed.assessment || parsed.plan) {
          setSections({
            subjective: parsed.subjective || '',
            objective: parsed.objective || '',
            assessment: parsed.assessment || '',
            plan: parsed.plan || ''
          });
          return;
        }
      } catch (e) {
        // If not JSON or doesn't have the right structure, use as subjective
        setSections(prev => ({...prev, subjective: noteContent}));
      }
    }
  });

  const updateSection = (section: 'subjective' | 'objective' | 'assessment' | 'plan', content: string) => {
    const newSections = {...sections, [section]: content};
    setSections(newSections);
    
    // Update the combined note content
    setNoteContent(JSON.stringify(newSections));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <CustomButton 
          variant={activeSection === 'subjective' ? 'primary' : 'outline'} 
          size="sm" 
          onClick={() => setActiveSection('subjective')}
        >
          Subjective
        </CustomButton>
        <CustomButton 
          variant={activeSection === 'objective' ? 'primary' : 'outline'} 
          size="sm" 
          onClick={() => setActiveSection('objective')}
        >
          Objective
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
          <CardTitle className="text-lg capitalize">{activeSection}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={sections[activeSection]}
            onChange={(e) => updateSection(activeSection, e.target.value)}
            placeholder={`Enter ${activeSection} notes here...`}
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
