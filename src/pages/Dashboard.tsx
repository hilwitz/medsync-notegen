
import { useState } from 'react';
import Header from '@/components/Header';
import { CustomButton } from '@/components/ui/CustomButton';
import { cn } from '@/lib/utils';

interface Consultation {
  id: string;
  patientName: string;
  date: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  noteType: 'SOAP' | 'H&P' | 'Progress';
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'recent' | 'all' | 'templates'>('recent');
  
  const recentConsultations: Consultation[] = [
    {
      id: '1',
      patientName: 'Emily Johnson',
      date: '2023-06-15 09:30 AM',
      status: 'completed',
      noteType: 'SOAP'
    },
    {
      id: '2',
      patientName: 'Michael Smith',
      date: '2023-06-15 11:00 AM',
      status: 'completed',
      noteType: 'H&P'
    },
    {
      id: '3',
      patientName: 'Sarah Williams',
      date: '2023-06-16 10:15 AM',
      status: 'in-progress',
      noteType: 'Progress'
    },
    {
      id: '4',
      patientName: 'David Brown',
      date: '2023-06-16 02:30 PM',
      status: 'scheduled',
      noteType: 'SOAP'
    }
  ];

  const statusColor = {
    'completed': 'bg-green-500',
    'in-progress': 'bg-yellow-500',
    'scheduled': 'bg-neutral-400'
  };

  const tabs = [
    { id: 'recent', label: 'Recent Consultations' },
    { id: 'all', label: 'All Consultations' },
    { id: 'templates', label: 'Note Templates' }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      
      <main className="pt-28 pb-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-medium">Welcome back, Dr. Williams</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">Here's an overview of your clinical documentation</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <CustomButton 
              variant="primary" 
              size="md"
              className="shadow-lg shadow-medsync-500/20 hover:shadow-medsync-600/20 transition-all"
            >
              New Consultation
            </CustomButton>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: 'Today\'s Consultations', value: '4', icon: 'calendar' },
            { title: 'Pending Notes', value: '2', icon: 'document' },
            { title: 'Completed Notes', value: '135', icon: 'check' }
          ].map((stat, index) => (
            <div key={index} className="glass-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.title}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
                <div className="bg-medsync-100 dark:bg-medsync-900/30 p-3 rounded-lg">
                  {stat.icon === 'calendar' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-medsync-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {stat.icon === 'document' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-medsync-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {stat.icon === 'check' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-medsync-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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
                      ? "text-medsync-600 border-b-2 border-medsync-600"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-medsync-500 hover:border-b-2 hover:border-medsync-500/50"
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
                    {recentConsultations.map((consultation) => (
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
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-medsync-100 dark:bg-medsync-900/30 text-medsync-700 dark:text-medsync-300">
                            {consultation.noteType}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className={cn("h-2 w-2 rounded-full mr-2", statusColor[consultation.status])}></div>
                            <span className="text-sm capitalize">{consultation.status.replace('-', ' ')}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right pr-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-150">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-150">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'all' && (
              <div className="flex items-center justify-center h-40 text-neutral-500 dark:text-neutral-400">
                All consultations will be displayed here
              </div>
            )}
            
            {activeTab === 'templates' && (
              <div className="flex items-center justify-center h-40 text-neutral-500 dark:text-neutral-400">
                Your note templates will be displayed here
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
