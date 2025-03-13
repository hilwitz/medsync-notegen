
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative h-8 w-8 bg-gradient-to-br from-medsync-500 to-medsync-700 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold">M</span>
              </div>
              <span className="text-xl font-medium">MedSync</span>
            </Link>
            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
              AI-Powered Clinical Documentation Assistant reducing documentation burden for healthcare providers.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Security', 'Demo', 'Integrations'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-medsync-600 dark:hover:text-medsync-400 transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              {['Documentation', 'API', 'Support', 'Community', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-medsync-600 dark:hover:text-medsync-400 transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {['About', 'Blog', 'Careers', 'Contact', 'Press'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-medsync-600 dark:hover:text-medsync-400 transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            &copy; {currentYear} MedSync. All rights reserved.
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            {['Twitter', 'LinkedIn', 'GitHub', 'Facebook'].map((item) => (
              <a 
                key={item} 
                href="#" 
                className="text-neutral-500 hover:text-medsync-600 transition-colors duration-200"
                aria-label={item}
              >
                <span className="text-sm">{item}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
