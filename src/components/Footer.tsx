import React from 'react';
import { Mail, Phone, MapPin, Handshake } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-white py-3">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Trust Icon */}
          <div className="flex items-center justify-center md:justify-start mt-4">
            <Handshake className="w-20 h-20 text-blue-400 animate-float" strokeWidth={1.5} />
          </div>
          
          {/* Content Grid */}
          <div className="flex-1 grid md:grid-cols-3 gap-4">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-2">Navodaya</h3>
            <p className="text-slate-300 text-sm">Industries and Care Kits</p>
            <p className="text-slate-400 text-xs mt-2">Your Trusted Partner in Progress and Care</p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base font-semibold mb-2">Contact Us</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-4 h-4" />
                <span>info@navodaya.group</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="w-4 h-4" />
                <span>+91 XXXXX XXXXX</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="w-4 h-4" />
                <span>India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-2" style={{ marginLeft: '4.25rem' }}>Quick Links</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <a href="#home" className="text-slate-300 hover:text-blue-400 transition-colors">Home</a>
              <a href="#about" className="text-slate-300 hover:text-blue-400 transition-colors">About</a>
              <a href="#products" className="text-slate-300 hover:text-blue-400 transition-colors">Products</a>
              <a href="#contact" className="text-slate-300 hover:text-blue-400 transition-colors">Contact</a>
            </div>
          </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-3 pt-2 text-center text-slate-400 text-xs">
          <p>&copy; {new Date().getFullYear()} Navodaya Industries. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
