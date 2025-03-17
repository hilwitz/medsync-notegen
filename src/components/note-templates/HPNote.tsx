
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface HPNoteProps {
  noteContent: string;
  setNoteContent: (content: string) => void;
  readOnly?: boolean;
}

const HPNote = ({ noteContent, setNoteContent, readOnly = false }: HPNoteProps) => {
  // Parse the content if it exists
  let history = '';
  let physical = '';
  let assessment = '';
  let plan = '';

  if (noteContent) {
    try {
      // Try to find sections by using headings
      const historyMatch = noteContent.match(/History:([\s\S]*?)(?=Physical Examination:|$)/i);
      const physicalMatch = noteContent.match(/Physical Examination:([\s\S]*?)(?=Assessment:|$)/i);
      const assessmentMatch = noteContent.match(/Assessment:([\s\S]*?)(?=Plan:|$)/i);
      const planMatch = noteContent.match(/Plan:([\s\S]*?)(?=$)/i);

      history = historyMatch ? historyMatch[1].trim() : '';
      physical = physicalMatch ? physicalMatch[1].trim() : '';
      assessment = assessmentMatch ? assessmentMatch[1].trim() : '';
      plan = planMatch ? planMatch[1].trim() : '';
    } catch (e) {
      console.error("Error parsing H&P note:", e);
    }
  }

  const updateNoteContent = () => {
    const updatedContent = `History:
${history}

Physical Examination:
${physical}

Assessment:
${assessment}

Plan:
${plan}`;
    setNoteContent(updatedContent);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <label className="block text-sm font-medium mb-2">History</label>
        <Textarea
          value={history}
          onChange={(e) => {
            if (!readOnly) {
              history = e.target.value;
              updateNoteContent();
            }
          }}
          placeholder="Enter patient's history, including chief complaint, HPI, past medical history, medications, allergies, family history, social history, etc."
          className="min-h-[150px] mb-4"
          readOnly={readOnly}
        />

        <label className="block text-sm font-medium mb-2">Physical Examination</label>
        <Textarea
          value={physical}
          onChange={(e) => {
            if (!readOnly) {
              physical = e.target.value;
              updateNoteContent();
            }
          }}
          placeholder="Enter physical examination findings, including vitals, general appearance, and system-specific findings."
          className="min-h-[150px] mb-4"
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

export default HPNote;
