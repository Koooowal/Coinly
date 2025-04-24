import React,{useEffect,useState} from 'react'
import './mainLayout.css'
import LeftBar from '../../Components/LeftBar/leftBar'
import { Outlet } from 'react-router'
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
  return (
    <div className='main-layout'>
       {isMobile && (
        <div className="menu-icon" onClick={toggleMenu}>
          <IoMenu size={24} />
        </div>
      )}
      <div className={`left-bar-container ${isMobile ? (isMenuOpen ? 'open' : 'closed') : ''}`}>
        <LeftBar />
      </div>
      <div className='content'>
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout;


