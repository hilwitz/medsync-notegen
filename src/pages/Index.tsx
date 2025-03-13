
import Header from '@/components/Header';
import LandingHero from '@/components/LandingHero';
import Features from '@/components/Features';
import DemoSection from '@/components/DemoSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <LandingHero />
        <Features />
        <DemoSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
