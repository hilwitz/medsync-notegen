
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export interface SOAPNoteProps {
  noteContent: string;
  setNoteContent: (content: string) => void;
  readOnly?: boolean;
}

const SOAPNote = ({ noteContent, setNoteContent, readOnly = false }: SOAPNoteProps) => {
  // Parse the content if it exists
  let subjective = '';
  let objective = '';
  let assessment = '';
  let plan = '';

  if (noteContent) {
    try {
      // Try to find sections by using headings
      const subjectiveMatch = noteContent.match(/Subjective:([\s\S]*?)(?=Objective:|$)/i);
      const objectiveMatch = noteContent.match(/Objective:([\s\S]*?)(?=Assessment:|$)/i);
      const assessmentMatch = noteContent.match(/Assessment:([\s\S]*?)(?=Plan:|$)/i);
      const planMatch = noteContent.match(/Plan:([\s\S]*?)(?=$)/i);

      subjective = subjectiveMatch ? subjectiveMatch[1].trim() : '';
      objective = objectiveMatch ? objectiveMatch[1].trim() : '';
      assessment = assessmentMatch ? assessmentMatch[1].trim() : '';
      plan = planMatch ? planMatch[1].trim() : '';
    } catch (e) {
      console.error("Error parsing SOAP note:", e);
    }
  }

  const updateNoteContent = () => {
    const updatedContent = `Subjective:
${subjective}

Objective:
${objective}

Assessment:
${assessment}

Plan:
${plan}`;
    setNoteContent(updatedContent);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <label className="block text-sm font-medium mb-2">Subjective</label>
        <Textarea
          value={subjective}
          onChange={(e) => {
            if (!readOnly) {
              subjective = e.target.value;
              updateNoteContent();
            }
          }}
          placeholder="Enter patient's subjective information, chief complaint, history of present illness, etc."
          className="min-h-[100px] mb-4"
          readOnly={readOnly}
        />

        <label className="block text-sm font-medium mb-2">Objective</label>
        <Textarea
          value={objective}
          onChange={(e) => {
            if (!readOnly) {
              objective = e.target.value;
              updateNoteContent();
            }
          }}
          placeholder="Enter objective findings, physical examination, vital signs, lab results, etc."
          className="min-h-[100px] mb-4"
          readOnly={readOnly}
        />

        <label className="block text-sm font-medium mb-2">Assessment</label>
        <Textarea
          value={assessment}
          onChange={(e) => {
            if (!readOnly) {
              assessment = e.target.value;
              updateNoteContent();
            }
          }}
          placeholder="Enter your assessment, diagnoses, clinical impressions, etc."
          className="min-h-[100px] mb-4"
          readOnly={readOnly}
        />

        <label className="block text-sm font-medium mb-2">Plan</label>
        <Textarea
          value={plan}
          onChange={(e) => {
            if (!readOnly) {
              plan = e.target.value;
              updateNoteContent();
            }
          }}
          placeholder="Enter your treatment plan, medications, follow-up, etc."
          className="min-h-[100px]"
          readOnly={readOnly}
        />
      </Card>
    </div>
  );
};

export default SOAPNote;
