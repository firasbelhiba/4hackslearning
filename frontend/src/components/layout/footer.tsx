import Link from 'next/link';
import { Twitter, MessageCircle, Linkedin, Github } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Hackathons', href: '/hackathons' },
    { label: 'Courses', href: '/courses' },
    { label: 'Certifications', href: '/certifications' },
    { label: 'BUIDLs', href: '/buidls' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Blog', href: '/blog' },
    { label: 'Community', href: '/community' },
    { label: 'Support', href: '/support' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Partners', href: '/partners' },
    { label: 'Press', href: '/press' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Licenses', href: '/licenses' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/4hacks', label: 'Twitter' },
  { icon: MessageCircle, href: 'https://discord.gg/4hacks', label: 'Discord' },
  { icon: Linkedin, href: 'https://linkedin.com/company/4hacks', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/4hacks', label: 'GitHub' },
];

export function Footer() {
  return (
    <footer className="bg-white border-t-2 border-black">
      {/* Wave Decoration */}
      <div className="relative">
        <svg
          className="w-full h-20"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
            fill="#8B5CF6"
          />
        </svg>
      </div>

      <div className="bg-purple-500">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <span className="text-2xl font-bold text-white">4</span>
                <span className="text-2xl font-bold text-brand">HACKS</span>
              </Link>
              <p className="text-white/80 text-sm mb-6 max-w-xs">
                Empowering the next generation of Web3 builders through education, hackathons, and community.
              </p>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 border-2 border-white/20 text-white hover:bg-white hover:text-purple-500 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-bold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="font-bold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
