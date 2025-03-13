import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CustomButton } from './ui/CustomButton';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Check current auth state
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
    navigate('/');
  };

  let navItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Demo', path: '/#demo' },
  ];
  
  // Add authenticated routes
  if (user) {
    navItems = [
      { name: 'Home', path: '/' },
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'New Consultation', path: '/consultations/new' }
    ];
  }

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 py-4 md:px-8',
        isScrolled ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="relative h-8 w-8 bg-gradient-to-br from-medsync-500 to-medsync-700 rounded-md flex items-center justify-center">
            <span className="text-white font-semibold">M</span>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-white rounded-full border-2 border-medsync-500 animate-pulse-subtle"></div>
          </div>
          <span className="text-xl font-medium">MedSync</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'text-sm font-medium transition-colors duration-200 hover:text-medsync-600',
                isActive(item.path) ? 'text-medsync-600' : 'text-neutral-700 dark:text-neutral-300'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {!loading && (
            user ? (
              <CustomButton 
                variant="outline" 
                size="md"
                onClick={handleLogout}
              >
                Log Out
              </CustomButton>
            ) : (
              <CustomButton 
                variant="primary" 
                size="md"
                className="shadow-lg shadow-medsync-500/20 hover:shadow-medsync-600/20 transition-all"
                onClick={() => navigate('/auth')}
              >
                Log In
              </CustomButton>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-neutral-700 dark:text-neutral-300 focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            className="h-6 w-6"
          >
            {isMobileMenuOpen ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg animate-slide-down">
          <div className="px-6 py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    'text-sm font-medium transition-colors duration-200 hover:text-medsync-600 py-2',
                    isActive(item.path) ? 'text-medsync-600' : 'text-neutral-700 dark:text-neutral-300'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              {!loading && (
                user ? (
                  <CustomButton 
                    variant="outline" 
                    size="md"
                    className="mt-2"
                    onClick={handleLogout}
                  >
                    Log Out
                  </CustomButton>
                ) : (
                  <CustomButton 
                    variant="primary" 
                    size="md"
                    className="mt-2 w-full shadow-lg shadow-medsync-500/20 hover:shadow-medsync-600/20 transition-all"
                    onClick={() => navigate('/auth')}
                  >
                    Log In
                  </CustomButton>
                )
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
