
import Header from '@/components/Header';
import LandingHero from '@/components/LandingHero';
import Features from '@/components/Features';
import DemoSection from '@/components/DemoSection';
import Footer from '@/components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { CustomButton } from '@/components/ui/CustomButton';
import { Play, Sparkles } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <LandingHero />
        <div className="w-full flex flex-col md:flex-row justify-center gap-4 py-6 px-4">
          <CustomButton 
            variant="primary" 
            size="lg"
            icon={<Sparkles className="w-5 h-5" />}
            onClick={() => navigate('/free-trial')}
          >
            Start Free Trial
          </CustomButton>
          <CustomButton 
            variant="outline" 
            size="lg"
            icon={<Play className="w-5 h-5" />}
            onClick={() => navigate('/watch-demo')}
          >
            Watch Demo
          </CustomButton>
        </div>
        <div className="w-full flex justify-center py-6">
          <Link to="/features">
            <CustomButton variant="secondary" size="md">
              Explore Features
            </CustomButton>
          </Link>
        </div>
        <Features />
        <DemoSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
