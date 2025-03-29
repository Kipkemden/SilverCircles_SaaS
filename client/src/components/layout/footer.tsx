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
                <Link href="/about">
                  <a className="text-neutral-400 hover:text-white transition">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/team">
                  <a className="text-neutral-400 hover:text-white transition">Our Team</a>
                </Link>
              </li>
              <li>
                <Link href="/careers">
                  <a className="text-neutral-400 hover:text-white transition">Careers</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-neutral-400 hover:text-white transition">Contact</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog">
                  <a className="text-neutral-400 hover:text-white transition">Blog</a>
                </Link>
              </li>
              <li>
                <Link href="/help">
                  <a className="text-neutral-400 hover:text-white transition">Help Center</a>
                </Link>
              </li>
              <li>
                <Link href="/guidelines">
                  <a className="text-neutral-400 hover:text-white transition">Community Guidelines</a>
                </Link>
              </li>
              <li>
                <Link href="/stories">
                  <a className="text-neutral-400 hover:text-white transition">Success Stories</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms">
                  <a className="text-neutral-400 hover:text-white transition">Terms of Service</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-neutral-400 hover:text-white transition">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/cookies">
                  <a className="text-neutral-400 hover:text-white transition">Cookie Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/accessibility">
                  <a className="text-neutral-400 hover:text-white transition">Accessibility</a>
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
