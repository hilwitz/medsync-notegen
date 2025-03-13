
import { useEffect, useRef } from 'react';
import { CustomButton } from './ui/CustomButton';

const LandingHero = () => {
  const animationRef = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const elements = [
      { id: 'hero-title', delay: 0 },
      { id: 'hero-subtitle', delay: 200 },
      { id: 'hero-cta', delay: 400 },
      { id: 'hero-image', delay: 600 }
    ];

    elements.forEach(({ id, delay }) => {
      const element = document.getElementById(id);
      if (element) {
        animationRef.current[id] = element;
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `opacity 0.8s ease, transform 0.8s ease`;
        element.style.transitionDelay = `${delay}ms`;

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
              }, delay);
              observer.unobserve(element);
            }
          });
        }, { threshold: 0.1 });

        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-1/3 h-1/3 bg-medsync-100 dark:bg-medsync-900/20 rounded-full filter blur-3xl opacity-50 animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-1/4 h-1/4 bg-medsync-100 dark:bg-medsync-900/20 rounded-full filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-8">
            <div className="space-y-4">
              <h1 id="hero-title" className="font-medium leading-tight">
                <span className="text-gradient">AI-Powered</span> Clinical Documentation Assistant
              </h1>
              <p id="hero-subtitle" className="text-xl text-neutral-600 dark:text-neutral-400 max-w-[600px]">
                Reduce clinician documentation burden by automatically generating structured clinical notes from doctor-patient conversations.
              </p>
            </div>
            
            <div id="hero-cta" className="flex flex-col sm:flex-row gap-4">
              <CustomButton 
                variant="primary" 
                size="lg"
                className="shadow-xl shadow-medsync-500/20 hover:shadow-medsync-600/20 transition-all"
              >
                Start Free Trial
              </CustomButton>
              <CustomButton 
                variant="outline" 
                size="lg"
              >
                Watch Demo
              </CustomButton>
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                HIPAA compliant and secure data handling
              </p>
            </div>
          </div>
          
          <div id="hero-image" className="relative">
            <div className="glass-card p-4 md:p-6 shadow-xl shadow-neutral-200/20 dark:shadow-neutral-900/20">
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-medsync-500/10 to-medsync-700/10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&q=80&w=1600&height=900" 
                  alt="Doctor with patient" 
                  className="w-full h-full object-cover rounded-lg"
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-b-lg">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-sm font-medium">Transcribing in real-time...</p>
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      "...and have you noticed any changes in your symptoms since our last appointment?"
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 glass-card p-4 rounded-lg shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0 h-8 w-8 bg-medsync-500 rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">SOAP Note</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Auto-generated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
