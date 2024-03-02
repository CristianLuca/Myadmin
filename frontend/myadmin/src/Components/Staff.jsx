import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Calendar from 'react-calendar';
import '../ComponentsCss/table.css';
import '../ComponentsCss/button.css';
import '../ComponentsCss/popup.css';
import '../ComponentsCss/StaffCalendar.css';

export default function Staff() {
  const [data, setData] = useState([]);
  const [showModal, setshowModal] = useState(false);
  const [showAssignEmployeeModal, setShowAssignEmployeeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [assignedStaff, setAssignedStaff] = useState([]);

  const [values, setValues] = useState({
    employee: [], // Array to store selected employees
    first_name: '',
    last_name: '',
    initials: '',
    role: '',
    hours_worked: '',
    payrate: '',
  });

  const handleInput = (event) => {
    setValues((prevValues) => ({
      ...prevValues,
      [event.target.name]: event.target.name === 'employee'
        ? Array.from(event.target.selectedOptions).map((option) => option.value)
        : event.target.value,
    }));
  };

  const handleAddStaff = () => {
    setshowModal(true);
  };

  const handleAssignEmployee = async (date) => {
    setSelectedDate(date);
    try {
      const response = await axios.get(`http://localhost:8800/assigned-staff?date=${date.toISOString()}`);
      setAssignedStaff(response.data);
    } catch (error) {
      console.error('Error fetching assigned staff:', error);
    }
    setShowAssignEmployeeModal(true);
  };
  

  const handleCloseModal = () => {
    setshowModal(false);
    setShowAssignEmployeeModal(false);
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
    setShowAddStaffModal(false);
  };

  const handleAssignEmployeeSubmit = async (event) => {
    event.preventDefault();

    // Check if any employee is selected
    if (values.employee.length === 0) {
      alert('Please select at least one employee.');
      return;
    }

    try {
      await axios.post('http://localhost:8800/assign-employees', {
        date: selectedDate,
        employees: values.employee,
      });
      // Handle success
    } catch (err) {
      console.error(err);
      // Handle error
    }

    setShowAssignEmployeeModal(false);
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

    fetchData();

    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

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
    <div style={{ backgroundColor: 'black', minHeight: '100vh' }}>
      <Navbar />
      <button
        className="buttongreen"
        style={{ position: 'absolute', top: '5vw', left: '11vw', color: 'white' }}
        onClick={handleAddStaff}
      >
        ADD STAFF
      </button>
      <Calendar
  className="react-staffcalendar"
  onClickDay={(value) => handleAssignEmployee(value)}
  tileContent={({ date, view }) => {
    if (view === 'month') {
      const initials = assignedStaff
        .filter(emp => new Date(emp.date).toDateString() === date.toDateString())
        .map(emp => emp.initials)
        .join(', ');
      return <p>{initials}</p>;
    }
  }}
/>

      {showAssignEmployeeModal && (
        <div className="assign-modal">
                    <div className="">
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <form onSubmit={handleAssignEmployeeSubmit}>
              <h2>Assign Employees for {selectedDate.toLocaleDateString()}</h2>
              <select name="employee" onChange={handleInput} value={values.employee} multiple>
                <option value="">Select an employee</option>
                {data.map((item, index) => (
                  <option key={index} value={item.id}>
                    {item.first_name} {item.last_name}
                  </option>
                ))}
              </select>
              <button type="submit">Assign Employees</button>
            </form>
          </div>
        </div>
      )}
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
        <input onChange={handleInput} required id='payrate' name='payrate' type="text" placeholder="Payrate" value={values.payrate} />
        <button  onClick={handleSubmit} type="submit">Submit</button>
      </form>
    </div>
  </div>
)}
      <div style={{ position: 'absolute', top: '35vw', left: '10vw', height: '15vw' }} className="table-container">
        <table style={{ width: '80vw' }} className="table gelasio">
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
  );
}



