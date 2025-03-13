
import { useState, useEffect, useRef } from 'react';
import { CustomButton } from './ui/CustomButton';
import { cn } from '@/lib/utils';

const DemoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [noteGenerated, setNoteGenerated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  const conversation = [
    "Doctor: Good morning, Mrs. Johnson. How have you been feeling since our last visit?",
    "Patient: The pain in my knee has improved a bit with the medication, but I still have some stiffness in the morning.",
    "Doctor: How long does the stiffness last?",
    "Patient: Usually about 30 minutes after I get up, then it gets better as I move around.",
    "Doctor: And how would you rate your pain now on a scale of 1 to 10?",
    "Patient: I'd say it's about a 4 now, down from a 7 last time.",
    "Doctor: That's good progress. Any side effects from the medication?",
    "Patient: Just a little stomach upset if I take it without food."
  ];

  const soapNote = {
    subjective: "Patient reports improvement in right knee pain (decreased from 7/10 to 4/10). Morning stiffness persists but resolves after approximately 30 minutes of activity. Patient notes mild gastric discomfort when taking medication without food.",
    objective: "Vital signs stable. Right knee examination shows decreased swelling compared to previous visit. Range of motion improved to 0-100 degrees (previously 0-85). No erythema. Mild tenderness on palpation of medial joint line.",
    assessment: "1. Improving right knee osteoarthritis\n2. Medication-related mild gastritis",
    plan: "1. Continue current pain medication but take with food\n2. Physical therapy twice weekly for 4 weeks\n3. Follow up in 4 weeks\n4. Call if symptoms worsen"
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (demoRef.current) {
            demoRef.current.style.opacity = '1';
            demoRef.current.style.transform = 'translateY(0)';
          }
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let conversationInterval: NodeJS.Timeout;
    
    if (isPlaying) {
      setCurrentStep(0);
      setTranscription('');
      setNoteGenerated(false);
      
      let currentIndex = 0;
      conversationInterval = setInterval(() => {
        if (currentIndex < conversation.length) {
          setTranscription(prev => prev + (prev ? '\n' : '') + conversation[currentIndex]);
          setCurrentStep(currentIndex + 1);
          currentIndex++;
        } else {
          clearInterval(conversationInterval);
          setTimeout(() => {
            setNoteGenerated(true);
          }, 1500);
          setIsPlaying(false);
        }
      }, 2000);
    }
    
    return () => {
      clearInterval(conversationInterval);
    };
  }, [isPlaying]);

  const handlePlayDemo = () => {
    setIsPlaying(true);
  };

  return (
    <section id="demo" ref={sectionRef} className="py-20 md:py-32 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="mb-4">
            See MedSync <span className="text-gradient">in Action</span>
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Watch how MedSync transforms a consultation into a structured clinical note in real-time
          </p>
        </div>

        <div 
          ref={demoRef} 
          className="max-w-6xl mx-auto"
          style={{ opacity: 0, transform: 'translateY(30px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 glass-card p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm font-medium text-neutral-500">Transcription</div>
              </div>
              
              {/* Progress indicator */}
              <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded mb-4">
                <div 
                  className="h-full bg-medsync-500 rounded transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / conversation.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="h-80 overflow-y-auto font-mono text-sm p-4 bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
                {transcription ? (
                  <pre className="whitespace-pre-wrap">{transcription}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-400">
                    Press "Run Demo" to see the transcription
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-center">
                <CustomButton 
                  variant="primary"
                  size="md"
                  onClick={handlePlayDemo}
                  disabled={isPlaying}
                  className="shadow-md shadow-medsync-500/20 hover:shadow-medsync-600/20 transition-all"
                >
                  {isPlaying ? 'Processing...' : 'Run Demo'}
                </CustomButton>
              </div>
              
              {/* Animation overlay */}
              {isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-medsync-500/10 to-transparent animate-pulse-subtle pointer-events-none"></div>
              )}
            </div>
            
            <div className="lg:col-span-2 glass-card p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm font-medium text-neutral-500">SOAP Note</div>
              </div>
              
              <div className={cn(
                "h-80 overflow-y-auto p-4 bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 transition-all duration-500",
                !noteGenerated && "opacity-50"
              )}>
                {noteGenerated ? (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <h4 className="text-sm font-bold text-medsync-700 dark:text-medsync-400 mb-1">Subjective</h4>
                      <p className="text-sm">{soapNote.subjective}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-medsync-700 dark:text-medsync-400 mb-1">Objective</h4>
                      <p className="text-sm">{soapNote.objective}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-medsync-700 dark:text-medsync-400 mb-1">Assessment</h4>
                      <p className="text-sm whitespace-pre-line">{soapNote.assessment}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-medsync-700 dark:text-medsync-400 mb-1">Plan</h4>
                      <p className="text-sm whitespace-pre-line">{soapNote.plan}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-400">
                    {isPlaying ? 'Analyzing conversation...' : 'Waiting for conversation to complete'}
                  </div>
                )}
              </div>
              
              {/* Animation overlay */}
              {isPlaying && !noteGenerated && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-medsync-500/10 to-transparent animate-pulse-subtle pointer-events-none"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
