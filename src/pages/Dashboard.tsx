import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import PatientSearch from '@/components/PatientSearch';
import { CustomButton } from '@/components/ui/CustomButton';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ConsultationDialog from '@/components/ConsultationDialog';

interface Consultation {
  id: string;
  patientName: string;
  date: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  noteType: 'SOAP' | 'H&P' | 'Progress';
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'recent' | 'all'>('recent');
  const [userName, setUserName] = useState('');
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);
  const [allConsultations, setAllConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalConsultations: 0,
    consultationsThisMonth: 0,
    consultationsToday: 0
  });
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [consultationPatientName, setConsultationPatientName] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile && (profile.first_name || profile.last_name)) {
          setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
        } else {
          setUserName(user.email?.split('@')[0] || 'User');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const fetchConsultations = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const { data: consultationsData, error } = await supabase
          .from('consultations')
          .select(`
            id, 
            note_type, 
            status, 
            date, 
            created_at,
            content,
            patients(first_name, last_name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const { count: patientCount, error: patientError } = await supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (patientError) throw patientError;

        if (consultationsData) {
          const thisMonthConsultations = consultationsData.filter(consult => {
            const consultDate = new Date(consult.date);
            return consultDate >= firstDayOfMonth;
          });
          
          const todaysConsultations = consultationsData.filter(consult => {
            const consultDate = new Date(consult.date);
            return consultDate.toISOString().split('T')[0] === todayStr;
          });
          
          setStats({
            totalPatients: patientCount || 0,
            totalConsultations: consultationsData.length,
            consultationsThisMonth: thisMonthConsultations.length,
            consultationsToday: todaysConsultations.length
          });

          const formattedConsultations: Consultation[] = consultationsData
            .map(consult => ({
              id: consult.id,
              patientName: consult.patients ? 
                `${consult.patients.first_name} ${consult.patients.last_name}` : 
                'Unknown Patient',
              date: new Date(consult.date).toLocaleString(),
              status: mapStatus(consult.status),
              noteType: consult.note_type as 'SOAP' | 'H&P' | 'Progress'
            }));

          setAllConsultations(formattedConsultations);
          
          setRecentConsultations(formattedConsultations.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching consultations:', error);
        toast({
          title: "Error",
          description: "Failed to load consultations",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
    fetchConsultations();
  }, [toast]);

  const handleStatusChange = async (consultationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ status: newStatus })
        .eq('id', consultationId);

      if (error) throw error;

      const updateConsultationStatus = (consultations: Consultation[]) => {
        return consultations.map(consult => 
          consult.id === consultationId 
            ? {...consult, status: mapStatus(newStatus)} 
            : consult
        );
      };

      setRecentConsultations(updateConsultationStatus(recentConsultations));
      setAllConsultations(updateConsultationStatus(allConsultations));

      toast({
        title: "Status Updated",
        description: "Consultation status has been updated"
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update consultation status",
        variant: "destructive"
      });
    }
  };

  const mapStatus = (status: string): 'completed' | 'in_progress' | 'scheduled' => {
    const statusMap: Record<string, 'completed' | 'in_progress' | 'scheduled'> = {
      'completed': 'completed',
      'in_progress': 'in_progress',
      'scheduled': 'scheduled',
      'cancelled': 'scheduled'
    };
    return statusMap[status] || 'scheduled';
  };

  const handleNewConsultation = () => {
    navigate('/consultations/new');
  };

  const handleViewConsultation = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          patients (
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSelectedConsultation(data);
        if (data.patients) {
          setConsultationPatientName(`${data.patients.first_name} ${data.patients.last_name}`);
        } else {
          setConsultationPatientName('Unknown Patient');
        }
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
      toast({
        title: "Error",
        description: "Failed to load consultation details",
        variant: "destructive"
      });
    }
  };

  const statusColor = {
    'completed': 'bg-green-500',
    'in_progress': 'bg-yellow-500',
    'scheduled': 'bg-neutral-400'
  };

  const tabs = [
    { id: 'recent', label: 'Recent Consultations' },
    { id: 'all', label: 'All Consultations' }
  ];

  const renderConsultationsTable = (consultations: Consultation[]) => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      );
    }
    
    if (consultations.length === 0) {
      return (
        <div className="text-center py-8 text-neutral-500">
          No consultations found. Create your first consultation by clicking the "New Consultation" button.
        </div>
      );
    }
    
    return (
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
            <th className="pb-3 pl-4">Patient</th>
            <th className="pb-3">Date & Time</th>
            <th className="pb-3">Note Type</th>
            <th className="pb-3">Status</th>
            <th className="pb-3 text-right pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {consultations.map((consultation) => (
            <tr 
              key={consultation.id} 
              className="border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-150"
            >
              <td className="py-4 pl-4">
                <div className="font-medium">{consultation.patientName}</div>
              </td>
              <td className="py-4 text-neutral-600 dark:text-neutral-400">
                {consultation.date}
              </td>
              <td className="py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {consultation.noteType}
                </span>
              </td>
              <td className="py-4">
                <Select
                  value={consultation.status}
                  onValueChange={(value) => handleStatusChange(consultation.id, value)}
                >
                  <SelectTrigger className="w-[140px] h-8 text-sm">
                    <div className="flex items-center">
                      <div className={cn("h-2 w-2 rounded-full mr-2", statusColor[consultation.status as keyof typeof statusColor])}></div>
                      <span className="capitalize">{consultation.status.replace('_', ' ')}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="py-4 text-right pr-4">
                <div className="flex items-center justify-end space-x-2">
                  <button 
                    className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-150"
                    onClick={() => handleViewConsultation(consultation.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        
        <SidebarInset className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950">
          <div className="pt-6 pb-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-medium bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Welcome back, {userName || 'Dr.'}</h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">Here's an overview of your clinical documentation</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <PatientSearch />
                
                <CustomButton 
                  variant="primary" 
                  size="md"
                  className="shadow-lg shadow-blue-500/20 hover:shadow-blue-600/20 transition-all bg-gradient-to-r from-blue-500 to-blue-600"
                  onClick={handleNewConsultation}
                >
                  New Consultation
                </CustomButton>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { title: 'Total Patients', value: stats.totalPatients.toString(), icon: 'users' },
                { title: 'Today\'s Consultations', value: stats.consultationsToday.toString(), icon: 'calendar' },
                { title: 'Consultations This Month', value: stats.consultationsThisMonth.toString(), icon: 'document' }
              ].map((stat, index) => (
                <div key={index} className="glass-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.title}</p>
                      <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                      {stat.icon === 'calendar' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {stat.icon === 'document' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {stat.icon === 'users' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="glass-card rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-neutral-200 dark:border-neutral-800">
                <nav className="flex" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "text-sm font-medium py-4 px-6 transition-colors duration-200",
                        activeTab === tab.id
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-blue-500 hover:border-b-2 hover:border-blue-500/50"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === 'recent' && (
                  <div className="overflow-x-auto">
                    {renderConsultationsTable(recentConsultations)}
                  </div>
                )}
                
                {activeTab === 'all' && (
                  <div className="overflow-x-auto">
                    {renderConsultationsTable(allConsultations)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
      
      <ConsultationDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        consultation={selectedConsultation}
        patientName={consultationPatientName}
      />
    </SidebarProvider>
  );
};

export default Dashboard;
