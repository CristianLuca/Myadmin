import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import '../ComponentsCss/table.css';
import Calendar from 'react-calendar';
import '../ComponentsCss/Calendar.css';
import '../ComponentsCss/button.css';
import '../ComponentsCss/popup.css';

export default function Booking() {
  const [data, setData] = useState([]);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const collapseTimeoutRef = useRef(null);
  const [values, setValues] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    no_guests: '',
    date: '',
    time: '',
    message: '',
});
const handleInput = (event) => {
  setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
}
useEffect(() => {
  const fetchData = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await axios.get(`http://localhost:8800/booking?date=${formattedDate}`);
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
}, [selectedDate]);

  const handleCollapseBooking = () => {
    collapseTimeoutRef.current = setTimeout(() => {
      setExpandedBooking(null);
    }, 300);
  };

  const handleExpandBooking = (index) => {
    setExpandedBooking(index);
    clearTimeout(collapseTimeoutRef.current);
  };

  const handleMouseEnter = () => {
    clearTimeout(collapseTimeoutRef.current);
  };

  const handleMouseLeave = () => {
    collapseTimeoutRef.current = setTimeout(() => {
      setExpandedBooking(null);
    }, 300);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleAddBooking = () => {
    setShowModal(true); // Open the modal when "Add Booking" button is clicked
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

  const handleSubmit = async event => {
    event.preventDefault();
    try {
    await axios.post('http://localhost:8800/addbooking', values);
    console.log(values);
    } catch (err) {
      console.error(err);
    }
    setShowModal(false)
}
  const bookings = data.map((item, index) => (
    <React.Fragment key={index}>
      <tr onMouseEnter={() => handleExpandBooking(index)} onMouseLeave={handleCollapseBooking}>
        <td>{item.first_name}</td>
        <td>{item.last_name}</td>
        <td>{item.no_guests}</td>
        <td>{item.time}</td>
        <td><button>Edit</button></td>
        <td><button>Delete</button></td>
      </tr>
      {expandedBooking === index && (
        <tr onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <td colSpan="6">
            <div>
              Requirements: {item.message}<br />
              Phone: {item.phone}<br />
              Email: {item.email}<br />
              Date: {item.date}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  ));

  return (
    <div style={{ backgroundColor: 'black', minHeight: '100vh' }}>
      <Navbar />
      <div>
        <div>
          <Calendar
            className='react-calendar react-calendar__navigation react-calendar__navigation react-calendar__tile '
            onChange={handleDateChange}
            value={selectedDate}
          />
          <button className='button1' style={{ position: 'absolute', top: '40vw', left: '32vw' }} onClick={handleAddBooking}>ADD BOOKING</button>
        </div>
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={handleCloseModal}>&times;</span>
              <form onSubmit={handleSubmit}>
                {/* Form fields go here */}
                <input onChange={handleInput} id='first_name' name='first_name' type="text" placeholder="First Name" />
                <input onChange={handleInput} id='last_name' name='last_name' type="text" placeholder="Last Name" />
                <input onChange={handleInput} id='email' name='email' type="text" placeholder="E-mail" />
                <input onChange={handleInput} id='phone' name='phone' type="text" placeholder="Phone" />
                <input onChange={handleInput} id='no_guests' name='no_guests' type="number" placeholder="Number of Guests" />
                <input onChange={handleInput} id='time' name='time' type="time" placeholder="Time" />
                <input onChange={handleInput} id='date' name='date' type="date" placeholder="Date" />
                <input onChange={handleInput} id='message' name='message' type="text" placeholder="Requirments" />
                <button onClick={handleSubmit} type="submit">Submit</button>
              </form>
            </div>
          </div>
        )}
        <div className='table-container'>
          <table className='table gelasio'>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>No. People</th>
                <th>Time</th>
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
    </div>
  );
}
