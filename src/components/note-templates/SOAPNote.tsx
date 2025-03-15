
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomButton } from '@/components/ui/CustomButton';
import { Wand2 } from 'lucide-react';

export interface SOAPNoteProps {
  noteContent: string;
  setNoteContent: (content: string) => void;
  onWriteWithAI?: () => void;
  isGeneratingWithAI?: boolean;
}

const SOAPNote = ({ noteContent, setNoteContent, onWriteWithAI, isGeneratingWithAI }: SOAPNoteProps) => {
  // Function to update the note without affecting other sections
  const updateSection = (section: string, newContent: string) => {
    const sections = {
      subjective: getSection('subjective'),
      objective: getSection('objective'),
      assessment: getSection('assessment'),
      plan: getSection('plan')
    };
    
    sections[section as keyof typeof sections] = newContent;
    
    const newNote = `
# SOAP Note

## Subjective
${sections.subjective}

## Objective
${sections.objective}

## Assessment
${sections.assessment}

## Plan
${sections.plan}
`.trim();
    
    setNoteContent(newNote);
  };
  
  // Function to extract a specific section from the note
  const getSection = (section: string): string => {
    const regex = new RegExp(`## ${section.charAt(0).toUpperCase() + section.slice(1)}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    const match = noteContent.match(regex);
    return match ? match[1].trim() : '';
  };
  
  // Initialize with a template if empty
  if (!noteContent) {
    const template = `
# SOAP Note

## Subjective
Patient reports:

## Objective
Vitals:
Examination:

## Assessment
Diagnosis:

## Plan
Treatment:
Medications:
Follow-up:
    `.trim();
    setNoteContent(template);
  }
  
  return (
    <div className="space-y-4">
      {onWriteWithAI && (
        <div className="flex justify-end mb-2">
          <CustomButton
            variant="secondary"
            size="sm"
            onClick={onWriteWithAI}
            disabled={isGeneratingWithAI}
            className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            {isGeneratingWithAI ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                <span>Write with AI</span>
              </>
            )}
          </CustomButton>
        </div>
      )}
      
      <Tabs defaultValue="subjective" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="subjective">Subjective</TabsTrigger>
          <TabsTrigger value="objective">Objective</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subjective">
          <Textarea
            value={getSection('subjective')}
            onChange={(e) => updateSection('subjective', e.target.value)}
            placeholder="Document patient's history, complaints, and symptoms..."
            className="min-h-[300px] p-4 font-mono"
          />
        </TabsContent>
        
        <TabsContent value="objective">
          <Textarea
            value={getSection('objective')}
            onChange={(e) => updateSection('objective', e.target.value)}
            placeholder="Document physical examination findings, vital signs, and test results..."
            className="min-h-[300px] p-4 font-mono"
          />
        </TabsContent>
        
        <TabsContent value="assessment">
          <Textarea
            value={getSection('assessment')}
            onChange={(e) => updateSection('assessment', e.target.value)}
            placeholder="Document diagnoses, interpretations, and clinical impressions..."
            className="min-h-[300px] p-4 font-mono"
          />
        </TabsContent>
        
        <TabsContent value="plan">
          <Textarea
            value={getSection('plan')}
            onChange={(e) => updateSection('plan', e.target.value)}
            placeholder="Document treatment plans, medications, and follow-up instructions..."
            className="min-h-[300px] p-4 font-mono"
          />
        </TabsContent>
      </Tabs>
      
      <div className="mt-4">
        <details>
          <summary className="cursor-pointer text-sm text-neutral-500 dark:text-neutral-400">
            Preview Full Note
          </summary>
          <div className="mt-2 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 whitespace-pre-wrap font-mono text-sm">
            {noteContent}
          </div>
        </details>
      </div>
    </div>
  );
};

export default SOAPNote;
