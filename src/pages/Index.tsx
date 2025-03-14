
import Header from '@/components/Header';
import LandingHero from '@/components/LandingHero';
import Features from '@/components/Features';
import DemoSection from '@/components/DemoSection';
import Footer from '@/components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { CustomButton } from '@/components/ui/CustomButton';

const Index = () => {
  const navigate = useNavigate();

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <LandingHero />
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
