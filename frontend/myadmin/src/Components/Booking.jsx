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
  const [editingIndex, setEditingIndex] = useState(null); // Index of the booking being edited
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
    setExpandedBooking(null);
  };

  const handleExpandBooking = (index) => {
    setExpandedBooking(index);
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

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleAddBooking = () => {
    setEditingIndex(null); // Reset editing index
    setValues({  // Reset form fields
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      no_guests: '',
      date: '',
      time: '',
      message: '',
    });
    setShowModal(true); // Open the modal when "Add Booking" button is clicked
  };

  const handleEditBooking = (index) => {
    const booking = data[index];
    setEditingIndex(index);
    // Set form fields with the values of the selected booking
    setValues({
      first_name: booking.first_name,
      last_name: booking.last_name,
      email: booking.email,
      phone: booking.phone,
      no_guests: booking.no_guests,
      date: booking.date,
      time: booking.time,
      message: booking.message,
    });
    setShowModal(true); // Open the modal for editing
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    for (const key in values) {
      if (values[key] === '' && key !== 'email' && key !== 'message') {
        alert(`${key.replace('_', ' ')} is required`);
        return;
      }
    }
    try {
      if (editingIndex !== null) {
        // If editingIndex is not null, it means we are updating an existing booking
        await axios.put(`http://localhost:8800/updatebooking/${data[editingIndex].id}`, values);
      } else {
        // Otherwise, we are adding a new booking
        await axios.post('http://localhost:8800/addbooking', values);
      }
      // Refresh data after adding/updating
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await axios.get(`http://localhost:8800/booking?date=${formattedDate}`);
      setData(response.data);
    } catch (err) {
      console.error(err);
    }
    setShowModal(false);
  };

  const handleDeleteBooking = async (id) => {
    try {
      await axios.delete(`http://localhost:8800/deletebooking/${id}`);
      // After successful deletion, refresh the data
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await axios.get(`http://localhost:8800/booking?date=${formattedDate}`);
      setData(response.data);
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const bookings = data.map((item, index) => (
    <React.Fragment key={index}>
      <tr onMouseEnter={() => handleExpandBooking(index)} onMouseLeave={handleCollapseBooking}>
        <td>{item.first_name}</td>
        <td>{item.last_name}</td>
        <td>{item.no_guests}</td>
        <td>{item.time}</td>
        <td><button className='buttongreen' onClick={() => handleEditBooking(index)}>Edit</button></td>
        <td><button className='buttonred' onClick={() => handleDeleteBooking(item.id)}>Delete</button></td>
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
          <button className='buttongreen' style={{ position: 'absolute', top: '40vw', left: '32vw' }} onClick={handleAddBooking}>ADD BOOKING</button>
        </div>
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={handleCloseModal}>&times;</span>
              <form onSubmit={handleSubmit}>
                {/* Form fields go here */}
                <input onChange={handleInput} required id='first_name' name='first_name' type="text" placeholder="First Name" value={values.first_name} />
                <input onChange={handleInput} required id='last_name' name='last_name' type="text" placeholder="Last Name" value={values.last_name} />
                <input onChange={handleInput} id='email' name='email' type="text" placeholder="E-mail" value={values.email} />
                <input onChange={handleInput} required id='phone' name='phone' type="text" placeholder="Phone" value={values.phone} />
                <input onChange={handleInput} required id='no_guests' name='no_guests' type="number" placeholder="Number of Guests" value={values.no_guests} />
                <input onChange={handleInput} required id='time' name='time' type="time" placeholder="Time" value={values.time} />
                <input onChange={handleInput} required id='date' name='date' type="date" placeholder="Date" value={values.date} />
                <input onChange={handleInput} id='message' name='message' type="text" placeholder="Requirements" value={values.message} />
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
