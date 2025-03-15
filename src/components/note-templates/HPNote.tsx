
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomButton } from '@/components/ui/CustomButton';
import { Wand2 } from 'lucide-react';

export interface HPNoteProps {
  noteContent: string;
  setNoteContent: (content: string) => void;
  onWriteWithAI?: () => void;
  isGeneratingWithAI?: boolean;
}

const HPNote = ({ noteContent, setNoteContent, onWriteWithAI, isGeneratingWithAI }: HPNoteProps) => {
  // Function to update the note without affecting other sections
  const updateSection = (section: string, newContent: string) => {
    const sections = {
      chiefComplaint: getSection('Chief Complaint'),
      hpi: getSection('History of Present Illness'),
      pmh: getSection('Past Medical History'),
      medications: getSection('Medications'),
      allergies: getSection('Allergies'),
      familyHistory: getSection('Family History'),
      socialHistory: getSection('Social History'),
      ros: getSection('Review of Systems'),
      physicalExam: getSection('Physical Examination'),
      assessment: getSection('Assessment and Plan')
    };
    
    sections[section as keyof typeof sections] = newContent;
    
    const newNote = `
# History and Physical

## Chief Complaint
${sections.chiefComplaint}

## History of Present Illness
${sections.hpi}

## Past Medical History
${sections.pmh}

## Medications
${sections.medications}

## Allergies
${sections.allergies}

## Family History
${sections.familyHistory}

## Social History
${sections.socialHistory}

## Review of Systems
${sections.ros}

## Physical Examination
${sections.physicalExam}

## Assessment and Plan
${sections.assessment}
`.trim();
    
    setNoteContent(newNote);
  };
  
  // Function to extract a specific section from the note
  const getSection = (section: string): string => {
    const regex = new RegExp(`## ${section}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    const match = noteContent.match(regex);
    return match ? match[1].trim() : '';
  };
  
  // Initialize with a template if empty
  if (!noteContent) {
    const template = `
# History and Physical

## Chief Complaint

## History of Present Illness

## Past Medical History

## Medications

## Allergies

## Family History

## Social History

## Review of Systems

## Physical Examination

## Assessment and Plan

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
      
      <Tabs defaultValue="cc" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="cc">CC</TabsTrigger>
          <TabsTrigger value="hpi">HPI</TabsTrigger>
          <TabsTrigger value="pmh">PMH</TabsTrigger>
          <TabsTrigger value="exam">Exam</TabsTrigger>
          <TabsTrigger value="assessment">A/P</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cc">
          <Textarea
            value={getSection('Chief Complaint')}
            onChange={(e) => updateSection('chiefComplaint', e.target.value)}
            placeholder="Document the patient's chief complaint..."
            className="min-h-[300px] p-4 font-mono"
          />
        </TabsContent>
        
        <TabsContent value="hpi">
          <Textarea
            value={getSection('History of Present Illness')}
            onChange={(e) => updateSection('hpi', e.target.value)}
            placeholder="Document the history of present illness..."
            className="min-h-[300px] p-4 font-mono"
          />
        </TabsContent>
        
        <TabsContent value="pmh">
          <div className="space-y-4">
            <h4>Past Medical History</h4>
            <Textarea
              value={getSection('Past Medical History')}
              onChange={(e) => updateSection('pmh', e.target.value)}
              placeholder="Document past medical history..."
              className="min-h-[150px] p-4 font-mono"
            />
            
            <h4>Medications</h4>
            <Textarea
              value={getSection('Medications')}
              onChange={(e) => updateSection('medications', e.target.value)}
              placeholder="Document current medications..."
              className="min-h-[100px] p-4 font-mono"
            />
            
            <h4>Allergies</h4>
            <Textarea
              value={getSection('Allergies')}
              onChange={(e) => updateSection('allergies', e.target.value)}
              placeholder="Document allergies..."
              className="min-h-[80px] p-4 font-mono"
            />
            
            <h4>Family History</h4>
            <Textarea
              value={getSection('Family History')}
              onChange={(e) => updateSection('familyHistory', e.target.value)}
              placeholder="Document family history..."
              className="min-h-[80px] p-4 font-mono"
            />
            
            <h4>Social History</h4>
            <Textarea
              value={getSection('Social History')}
              onChange={(e) => updateSection('socialHistory', e.target.value)}
              placeholder="Document social history..."
              className="min-h-[80px] p-4 font-mono"
            />
            
            <h4>Review of Systems</h4>
            <Textarea
              value={getSection('Review of Systems')}
              onChange={(e) => updateSection('ros', e.target.value)}
              placeholder="Document review of systems..."
              className="min-h-[150px] p-4 font-mono"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="exam">
          <Textarea
            value={getSection('Physical Examination')}
            onChange={(e) => updateSection('physicalExam', e.target.value)}
            placeholder="Document physical examination findings..."
            className="min-h-[300px] p-4 font-mono"
          />
        </TabsContent>
        
        <TabsContent value="assessment">
          <Textarea
            value={getSection('Assessment and Plan')}
            onChange={(e) => updateSection('assessment', e.target.value)}
            placeholder="Document assessment and plan..."
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

export default HPNote;
