import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import Navbar from './Navbar';
import '../ComponentsCss/button.css';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, ArcElement } from 'chart.js';

Chart.register(CategoryScale, LinearScale);
Chart.register(PointElement);
Chart.register(LineElement);
Chart.register(ArcElement);


export default function Insights() {
  const [view, setView] = useState('weekly'); // Default view is weekly
  const [data, setData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clockRecords, setClockRecords] = useState([]);


  const [viewMode, setViewMode] = useState('standard');

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
  useEffect(() => {
    const fetchClockRecords = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/records`);
        setClockRecords(response.data);
      } catch (error) {
        console.error('Error fetching clock records:', error);
      }
    };
    fetchClockRecords();
    const intervalId = setInterval(fetchClockRecords, 5000);

    return () => clearInterval(intervalId);
  }, []);
  // Function to handle view change
  const handleViewChange = (selectedView) => {
    setView(selectedView);
    updateGraphData(selectedView);
    console.log(graphData);
  };
  const handleViewMode = (selectedView) => {
    setViewMode(selectedView);
  };

 // Function to get week number from date
const getWeekNumber = (date) => {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const currentWeek = Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return currentWeek + (date.getMonth() === 0 && currentWeek > 50 ? 1 : 0); // Adjust week number for the first week of the year
};


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
  // State for chart data
  const [graphData, setGraphData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Earnings',
        data: [],
        backgroundColor: 'white',
        borderColor: 'green',
        color:'white',
        borderWidth: 1,
        visible:'true'
      },
      {
        label: 'Expenses',
        data: [],
        backgroundColor: 'blue',
        borderColor: 'red',
        borderWidth: 1
      }
    ]
  });


const updateGraphData = () => {
  let earningsTotal = 0;
  let expensesTotal = 0;
  
  // Get current date
  const currentDate = new Date();

  switch (view) {
    case 'weekly':
      // Calculate start and end dates for the current week
      const weekStartDate = getWeekStartDate(getWeekNumber(currentDate), currentDate.getFullYear());
      const weekEndDate = getWeekEndDate(getWeekNumber(currentDate), currentDate.getFullYear());
      
      // Filter data for the current week
      const currentWeekData = calculateWeekIntervals().find(week => week.week === `${weekStartDate}-${weekEndDate}`);
      earningsTotal = currentWeekData ? currentWeekData.earnings : 0;
      
      // Calculate total expenses for the current week
      const currentWeekExpenses = calculateWeeklyExpenses().find(week => week.week === `${weekStartDate}-${weekEndDate}`);
      expensesTotal = currentWeekExpenses ? currentWeekExpenses.expenses : 0;
      break;
      
    case 'monthly':
      // Calculate current month and year
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Filter data for the current month
      const currentMonthData = calculateMonthIntervals().find(month => month.month === `${getMonthName(currentMonth)} ${currentYear}`);
      earningsTotal = currentMonthData ? currentMonthData.earnings : 0;
      
      // Calculate total expenses for the current month
      const currentMonthExpenses = calculateMonthExpenses().find(month => month.month === `${getMonthName(currentMonth)} ${currentYear}`);
      expensesTotal = currentMonthExpenses ? currentMonthExpenses.expenses : 0;
      break;
      
    case 'yearly':
      // Calculate current year
      const currentYearData = calculateYearIntervals().find(year => year.year === currentDate.getFullYear().toString());
      earningsTotal = currentYearData ? currentYearData.earnings : 0;
      
      // Calculate total expenses for the current year
      const currentYearExpenses = calculateYearExpense().find(year => year.year === currentDate.getFullYear().toString());
      expensesTotal = currentYearExpenses ? currentYearExpenses.expenses : 0;
      break;
      
    default:
      break;
  }
  
  const total = earningsTotal + expensesTotal;
  const earningsPercentage = (earningsTotal / total) * 100;
  const expensesPercentage = (expensesTotal / total) * 100;
  
  setGraphData({
    labels: ['Earnings', 'Expenses'],
    datasets: [
      {
        label: 'Earnings & Expenses',
        data: [earningsPercentage, expensesPercentage],
        backgroundColor: ['green', 'red'],
      },
    ],
  });
  
};






  return (
    <div style={{backgroundColor: 'black', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ position: 'relative', top: '2vw', left: '40vw', width: '41.2vw', color:'white' }}>
        <button style={{ marginRight: '12vw' }} className='buttongreen' onClick={() => handleViewMode('standard')}> EARNINGS/EXPENSES</button>

        <button className='buttongreen'onClick={() => handleViewMode('reports')}> REPORTS</button>
      </div>
      {viewMode=== 'reports' && (
        <div style={{ position: 'relative', top: '4vw', left: '20vw', width:'30vw', height:'30vw'}}>
        <Doughnut data={graphData} /> 
         
          </div>
      )}
      {viewMode === 'standard'&& ( 
      <div style={{color:'white'}}>
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
                <td>£ {(weekData.earnings - calculateWeeklyExpenses()[index].expenses).toFixed(2)}</td>
              </tr>
            ))}
            {view === 'monthly' && calculateMonthIntervals().map((monthData, index) => (
               <tr key={monthData.month}>
               <td>{monthData.month}</td>
               <td>£{monthData.earnings}</td>
               <td>£{calculateMonthExpenses()[index].expenses}</td>
               <td>£ {(monthData.earnings - calculateMonthExpenses()[index].expenses).toFixed(2)}</td>
             </tr>
              ))}
            {view === 'yearly' && calculateYearIntervals().map((yearData, index) => (
                 <tr key={yearData.year}>
                  <td>{yearData.year}</td>
                 <td>£{yearData.earnings}</td>
                 <td>£{calculateYearExpense()[index].expenses}</td>
                 <td>£{(yearData.earnings - calculateYearExpense()[index].expenses).toFixed(2)}</td>
                 </tr>
                ))}


          </tbody>
        </table>
      </div>
      
      </div>
      )}
      <div style={{ position: 'relative', top: '6vw', left: '30vw', width: '42vw', color:'white' }}>
        <button style={{ marginRight: '11.9vw', width: '5.9vw' }} className='buttongreen' onClick={() => handleViewChange('weekly')}>Weekly</button>
        <button style={{ marginRight: '11.75vw', width: '5.9vw' }} className='buttongreen' onClick={() => handleViewChange('monthly')}>Monthly</button>
        <button style={{ width: '5.9vw' }} className='buttongreen' onClick={() => handleViewChange('yearly')}>Yearly</button>
      </div>
    </div>
  );
}