import axios from 'axios';
import '../ComponentsCss/button.css';
import Navbar from './Navbar';
import React, { useState, useEffect } from 'react';

export default function Insights() {
  const [view, setView] = useState('weekly'); // Default view is weekly
  const [data, setData] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/getorders`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);  // Empty array means it only runs once after initial render
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/stock`);
        setExpenses(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []); // Empty array means it only runs once after initial render

  // Function to handle view change
  const handleViewChange = (selectedView) => {
    setView(selectedView);
  };

 // Function to get week number from date
const getWeekNumber = (date) => {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const currentWeek = Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return currentWeek + (date.getMonth() === 0 && currentWeek > 50 ? 1 : 0); // Adjust week number for the first week of the year
};

// Function to calculate week intervals
// Function to calculate week intervals
const calculateWeekIntervals = () => {
  const years = {};

  data.forEach((order) => {
    const date = new Date(order.date);
    const year = date.getFullYear();
    const weekNumber = getWeekNumber(date);

    if (!years[year]) {
      years[year] = {};
    }

    if (!years[year][weekNumber]) {
      years[year][weekNumber] = [];
    }

    years[year][weekNumber].push(order);
    
  });

  const weekIntervals = [];
  for (const year in years) {
    for (const weekNumber in years[year]) {
      const weekStartDate = getWeekStartDate(parseInt(weekNumber, 10), parseInt(year, 10));
      const weekEndDate = getWeekEndDate(parseInt(weekNumber, 10), parseInt(year, 10));
      const earnings = years[year][weekNumber].reduce((total, order) => total + parseFloat(order.price), 0)|| 0;
      weekIntervals.push({ week: `${weekStartDate}-${weekEndDate}`, earnings });
    }
  }
  

  return weekIntervals;
};



// Function to get the start date of the week
const getWeekStartDate = (weekNumber, year) => {
  const januaryFirst = new Date(year, 0, 1);
  const weekStart = januaryFirst.setDate(1 - (januaryFirst.getDay() + 6) % 7 + (weekNumber - 1) * 7);
  const startDate = new Date(weekStart);
  const month = startDate.getMonth() + 1;
  const day = startDate.getDate();
  return `${day}`;
};

// Function to get the end date of the week
const getWeekEndDate = (weekNumber, year) => {
  const januaryFirst = new Date(year, 0, 1);
  const weekStart = januaryFirst.setDate(1 - (januaryFirst.getDay() + 6) % 7 + (weekNumber - 1) * 7);
  const endDate = new Date(weekStart);
  endDate.setDate(endDate.getDate() + 6);
  const month = endDate.getMonth() + 1;
  const day = endDate.getDate();
  return `${day}/${month}/${year}`;
};

// Function to calculate month intervals
const calculateMonthIntervals = () => {
  // Assuming dates are in format MM/DD/YYYY
  const months = {};
  data.forEach((order) => {
    const date = new Date(order.date);
    const monthYearKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
    if (!months[monthYearKey]) {
      months[monthYearKey] = [];
    }
    months[monthYearKey].push(order);
  });

  return Object.keys(months).map((monthYearKey) => {
    const [month, year] = monthYearKey.split('/');
    const monthName = getMonthName(parseInt(month, 10));
    return {
      month: `${monthName} ${year}`,
      earnings: months[monthYearKey].reduce((total, order) => total + parseFloat(order.price), 0),
    };
  });
};

// Function to get month name from month number
const getMonthName = (monthNumber) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[monthNumber - 1];
};
// Function to calculate yearly intervals
const calculateYearIntervals = () => {
  const years = {};
  data.forEach((order) => {
    const date = new Date(order.date);
    const year = date.getFullYear();
    if (!years[year]) {
      years[year] = [];
    }
    years[year].push(order);
  });

  return Object.keys(years).map((year) => ({
    year: year,
    earnings: years[year].reduce((total, order) => total + parseFloat(order.price), 0),
  }));
};
  // Function to render the table header based on the selected view
  const renderTableHeader = () => {
    switch (view) {
      case 'weekly':
        return (
          <tr>
            <th >Week</th>
            <th>Earnings</th>
            <th>Expenses</th>
            <th>Profit</th>
          </tr>
        );
      case 'monthly':
        return (
          <tr>
            <th>Month</th>
            <th>Earnings</th>
            <th>Expenses</th>
            <th>Profit</th>
          </tr>
        );
      case 'yearly':
        return (
          <tr>
            <th>Year</th>
            <th>Earnings</th>
            <th>Expenses</th>
            <th>Profit</th>
          </tr>
        );
      default:
        return null;
    }
  };
  const calculateWeeklyExpenses = () => {
    const years = {};
  
    expenses.forEach((expense) => {
      const date = new Date(expense.bought_date);
      const year = date.getFullYear();
      const weekNumber = getWeekNumber(date);
  
      if (!years[year]) {
        years[year] = {};
      }
  
      if (!years[year][weekNumber]) {
        years[year][weekNumber] = [];
      }
  
      years[year][weekNumber].push(expense);
    });
  
    const weekIntervals = [];
    for (const year in years) {
      for (const weekNumber in years[year]) {
        const weekStartDate = getWeekStartDate(parseInt(weekNumber, 10), parseInt(year, 10));
        const weekEndDate = getWeekEndDate(parseInt(weekNumber, 10), parseInt(year, 10));
        const totalExpense = years[year][weekNumber].reduce((total, expense) => total + parseFloat(expense.paid), 0);
        weekIntervals.push({ week: `${weekStartDate}-${weekEndDate}`, expenses: totalExpense });
      }
    }
  
    return weekIntervals;
  };
  const calculateMonthExpenses = () => {
    // Assuming dates are in format MM/DD/YYYY
    const months = {};
    expenses.forEach((expense) => {
      const date = new Date(expenses.date);
      const monthYearKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!months[monthYearKey]) {
        months[monthYearKey] = [];
      }
      months[monthYearKey].push(expense);
    });
  
    return Object.keys(months).map((monthYearKey) => {
      const [month, year] = monthYearKey.split('/');
      const monthName = getMonthName(parseInt(month, 10));
      return {
        month: `${monthName} ${year}`,
        expenses: months[monthYearKey].reduce((total, expense) => total + parseFloat(expense.paid), 0),
      };
    });
  };
  // Function to calculate yearly intervals
const calculateYearExpense = () => {
  const years = {};
  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const year = date.getFullYear();
    if (!years[year]) {
      years[year] = [];
    }
    years[year].push(expense);
  });

  return Object.keys(years).map((year) => ({
    year: year,
    expenses: years[year].reduce((total, expense) => total + parseFloat(expense.paid), 0),
  }));
};

  return (
    <div style={{ color: 'white', backgroundColor: 'black', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ position: 'relative', top: '2vw', left: '30vw', width: '41.2vw' }}>
        <button style={{ marginRight: '12vw' }} className='buttongreen'> EARNINGS</button>
        <button style={{ marginRight: '12vw' }} className='buttongreen'> EXPENSES</button>
        <button className='buttongreen'> REPORTS</button>
      </div>
      <div style={{ position: 'relative', top: '4vw', left: '10vw', height: '36vw', width: '80vw' }} className="table-container">
        <table style={{ width: '80vw' }} className="table gelasio">
          <thead>
            {renderTableHeader()}
          </thead>
          <tbody>
            {view === 'weekly' && calculateWeekIntervals().map((weekData, index) => (
              <tr key={weekData.week}>
                <td>{weekData.week}</td>
                <td>£{weekData.earnings}</td>
                <td>£{calculateWeeklyExpenses()[index].expenses}</td>
                <td>£ {weekData.earnings - calculateWeeklyExpenses()[index].expenses}</td>
              </tr>
            ))}
            {view === 'monthly' && calculateMonthIntervals().map((monthData, index) => (
               <tr key={monthData.month}>
               <td>{monthData.month}</td>
               <td>£{monthData.earnings}</td>
               <td>£{calculateMonthExpenses()[index].expenses}</td>
               <td>£ {monthData.earnings - calculateMonthExpenses()[index].expenses}</td>
             </tr>
              ))}
            {view === 'yearly' && calculateYearIntervals().map((yearData, index) => (
                 <tr key={yearData.year}>
                  <td>{yearData.year}</td>
                 <td>£{yearData.earnings}</td>
                 <td>£{calculateYearExpense()[index].expenses}</td>
                 <td>£{yearData.earnings - calculateYearExpense()[index].expenses}</td>
                 </tr>
                ))}


          </tbody>
        </table>
      </div>
      <div style={{ position: 'relative', top: '6vw', left: '30vw', width: '42vw' }}>
        <button style={{ marginRight: '11.9vw', width: '5.9vw' }} className='buttongreen' onClick={() => handleViewChange('weekly')}>Weekly</button>
        <button style={{ marginRight: '11.75vw', width: '5.9vw' }} className='buttongreen' onClick={() => handleViewChange('monthly')}>Monthly</button>
        <button style={{ width: '5.9vw' }} className='buttongreen' onClick={() => handleViewChange('yearly')}>Yearly</button>
      </div>
    </div>
  );
}