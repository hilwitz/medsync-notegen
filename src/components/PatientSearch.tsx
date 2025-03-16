
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface PatientSearchProps {
  onSelect?: (patient: Patient) => void;
}

const PatientSearch = ({ onSelect }: PatientSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setIsSearching(true);
    setShowResults(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to search patients",
          variant: "destructive"
        });
        return;
      }
      
      // Search by first or last name
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .order('last_name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for patients",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePatientClick = (patient: Patient) => {
    if (onSelect) {
      onSelect(patient);
    } else {
      navigate(`/patients/${patient.id}`);
    }
    setShowResults(false);
    setSearchTerm('');
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Auto-search if 2 or more characters
    if (value.length >= 2) {
      // Debounce function
      const timeoutId = setTimeout(async () => {
        try {
          setIsSearching(true);
          
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) return;
          
          const { data, error } = await supabase
            .from('patients')
            .select('id, first_name, last_name')
            .eq('user_id', user.id)
            .or(`first_name.ilike.%${value}%,last_name.ilike.%${value}%`)
            .order('last_name', { ascending: true })
            .limit(10);
          
          if (error) throw error;
          
          setSearchResults(data || []);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setShowResults(false);
    }
  };

  const handleBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => setShowResults(false), 200);
  };

  const handleFocus = () => {
    if (searchTerm.length >= 2 && searchResults.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search patients by name..."
            className="pl-10 pr-4 py-2 w-full"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </form>

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
          <ul className="py-1">
            {searchResults.map((patient) => (
              <li 
                key={patient.id} 
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handlePatientClick(patient)}
              >
                {patient.first_name} {patient.last_name}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {showResults && searchTerm && searchResults.length === 0 && !isSearching && (
        <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          No patients found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
