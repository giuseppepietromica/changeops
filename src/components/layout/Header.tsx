import React, { useState, useEffect, useRef } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { User, authService } from '../../services/authService';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Chiudi il dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Genera le iniziali dell'utente per l'avatar
  const getUserInitials = (): string => {
    if (!user) return '?';

    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return '?';
  };

  // Determina una classe di colore per l'avatar in base al ruolo
  const getAvatarColorClass = (): string => {
    if (!user) return 'avatar-default';
    
    switch(user.role) {
      case 'admin':
        return 'avatar-admin';
      default:
        return 'avatar-user';
    }
  };

  return (
    <header className="app-header">
      <div className="brand">
        <strong>Change</strong><span>Ops</span>
      </div>
      
      <div className="header-right">
        {user && (
          <>
            <div className="user-info d-none d-md-flex align-items-center">
              <div className="user-details me-2">
                <div className="user-name">{user.firstName || user.username}</div>
                <div className="user-role">{user.role}</div>
              </div>
              
              <div ref={dropdownRef} className="position-relative">
                <div 
                  className={`user-avatar ${getAvatarColorClass()}`} 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {getUserInitials()}
                </div>
                
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <strong>{user.username}</strong>
                      <div className="text-muted small">{user.email}</div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-person me-2"></i> Profilo
                    </Link>
                    <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-gear me-2"></i> Impostazioni
                    </Link>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Versione mobile */}
            <div className="d-md-none">
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" bsPrefix="p-0" className="header-dropdown-toggle">
                  <div className={`user-avatar-sm ${getAvatarColorClass()}`}>
                    {getUserInitials()}
                  </div>
                </Dropdown.Toggle>
                
                <Dropdown.Menu>
                  <div className="px-3 py-2">
                    <strong>{user.username}</strong>
                    <div className="text-muted small">{user.email}</div>
                  </div>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/profile">
                    <i className="bi bi-person me-2"></i> Profilo
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/settings">
                    <i className="bi bi-gear me-2"></i> Impostazioni
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item className="text-danger" onClick={onLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
