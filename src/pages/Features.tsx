
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CustomButton } from '@/components/ui/CustomButton';
import { CheckCircle, FileEdit, Shield, Clock, HeartPulse, Activity } from 'lucide-react';

const Features = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">MedSync Features</h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Streamline your clinical documentation workflow with our comprehensive suite of tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {[
              {
                title: 'SOAP Note Templates',
                description: 'Standardized templates for Subjective, Objective, Assessment, and Plan documentation.',
                icon: <FileEdit className="h-10 w-10 text-medsync-600" />
              },
              {
                title: 'Secure Data Storage',
                description: 'All patient data is encrypted and stored securely in compliance with healthcare regulations.',
                icon: <Shield className="h-10 w-10 text-medsync-600" />
              },
              {
                title: 'Real-time Collaboration',
                description: 'Collaborate with colleagues on patient notes in real-time for improved care coordination.',
                icon: <Clock className="h-10 w-10 text-medsync-600" />
              },
              {
                title: 'Patient Health Tracking',
                description: 'Monitor patient health metrics and progress over time with intuitive visualizations.',
                icon: <HeartPulse className="h-10 w-10 text-medsync-600" />
              },
              {
                title: 'Clinical Decision Support',
                description: 'Evidence-based guidance to assist with diagnostic and treatment decisions.',
                icon: <Activity className="h-10 w-10 text-medsync-600" />
              },
              {
                title: 'Quality Assurance',
                description: 'Automated checks to ensure completeness and accuracy of clinical documentation.',
                icon: <CheckCircle className="h-10 w-10 text-medsync-600" />
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-16">
            <CustomButton 
              variant="primary" 
              size="lg"
              className="w-full md:w-auto shadow-lg shadow-medsync-500/20"
            >
              Start Free Trial
            </CustomButton>
            <CustomButton 
              variant="outline" 
              size="lg"
              className="w-full md:w-auto"
            >
              Schedule a Demo
            </CustomButton>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
