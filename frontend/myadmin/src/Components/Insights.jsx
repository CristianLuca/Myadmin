import React from 'react'
import '../ComponentsCss/button.css'
import Navbar from './Navbar'
export default function Insights() {
  return (
    <div style={{color: 'white', backgroundColor:'black', minHeight:'100vh'}}> 
      <Navbar />
      <div style={{position:'relative', top:'2vw', left:'30vw', width:'41.2vw'}}> 
      <button style={{marginRight:'12vw'}} className='buttongreen' > EARNINGS</button>
      <button  style={{marginRight:'12vw'}}  className='buttongreen'> EXPENSES</button>
      <button  className='buttongreen'> REPORTS</button>
      </div>
    </div>
  )
}

