import React, { useState } from 'react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
        <nav>
        <button onClick={() => setIsOpen(!isOpen)} style={{backgroundColor: 'white'}}>
        Menu
        </button>
        <button onClick={() => setIsOpen(!isOpen)} style={{backgroundColor: 'white'}}>
        PoS </button>
        </nav>
      
     
    </div>
  );
}