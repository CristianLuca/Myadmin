import React from 'react'

import Navbar from './Navbar'
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Booking()  {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data from the server
    axios.get('http://localhost:8800/booking')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);
  var bookings = "";
  bookings = data.map( (item, index) => {
    return (
      <tr key={index}>
        <td>{item.first_name}</td>
        <td>{item.last_name}</td>
        <td>{item.email}</td>
        <td>{item.phone}</td>
        <td>{item.no_guests}</td>
        <td>{item.date}</td>
        <td>{item.time}</td>
        <td>{item.message}</td>
        <td> <button>Edit</button></td>
        <td> <button>Delete</button></td>
      </tr>
    )
  })
  return (
    <div style={{backgroundColor:'black', minHeight:'100vh'}}> 
      <Navbar />
      <div style={{color:'white'}}>
        <table style={{borderColor:'white'}} className='table-auto border-spacing-2 border-collapse content-center'>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>No. People</th>
              <th>Date</th>
              <th>Time</th>
              <th>Requirments</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {bookings}
          </tbody>
        </table>
      </div>
    </div>
    
  )
}
