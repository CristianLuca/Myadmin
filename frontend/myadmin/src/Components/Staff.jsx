import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Calendar from 'react-calendar';
import '../ComponentsCss/table.css';
import '../ComponentsCss/Fonts.css'
import '../ComponentsCss/button.css';
import '../ComponentsCss/popup.css';
import '../ComponentsCss/StaffCalendar.css';

export default function Staff() {
  const [data, setData] = useState([]);
  const [showModal, setshowModal] = useState(false);
  const [showAssignEmployeeModal, setShowAssignEmployeeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [showLoginModal, setLogin] = useState(false);
  const [view, setView] = useState('standard')
  const [clockedIn, setClockedIn] = useState(false)
  const [password, setPassword] = useState('');

  const [todayWorked, setTodayWorked] = useState({ totalHoursWorked: 0 });
  const [thisWeekWorked, setThisWeekWorked] = useState({totalHoursWorked: 0});
  const [values, setValues] = useState({
    employee: [], // Array to store selected employees
    first_name: '',
    last_name: '',
    initials: '',
    role: '',
    hours_worked: '',
    payrate: '',
    password:'',
  });
  // Inside your component function
const [selectedEmployee, setSelectedEmployee] = useState(null);
// Function to calculate total hours worked
const calculateHoursWorked = (clockInTime, clockOutTime) => {
  if (!clockInTime || !clockOutTime) {
    return 0;
  }

  // Parse the clock in and clock out times
  const startTime = new Date(clockInTime);
  const endTime = new Date(clockOutTime);

  // Calculate the difference in milliseconds
  const timeDiff = endTime - startTime;

  // Convert milliseconds to hours
  const hoursWorked = timeDiff / (1000 * 60 * 60);

  // Return the total hours worked
  return hoursWorked;
};
const earnings = async() => {
  // Fetch clock in record for today after clocking in
  if (clockedIn || !clockedIn) {
    const today = new Date().toISOString().split('T')[0]; // Get today's date
    const clockInResponse = await axios.get(`http://localhost:8800/clock-records?employee_id=${selectedEmployee.id}&date=${today}`);
    
    if (clockInResponse.status === 200) {
      const clockInRecord = clockInResponse.data;
      
      if (clockInRecord.length > 0) {
        // If clock in records exist for today
        let totalHoursWorked = 0;

        // Loop through all clock in records for today
        clockInRecord.forEach(record => {
          // Calculate hours worked for each entry
          const hoursWorked = calculateHoursWorked(record.clock_in_time, record.clock_out_time);
          
          // Add hours worked to total hours
          totalHoursWorked += hoursWorked;
        });

        // Set the total hours worked for today
        setTodayWorked({
          totalHoursWorked: totalHoursWorked,
        });
      } else {
        // If no clock in records exist for today, set total hours worked to 0
        setTodayWorked({
          totalHoursWorked: 0,
        });
      }
    } else {
      // Handle error fetching clock in record
    }
  }
      // Get today's date
      const today = new Date();

      // Calculate the difference in days between today and Monday
      const diff = today.getDay() === 1 ? 0 : (today.getDay() === 0 ? 6 : today.getDay() - 1);
      
      // Calculate the start of the week by subtracting the difference
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - diff);
      
      // Calculate the end of the week
      const endOfWeek = new Date(today);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
            // Format start and end dates in YYYY-MM-DD format
            const formattedStartDate = startOfWeek.toISOString().split('T')[0];
            const formattedEndDate = endOfWeek.toISOString().split('T')[0];
      
            // Fetch clock records for this week
            const clockRecordsResponse = await axios.get(`http://localhost:8800/clock-records-week?employee_id=${selectedEmployee.id}&start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
      
            if (clockRecordsResponse.status === 200) {
              const clockRecords = clockRecordsResponse.data;
      
              let totalHoursWorked = 0;
              console.log(clockRecords)
              // Loop through all clock records for this week
              clockRecords.forEach(record => {
                // Calculate hours worked for each entry
                const hoursWorked = calculateHoursWorked(record.clock_in_time, record.clock_out_time);
      
                // Add hours worked to total hours
        
                totalHoursWorked += hoursWorked;
                
                console.log(totalHoursWorked)
              });
      
              // Set the total hours worked for this week
              setThisWeekWorked({ totalHoursWorked: totalHoursWorked });
      
             
              
            } else {
              // Handle error fetching clock records for this week
            }
}
const handleClockInOut = async () => {
  try {
    const response = await axios.post(`http://localhost:8800/${clockedIn ? 'clock-out' : 'clock-in'}`, {
      employee_id: selectedEmployee.id,
      fullName: `${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
      time: new Date().toISOString() // Current time
    });

    if (response.status === 200) {
      setClockedIn(!clockedIn);
      earnings();
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

const handleEmployeeClick = (employee) => {
  
  setSelectedEmployee(employee);
  setLogin(true);
};
const handleLogOut = () => {
setLogin(false);
setView('standard');
setSelectedEmployee(null);
setPassword('');
setTodayWorked({totalHoursWorked: 0});
setThisWeekWorked({totalHoursWorked: 0})
}
const handlePasswordSubmit = async (event) => {
  event.preventDefault();
  try {
    const response = await axios.post('http://localhost:8800/verify-password', {
      id: selectedEmployee.id,
      password: password
    });
    if (response.data === 'success') {
      setView('loggedIn');
      setLogin(false);
      earnings();



      
    } else if (response.data === 'denied') {
      alert('Incorrect password. Please try again.');
    }
  } catch (error) {
    console.error('Error verifying password:', error);
  }
};


 
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
    setLogin(false);
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
    setshowModal(false);
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

  
  
  
 // Modify the staff mapping to make employee names clickable
const staff = data.map((item, index) => (
  <React.Fragment key={index}>
    <tr className='gelasio'>
      <td onClick={() => handleEmployeeClick(item)} style={{ cursor: 'pointer' }}>{item.first_name}</td>
      <td>{item.last_name}</td>
      <td>{item.initials}</td>
      <td>{item.role}</td>
      <td>{item.hours_worked}</td>
    </tr>
  </React.Fragment>
));



  return (
    <div className='gelasio' style={{ backgroundColor: 'black', minHeight: '100vh' }}>
      <Navbar />
      {showLoginModal && (
        <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={handleCloseModal}>&times;</span>
          <form onSubmit={handlePasswordSubmit} >
            {/* Form fields go here */}
           
            <input type="password" 
            placeholder="Enter password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} />

            <button  onClick={handlePasswordSubmit} type="submit">Submit</button>
          </form>
        </div>
      </div>
      )};
      {view == 'loggedIn' && (
        <div>
         
          <h1 style={{position:'relative', fontSize:'1.2vw', left:'45vw', width:'10vw', color:'white'}}> Hello, {selectedEmployee.first_name} {selectedEmployee.last_name}</h1>
          <button onClick={handleLogOut} className='buttonred' style={{position:'absolute',top:'0.1vw', left:'94vw'}}>LOG OUT </button>
          <button onClick={handleClockInOut} style={{position:'relative', color:'white', borderRadius:'20vw', border:'0.2vw green', backgroundColor: clockedIn ? 'red' : 'green', width:'12vw', height:'12vw', left:'42.8vw', top:'2vw' }}>{clockedIn ? "Clock Out" : "Clock In"}</button>
          <p style={{position:'relative', top:'-10vw',left:'15vw', fontSize:'1.4vw', color:'white', width:'13vw', textAlign:'center'}}> Hours Worked Today: </p>
          <p style={{ position:'relative', top:'-9vw',left:'17.5vw', fontSize:'4vw', color:'white', width:'1vw'}}>{todayWorked.totalHoursWorked.toFixed(8) ?? 0}  </p>
          <p style={{position:'relative', top:'-20vw',left:'70vw', fontSize:'1.4vw', color:'white', width:'13vw', textAlign:'center'}}> Hours Worked This Week: </p>
          <p style={{ position:'relative', top:'-19.3vw',left:'72.3vw', fontSize:'4vw', color:'white', width:'1vw'}}> {thisWeekWorked.totalHoursWorked.toFixed(2) ?? 0} </p>
          <p style={{position:'relative', top:'-3vw',left:'10vw', fontSize:'1.4vw', color:'white', width:'20vw', textAlign:'left'}}> Earnings this week: £{(thisWeekWorked.totalHoursWorked * selectedEmployee.payrate).toFixed(2)} </p>
          <p style={{position:'relative', top:'0vw',left:'10vw', fontSize:'1.4vw', color:'white', width:'20vw', textAlign:'left'}}> Earnings today: £{(todayWorked.totalHoursWorked * selectedEmployee.payrate).toFixed(2)} </p>
        </div>
      )}
  { view == 'standard' && (
    <div>
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
        .join(', ')
        
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
        <input onChange={handleInput} required id='password' name='password' type="Password" placeholder="Password for employee"  />
        <button  onClick={handleSubmit} type="submit">Submit</button>
      </form>
    </div>
  </div>
)}
      <div style={{ position: 'absolute', top: '36vw', left: '10vw', height: '15vw' }} className="table-container">
        <table style={{ width: '80vw' }} className="table gelasio">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Initials</th>
              <th>Role</th>
              <th>Hours worked this week</th>
              <th>Hours worked this Month</th>
            </tr>
          </thead>
          <tbody>
            {staff}
          </tbody>
        </table>
      
      </div>
</div> )}
    </div>
  );
}



