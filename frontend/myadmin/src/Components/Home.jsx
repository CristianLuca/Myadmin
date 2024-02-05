import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './ComponentsCss/fonts.css';
import Navigation from './Components/Navigation.jsx';

function Home(){
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = () => {
    setShowMenu(!showMenu);
    console.log('showMenu:', showMenu);
  }

  return( 
    <BrowserRouter>
      <div style={{position:'absolute', width:'100vw', height:'3vw', backgroundColor:'white'}}>
        <h1 className='gelasio' style={{position: 'absolute', top:'0.4vw', left:'50vw', fontSize:'1.5vw'}}> 
          MyManager
        </h1>
        <p className='gelasio' style={{position:'absolute', left:'9vw', top:'0.8vw'}}>
          Hello, user!
        </p>
        <Link to='/' onClick={handleClick}> 
          <img src='/src/menu.png' style={{position: 'absolute', left:'0.5vw', top:'0.5vw', width:'3vw', height:'2vw'}}></img>
        </Link>
        {showMenu && <Navigation />}
      </div>
      <div style={{backgroundColor:'black', width:'100vw', height:'56.9vw'}}></div>
    </BrowserRouter> 
  )
}

export default Home;