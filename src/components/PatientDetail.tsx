
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Phone, Mail, Calendar, Clock, PlusCircle, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '@/components/ui/CustomButton';
import { Badge } from '@/components/ui/badge';
import ConsultationDialog from './ConsultationDialog';

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  medicalRecordNumber?: string;
}

interface Consultation {
  id: string;
  date: string;
  status: string;
  note_type: string;
  content: any;
}

interface PatientDetailProps {
  patient: PatientData;
  onPatientUpdated: () => void;
}

const PatientDetail = ({ patient, onPatientUpdated }: PatientDetailProps) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (patient?.id) {
      fetchConsultations();
    }
  }, [patient]);

  const fetchConsultations = async () => {
    if (!patient?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', patient.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patient consultations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConsultation = () => {
    navigate('/consultations/new', { state: { patientId: patient.id } });
  };

  const handleViewConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setDialogOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null;
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (e) {
      return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const patientName = `${patient.firstName} ${patient.lastName}`;
  const patientAge = calculateAge(patient.dateOfBirth);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{patientName}</h2>
        <CustomButton 
          variant="primary" 
          size="sm"
          onClick={handleNewConsultation}
          className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600"
        >
          <PlusCircle size={16} />
          New Consultation
        </CustomButton>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
            <p>{patient.gender || 'Not specified'}</p>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
              <p>{formatDate(patient.dateOfBirth)} {patientAge !== null && `(${patientAge} years)`}</p>
            </div>
          </div>
          
          {patient.medicalRecordNumber && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Medical Record Number</p>
              <p>{patient.medicalRecordNumber}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {patient.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p>{patient.phone}</p>
              </div>
            </div>
          )}
          
          {patient.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p>{patient.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
        <h3 className="text-lg font-medium mb-4">Consultations</h3>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : consultations.length > 0 ? (
          <div className="grid gap-3">
            {consultations.map((consultation) => (
              <div 
                key={consultation.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => handleViewConsultation(consultation)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={getStatusColor(consultation.status)}>
                        {consultation.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {consultation.note_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(consultation.date)}</span>
                    </div>
                  </div>
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No consultations yet</p>
            <p className="text-sm mt-1">Create a new consultation to get started</p>
          </div>
        )}
      </div>

      {selectedConsultation && (
        <ConsultationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          consultation={selectedConsultation}
          patientName={patientName}
        />
      )}
    </div>
  );
};

export default PatientDetail;
