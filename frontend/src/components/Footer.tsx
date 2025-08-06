// components/Footer.tsx
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {/* Logo / Opis */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Run Power</h2>
          <p className="text-sm text-gray-400">
            Aplikacja dla biegaczy – analizy, treningi i postępy w jednym miejscu.
          </p>
        </div>

        {/* Ikony Social Media */}
        <div>
          <h3 className="text-lg font-medium mb-3">Social Media</h3>
          <div className="flex space-x-4 mt-2 text-gray-300">
            <a href="#" className="hover:text-white text-xl"><FaFacebookF /></a>
            <a href="#" className="hover:text-white text-xl"><FaInstagram /></a>
            <a href="#" className="hover:text-white text-xl"><FaYoutube /></a>
          </div>
        </div>

        {/* Kontakt */}
        <div>
          <h3 className="text-lg font-medium mb-3">Kontakt</h3>
          <p className="text-sm text-gray-400">kontakt@runpower.pl</p>
          <p className="text-sm text-gray-400 mt-1">+48 123 456 789</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-500 mt-10">
        &copy; {new Date().getFullYear()} Run Power. Wszelkie prawa zastrzeżone.
      </div>
    </footer>
  );
};

export default Footer;
