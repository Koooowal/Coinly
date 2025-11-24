import React, { useEffect, useState } from 'react';
import './mainLayout.css';
import LeftBar from '../../Components/LeftBar/leftBar';
import { Outlet } from 'react-router';
import { IoMenu } from "react-icons/io5";

function MainLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  return (
    <div className={`main-layout ${isMenuOpen ? 'menu-open' : ''}`}>
      {/* Menu Icon (tylko mobile) */}
      {isMobile && (
        <div className="menu-icon" onClick={toggleMenu}>
          <IoMenu size={24} />
        </div>
      )}

      {/* Left Bar */}
      <div className={`left-bar-container ${isMobile ? (isMenuOpen ? 'open' : 'closed') : ''}`}>
        <LeftBar onLinkClick={closeMenu} />
      </div>

      {/* Overlay (tylko mobile gdy menu otwarte) */}
      {isMobile && isMenuOpen && (
        <div 
          className="menu-overlay" 
          onClick={closeMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998
          }}
        />
      )}

      {/* Content */}
      <div className='content'>
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;