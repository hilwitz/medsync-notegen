
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import SOAPNote from "@/components/note-templates/SOAPNote";
import HPNote from "@/components/note-templates/HPNote";
import { ProgressNote } from "@/components/note-templates/ProgressNote";

interface ConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation: any;
  patientName: string;
}

const ConsultationDialog = ({ open, onOpenChange, consultation, patientName }: ConsultationDialogProps) => {
  if (!consultation) return null;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'MMMM d, yyyy');
    } catch (e) {
      return dateStr.substring(0, 10);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'h:mm a');
    } catch (e) {
      return '';
    }
  };

  const getNoteContent = () => {
    if (consultation.content && typeof consultation.content === 'object' && !Array.isArray(consultation.content)) {
      const contentObj = consultation.content as Record<string, any>;
      return contentObj.note || '';
    }
    return '';
  };

  const renderNoteTemplate = () => {
    const noteContent = getNoteContent();
    
    switch (consultation.note_type) {
      case 'SOAP':
        return (
          <SOAPNote 
            noteContent={noteContent} 
            setNoteContent={() => {}} // Read-only view
            readOnly={true}
          />
        );
      case 'H&P':
        return (
          <HPNote 
            noteContent={noteContent} 
            setNoteContent={() => {}} // Read-only view
            readOnly={true}
          />
        );
      case 'Progress':
        return (
          <ProgressNote 
            noteContent={noteContent} 
            setNoteContent={() => {}} // Read-only view
            readOnly={true}
          />
        );
      default:
        return (
          <div className="p-4 border rounded-md">
            <textarea
              className="w-full h-64 p-2 border rounded-md"
              value={noteContent}
              readOnly
              placeholder="No consultation notes available."
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 shadow-md hover:shadow-lg transition-shadow duration-300 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Patient Name</h4>
                <p className="font-medium">{patientName}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h4>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <p>{consultation?.date ? formatDate(consultation.date) : 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</h4>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <p>{consultation?.date ? formatTime(consultation.date) : 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Note Type</h4>
                <p>{consultation?.note_type || 'Standard Note'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                <p className="capitalize">{consultation?.status || 'Unknown'}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow duration-300 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle>
                {consultation?.note_type || 'Standard'} Note
              </CardTitle>
              <CardDescription>
                Consultation note details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderNoteTemplate()}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationDialog;
