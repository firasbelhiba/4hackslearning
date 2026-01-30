import Link from 'next/link';
import Image from 'next/image';
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
    <footer className="bg-[#AD46FF]">
      <div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
            {/* Brand Section */}
            <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-2 mb-4 sm:mb-0">
              <Link href="/" className="inline-block mb-3 sm:mb-4">
                <Image
                  src="/images/logo-lg.png"
                  alt="4HACKS"
                  width={120}
                  height={41}
                  className="h-8 sm:h-10 w-auto"
                />
              </Link>
              <p className="text-black/70 text-sm mb-4 sm:mb-6 max-w-xs">
                Empowering the next generation of Web3 builders through education, hackathons, and community.
              </p>
              <div className="flex gap-3 sm:gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-black"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-bold text-black mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-black/70 hover:text-black text-xs sm:text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="font-bold text-black mb-3 sm:mb-4 text-sm sm:text-base">Resources</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-black/70 hover:text-black text-xs sm:text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-bold text-black mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-black/70 hover:text-black text-xs sm:text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-bold text-black mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-black/70 hover:text-black text-xs sm:text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-dashed border-black/30">
            <p className="text-black/60 text-xs sm:text-sm text-center">
              &copy; {new Date().getFullYear()} 4HACKS Learning. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
