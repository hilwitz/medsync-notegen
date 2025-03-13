
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CustomButton } from '@/components/ui/CustomButton';
import { useToast } from '@/hooks/use-toast';

const NewConsultation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [patientFirstName, setPatientFirstName] = useState('');
  const [patientLastName, setPatientLastName] = useState('');
  const [noteType, setNoteType] = useState('SOAP');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a consultation",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }
      
      // First create or retrieve patient
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .upsert({
          user_id: user.id,
          first_name: patientFirstName,
          last_name: patientLastName
        }, {
          onConflict: 'user_id, first_name, last_name',
          returning: 'minimal'
        })
        .select()
        .single();
      
      if (patientError) {
        throw patientError;
      }
      
      // Create new consultation
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          patient_id: patient.id,
          note_type: noteType,
          status: 'scheduled'
        })
        .select()
        .single();
      
      if (consultationError) {
        throw consultationError;
      }
      
      toast({
        title: "Success!",
        description: "New consultation created",
      });
      
      // Navigate to consultation detail/edit page
      navigate(`/consultations/${consultation.id}`);
      
    } catch (error) {
      console.error('Error creating consultation:', error);
      toast({
        title: "Error",
        description: "Failed to create new consultation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">New Consultation</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-md">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Patient Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={patientFirstName}
                onChange={(e) => setPatientFirstName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-medsync-500 dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={patientLastName}
                onChange={(e) => setPatientLastName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-medsync-500 dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Consultation Details</h2>
          
          <div>
            <label htmlFor="noteType" className="block text-sm font-medium mb-1">
              Note Type
            </label>
            <select
              id="noteType"
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-medsync-500 dark:bg-neutral-700 dark:border-neutral-600"
            >
              <option value="SOAP">SOAP Note</option>
              <option value="H&P">History & Physical</option>
              <option value="Progress">Progress Note</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <CustomButton
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </CustomButton>
          
          <CustomButton
            type="submit" 
            variant="primary"
            size="md"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Consultation"}
          </CustomButton>
        </div>
      </form>
    </div>
  );
};

export default NewConsultation;
