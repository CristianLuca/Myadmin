import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Pos from './Pos.jsx';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    
     
        <div style={{position:'absolute', top:'10vw', left:'0.5vw'}}>
        <nav style={{display: 'flex', flexDirection: 'column', backgroundColor: 'black', color:'white'}}>
        <button onClick={() => setIsOpen(!isOpen)} style={{marginBottom: '2vw', borderBottom: '0.1vw solid white', borderTop:'0.1vw solid white'}}>
        <img src='./src/self-checkout.png' alt="self-checkout" style={{width: '4vw', height: '4vw'}} />
        PoS
        </button>
        <button onClick={() => setIsOpen(!isOpen)} style={{marginBottom: '2vw', borderBottom: '0.1vw solid white'}} >
        <img src='./src/financial.png' alt="self-checkout" style={{width: '4vw', height: '4vw'}} />
        Insights
        </button>
        <button onClick={() => setIsOpen(!isOpen)} style={{marginBottom: '2vw', borderBottom: '0.1vw solid white'}} >
        <img src='./src/staff.png' alt="self-checkout" style={{width: '4vw', height: '4vw'}} />
        Staff
        </button>
        <button onClick={() => setIsOpen(!isOpen)} style={{marginBottom: '2vw', borderBottom: '0.1vw solid white'}} >
        <img src='./src/booking.png' alt="self-checkout" style={{width: '4vw', height: '4vw'}} />
        Bookings
        </button>
        <button onClick={() => setIsOpen(!isOpen)} style={{marginBottom: '2vw', borderBottom: '0.1vw solid white'}} >
        <img src='./src/stock.png' alt="self-checkout" style={{width: '4vw', height: '4vw'}} />
        Stock
        </button>
        
        </nav>
      
     
    </div>
    
  );
}