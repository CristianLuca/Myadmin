import axios from 'axios';
import Navbar from './Navbar'
import '../ComponentsCss/table.css'
import React, { useState, useEffect, useRef } from 'react';
import '../ComponentsCss/button.css'
import '../ComponentsCss/popup.css'


export default function Staff(){
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [values, setValues] = useState({
    first_name: '',
    last_name: '',
    initials: '',
    role: '',
    hours_worked: '',
   
  });
  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleAddStaff = () => {
    
    setValues({  // Reset form fields
    first_name: '',
    last_name: '',
    initials: '',
    role: '',
    hours_worked: '',
    });
    setShowModal(true); // Open the modal when "Add Booking" button is clicked
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    for (const key in values) {
      if (values[key] === '' && key !== 'hours_worked') {
        alert(`${key.replace('_', ' ')} is required`);
        return;
      }
    }
    try {
      
      
        await axios.post('http://localhost:8800/addstaff', values);
      
      setData(response.data);
    } catch (err) {
      console.error(err);
    }
    setShowModal(false);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const response = await axios.get(`http://localhost:8800/staff`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Fetch data initially when the component mounts
    fetchData();

    // Refresh data every 5 seconds
    const intervalId = setInterval(fetchData, 5000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  });
  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };
  const staff = data.map((item, index) => (
    <React.Fragment key={index}>
      <tr>
        <td>{item.first_name}</td>
        <td>{item.last_name}</td>
        <td>{item.initials}</td>
        <td>{item.role}</td>
        <td>{item.hours_worked}</td>
        
      </tr>
    </React.Fragment>
  ));
  return (
    <div style={{backgroundColor:'black', minHeight:'100vh'}}> 
      <Navbar />
      <button className='buttongreen' style={{ position: 'absolute', top: '5vw', left: '9.5vw', color:'white' }} onClick={handleAddStaff}>ADD STAFF</button>
      {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={handleCloseModal}>&times;</span>
              <form onSubmit={handleSubmit} >
                {/* Form fields go here */}
                <input onChange={handleInput} required id='first_name' name='first_name' type="text" placeholder="First Name" value={values.first_name} />
                <input onChange={handleInput} required id='last_name' name='last_name' type="text" placeholder="Last Name" value={values.last_name} />
                <input onChange={handleInput} id='initials' name='initials' type="text" placeholder="Employee Initials" value={values.initials} />
                <input onChange={handleInput} required id='role' name='role' type="text" placeholder="Role" value={values.role} />
                
                <button  onClick={handleSubmit} type="submit">Submit</button>
              </form>
            </div>
          </div>
        )}
      <div style={{position:'absolute', top:'35vw',left:'10vw', height:'10vw'}} className='table-container'>
          <table style={{width:'80vw'}} className='table gelasio'>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Initials</th>
                <th>Role</th>
                <th>Hours/week</th>
                <th>Hours/Month</th>
              </tr>
            </thead>
            <tbody>
              {staff}
            </tbody>
          </table>
        </div>
      
    </div>
  )
}

