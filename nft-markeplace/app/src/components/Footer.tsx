import { Link } from 'react-router-dom';
import { Twitter, MessageCircle, Youtube, Instagram } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    marketplace: [
      { name: 'All NFTs', href: '/explore' },
      { name: 'Art', href: '/explore?category=art' },
      { name: 'Collectibles', href: '/explore?category=collectibles' },
      { name: 'Domain Names', href: '/explore?category=domains' },
      { name: 'Music', href: '/explore?category=music' },
      { name: 'Photography', href: '/explore?category=photography' },
      { name: 'Sports', href: '/explore?category=sports' },
      { name: 'Trading Cards', href: '/explore?category=trading-cards' },
      { name: 'Utility', href: '/explore?category=utility' },
      { name: 'Virtual Worlds', href: '/explore?category=virtual-worlds' },
    ],
    myAccount: [
      { name: 'Profile', href: '/profile' },
      { name: 'Favorites', href: '/favorites' },
      { name: 'Watchlist', href: '/watchlist' },
      { name: 'My Collections', href: '/collections' },
      { name: 'Settings', href: '/settings' },
    ],
    resources: [
      { name: 'Help Center', href: '/help' },
      { name: 'Platform Status', href: '/status' },
      { name: 'Partners', href: '/partners' },
      { name: 'Gas-Free Marketplace', href: '/gas-free' },
      { name: 'Taxes', href: '/taxes' },
      { name: 'Blog', href: '/blog' },
      { name: 'Docs', href: '/docs' },
      { name: 'Newsletter', href: '/newsletter' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Ventures', href: '/ventures' },
      { name: 'Grants', href: '/grants' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Discord', icon: MessageCircle, href: '#' },
    { name: 'YouTube', icon: Youtube, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
  ];

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Nexus</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs">
              The world's first and largest digital marketplace for crypto collectibles and non-fungible tokens (NFTs).
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Marketplace</h3>
            <ul className="space-y-2">
              {footerLinks.marketplace.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">My Account</h3>
            <ul className="space-y-2">
              {footerLinks.myAccount.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            © 2025 Nexus Marketplace
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
