
import { useEffect } from 'react';
import Header from '@/components/Header';
import LandingHero from '@/components/LandingHero';
import Features from '@/components/Features';
import DemoSection from '@/components/DemoSection';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { CustomButton } from '@/components/ui/CustomButton';

const Index = () => {
  // Force light mode for landing page
  useEffect(() => {
    // Save the current theme preference
    const currentTheme = localStorage.getItem('theme');
    
    // Force light theme for landing page
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    
    // Restore the original theme preference when component unmounts
    return () => {
      if (currentTheme) {
        localStorage.setItem('theme', currentTheme);
        if (currentTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    };
  }, []);

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col landing-page">
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
