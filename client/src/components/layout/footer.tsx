import React from "react";
import { Link } from "wouter";
import { Logo } from "@/components/ui/logo";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo size="md" className="text-white" textClassName="text-white" />
            <p className="text-neutral-400 mb-4">Your Circle for Life's Next Chapter</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-secondary transition">
                <FaFacebookF />
              </a>
              <a href="#" className="text-white hover:text-secondary transition">
                <FaTwitter />
              </a>
              <a href="#" className="text-white hover:text-secondary transition">
                <FaInstagram />
              </a>
              <a href="#" className="text-white hover:text-secondary transition">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-neutral-400 hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-neutral-400 hover:text-white transition">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-neutral-400 hover:text-white transition">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-400 hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-neutral-400 hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-neutral-400 hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-neutral-400 hover:text-white transition">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/stories" className="text-neutral-400 hover:text-white transition">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-neutral-400 hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-neutral-400 hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-neutral-400 hover:text-white transition">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-neutral-400 hover:text-white transition">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Silver Circles. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
