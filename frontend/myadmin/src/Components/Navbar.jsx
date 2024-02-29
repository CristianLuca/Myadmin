import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../ComponentsCss/App.css'
import '../ComponentsCss/Fonts.css'

export default function Navbar() {
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = () => {
    setShowMenu(!showMenu);
  }

  return (
  
      
      <div style={{ position: 'flex', width: '100vw', height: '3vw', backgroundColor: 'white' }}>
        <Link to='/'> 
        <h1 className='gelasio' style={{ position: 'absolute', top: '0.4vw', left: '50vw', fontSize: '1.5vw' }}>
          MyManager
        </h1>
        </Link>
        <p className='gelasio' style={{ position: 'absolute', left: '9vw', top: '0.8vw' }}>
          Hello, user!
        </p>
        
          <img src='/src/menu.png' onClick={handleClick} style={{ position: 'absolute', left: '0.5vw', top: '0.5vw', width: '3vw', height: '2vw' }}></img>

        {showMenu && (
          <div style={{ position: 'absolute', top: '10vh', left: '0.5vw', display: 'flex', flexDirection: 'column', backgroundColor: 'black', color: 'white' }}>
        <Link to="/pos" className="gelasio navbar">
        <img src='./src/self-checkout.png' alt="self-checkout" className="navbarImageSize" />
        PoS
        </Link>
        <Link to="/insights" className="navbar gelasio" >
        <img src='./src/financial.png' alt="self-checkout" className="navbarImageSize" />
        Insights
        </Link>
        <Link to="/staff" className="navbar gelasio" >
        <img src='./src/staff.png' alt="self-checkout" className="navbarImageSize" />
        Staff
        </Link>
        <Link to="/booking" className="navbar gelasio" >
        <img src='./src/booking.png' alt="self-checkout" className="navbarImageSize" />
        Bookings
        </Link>
        <Link to="/stock" className="navbar gelasio" >
        <img src='./src/stock.png' alt="self-checkout" className="navbarImageSize" />
        Stock
        </Link>
          </div>
        )}
      </div>
    
  );
}




