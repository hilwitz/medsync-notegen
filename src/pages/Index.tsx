
import Header from '@/components/Header';
import LandingHero from '@/components/LandingHero';
import Features from '@/components/Features';
import DemoSection from '@/components/DemoSection';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { CustomButton } from '@/components/ui/CustomButton';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <LandingHero />
        <div className="w-full flex justify-center py-6">
          <Link to="/consultations/new">
            <CustomButton variant="primary" size="lg">
              New Consultation
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
