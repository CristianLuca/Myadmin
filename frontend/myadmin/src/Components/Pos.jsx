import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Draggable from 'react-draggable';
import axios from 'axios';
import '../ComponentsCss/Fonts.css';
import '../ComponentsCss/popup.css';
import '../ComponentsCss/button.css';
import jsPDF from 'jspdf';


const Pos = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showTables, setShowTables] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [modifyMode, setModifyMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setPayModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [values, setValues] = useState({
    item_name: '',
    price: '',
    ingredients: '',
    category: ''
  });
  const [menu, setMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [orderItems, setOrderItems] = useState([]); // State to store order items
  const [orderItemsA, setOrderItemsA] = useState([])
  const totalPrice = orderItems.reduce((total, item) => total + parseFloat(item.price), 0);
  useEffect(() => {
    const fetchOrderItemsA = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/getorders`);
        const orders = response.data;
        setOrderItemsA(orders);
        
      } catch (error) {
        console.error('Error fetching order items:', error);
      }
    };
  
    fetchOrderItemsA();
  // Fetch order items every 5 seconds
  const intervalId = setInterval(fetchOrderItemsA, 1000);

  // Clear interval on component unmount to prevent memory leaks
  return () => clearInterval(intervalId);
}, []);
  
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get('http://localhost:8800/tables');
        setTables(response.data);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };

    fetchTables();
    
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8800/menu');
        setMenu(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleAddTable = async () => {
    try {
      const response = await axios.post('http://localhost:8800/tables', {
        name: `Table ${tables.length + 1}`,
        position: { x: 800, y: 500 },
        width: 200,
        height: 100,
      });

      setTables((prevTables) => [...prevTables, response.data]);
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const handleRemoveTable = async (id) => {
    try {
      await axios.delete(`http://localhost:8800/tables/${id}`);
      
      const response = await axios.get('http://localhost:8800/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Error removing table:', error);
    }
  };

  const handleTableClick = (tableName) => {
    if (modifyMode) return;
    setSelectedTable(tableName);
    setShowTables(false);
    fetchOrderItems(tableName)
  };

  const handleShowTables = () => {
    setSelectedTable(null);
    setShowTables(true);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = async (id, newPosition) => {
    try {
      await axios.put(`http://localhost:8800/tables/${id}`, { position: newPosition });
      setTables((prevTables) =>
        prevTables.map((table) => (table.id === id ? { ...table, position: newPosition } : table))
      );
    } catch (error) {
      console.error('Error updating table position:', error);
    }
    setIsDragging(false);
  };

  const toggleModifyMode = () => {
    setModifyMode(!modifyMode);
  };

  const handleDone = () => {
    setModifyMode(false);
  };

  const handleAddMenu = () => {
    setValues({
      item_name: '',
      price: '',
      ingredients: '',
      category: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleClosePayModal = () => {
    setPayModal(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      if (editingIndex !== null) {
        const menuId = menu[editingIndex].id;
        await axios.put(`http://localhost:8800/updatemenu/${menuId}`, values);
      } else {
        await axios.post('http://localhost:8800/addmenu', values);
      }
  
      const response = await axios.get('http://localhost:8800/menu');
      setMenu(response.data);
    } catch (err) {
      console.error(err);
    }
  
    setEditingIndex(null);
    setValues({
      item_name: '',
      price: '',
      ingredients: '',
      category: '',
    });
    setShowModal(false);
  };

  const handleDeleteMenu = async (id) => {
    try {
      await axios.delete(`http://localhost:8800/deletemenu/${id}`);
      const response = await axios.get('http://localhost:8800/menu');
      setMenu(response.data);
    } catch (error) {
      console.error('Error deleting stock:', error);
    }
  };
  
  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleEditMenu = (id) => {
    const index = menu.findIndex(item => item.id === id);
    if (index !== -1) {
      setEditingIndex(index);
      const menuItem = menu[index];
      setValues({
        item_name: menuItem.item_name,
        price: menuItem.price,
        ingredients: menuItem.ingredients,
        category: menuItem.category,
      });
      setShowModal(true);
    } else {
      console.error(`Menu item with id ${id} not found.`);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleAddToOrder = async (item_name, price, table_nr, date) => {
    date = new Date();
    try {
      await axios.post(`http://localhost:8800/add-to-order`, {
        item_name: item_name,
        price: price,
        table_nr: table_nr,
        status: 'active',
        date: date.toLocaleString(),
      });
      fetchOrderItems(table_nr);
      console.log(`Item: ${item_name}, Table Number: ${table_nr}, Price: ${price}, Status: active`);
    } catch (error) {
      console.error('Error adding product to order table:', error);
    }
  };

  const fetchOrderItems = async (tableName) => {
    try {
      const response = await axios.get(`http://localhost:8800/orders?table_nr=${tableName}`);
      const orders = response.data;
      setOrderItems(orders);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };
  const handleDeleteOrder = async (id) => {
    try {
      await axios.delete(`http://localhost:8800/deleteorders/${id}`);
      // Refetch order items after deletion
      fetchOrderItems(selectedTable);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };
  const generateBillContent = () => {
    const restaurantName = "Il Capitano's"; 
    const currentDate = new Date();
    const dateTimeString = currentDate.toLocaleString();
    let billContent = `${restaurantName}\n`;
    billContent += `Date and Time: ${dateTimeString}\n\n`;
    billContent += `Table: ${selectedTable}\n\n`;
    billContent += "Items:\n";
    orderItems.forEach((item, index) => {
      billContent += `${index + 1}. ${item.item_name} - £${item.price}\n`;
    });
    billContent += `\nTotal Price: £${totalPrice.toFixed(2)}`;
    return billContent;
  };

 // Function to handle printing the bill
const handlePrintBill = () => {
  const billContent = generateBillContent();

  // Create PDF document
  const doc = new jsPDF();
  doc.text(billContent, 10, 10);

  // Print PDF
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};
const handlePay = () =>{
setPayModal(true)
}

const handlePayment = async (payment_method) => {
  try {
    // Update status of orders to "inactive"
    await axios.put(`http://localhost:8800/updateorders`, {
      table_nr: selectedTable,
      status: 'inactive',
      payment_method: payment_method 
    });

    // Refetch order items after updating status
    fetchOrderItems(selectedTable);
  } catch (error) {
    console.error('Error updating order status:', error);
  }
  setPayModal(false)
  setShowTables(true)
};

  return (
    <div className='gelasio' style={{ backgroundColor: 'black', minHeight: '100vh', position: 'relative' }}>
      <Navbar />
      {showTables &&
        tables.map((table) => (
          <div key={table.id} onClick={() => handleTableClick(table.name)}>
            <Draggable
              disabled={!modifyMode}
              defaultPosition={table.position || { x: 0, y: 0 }}
              position={modifyMode ? table.position : undefined}
              onStart={modifyMode ? handleDragStart : undefined}
              onStop={(e, data) => handleDragStop(table.id, { x: data.x, y: data.y })}
            >
              <div
                style={{
                  textAlign: 'center',
                  position: 'absolute',
                  color:'white',
                  padding: '10px',
                  borderRadius: '5px',
                  backgroundColor: orderItemsA.some((item) => item.table_nr === table.name && item.status === 'active') ? 'red' : 'green',
                  width: '9%',
                  height: '9%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <span>{table.name} </span>
                {modifyMode && ( 
                  <button style={{marginLeft:'1vw', backgroundColor: 'red',width:'1.5vw', height:'1.5vw', fontSize:'1vw', color: 'white', borderRadius:'50%' }} onClick={() => handleRemoveTable(table.id)}>
                  -
                </button> )}
          </div>
          </Draggable>
        </div>
      ))}
    {!showTables && (
      <div style={{ position: 'absolute', top: '5vw', left: '7vw', width: '30vw', height: '46vw', backgroundColor: 'white', borderRadius: '0.5vw' }}>
        <button style={{ position: 'relative', fontSize: '1vw', top:'0.8vw', left:'0.8vw' }} onClick={handleShowTables}>
          {' '}
          <a  style={{ position: 'relative', size: '1vw' }}>&#8249; </a> TABLES{' '}
        </button>
        <p className='gelasio' style={{ position: 'relative', left: '13vw', top: '0vw' }}>
          {selectedTable}
        </p>
      <div style={{position:'relative', left:'1vw', width: '95%',height:'60vh', overflow:'scroll' }}> 
        <table style={{ width: '27vw'}}>
      <thead >
        <tr>
          <th style={{textAlign:'left'}}>Description</th>
          <th style={{textAlign:'right'}}>Price</th>
          
        </tr>
      </thead>
      <tbody>
        {/* Render order items */}
        {orderItems.map((item, index) => (
          <tr key={index}>
            <td>{item.item_name}</td>
            <td style={{textAlign:'right'}}>£{item.price}</td>
            <td ><button style={{width:'1.5vw', height:'1.5vw'}} onClick={() => handleDeleteOrder(item.id)}>
            <img src = '/src/delete.png'></img>
          </button> </td>
          </tr>
        ))}

      </tbody>
    </table>
    </div>
        <p style={{ position: 'absolute', top: '38vw', left: '12vw' }}> TOTAL: £{totalPrice} </p>
        <button onClick={handlePrintBill} className='buttongreen' style={{ position: 'absolute', width: '9vw', height: '2.5vw', top: '78vh', left: '3vw', color:'black' }}> BILL</button>
        
        <button onClick = {handlePay} className='buttongreen' style={{ position: 'absolute', width: '9vw', height: '2.5vw', top: '78vh', left: '18vw', color:'black' }}> PAY</button>
        {!modifyMode && <button  className= 'buttongreen' style={{position: 'absolute', top: '-4.9vw',left: '85vw',padding: '10px',color: 'black',borderRadius: '5px',cursor: 'pointer',width:'7vw' }} onClick={toggleModifyMode}>
          Modify Menu
        </button> }
        
        { modifyMode && (
          <div> 
            <button className= 'buttongreen' style={{position: 'absolute',top: '-4.9vw', left: '85vw', padding: '10px', color: 'black', borderRadius: '5px', cursor: 'pointer', width:'7vw'}} onClick={handleAddMenu}>
          Add Product
        </button>
          </div>
        )}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={handleCloseModal}>&times;</span>
              <form onSubmit={handleSubmit}>
              
                <input onChange={handleInput} required id='item_name' name='item_name' type="text" placeholder="Product Name" value={values.item_name} />
                <input onChange={handleInput} required id='price' name='price' type="text" placeholder="Price £" value={values.price} />
                <input onChange={handleInput} required id='ingredients' name='ingredients' type="text" placeholder="Ingredients used" value={values.ingredients} />
                <input onChange={handleInput} required id='category' name='category' type="text" placeholder="Category(e.g drinks, pizza, salad)" value={values.category} />
                <button onClick={handleSubmit} type="submit">Submit</button>             
              </form>
            </div>
          </div>
        )}
        {showPayModal && (
          <div className='modal'>
            <div style={{textAlign:'center'}} className='modal-content'>
            <span className="close" onClick={handleClosePayModal}>&times;</span>
            <button className='buttonred' onClick={() => handlePayment('card')} style={{ width:'6vw', height:'5vw', color:'black'}}> CARD</button>
            <button className= 'buttongreen' onClick={() => handlePayment('cash')} style = {{ marginLeft:'1vw', width:'6vw', height:'5vw', color:'black'}}>CASH</button>
            </div>
          </div>
        )}
        <div style={{position: 'relative',left:'31.2vw' ,top:'-36.5vw', width:'59vw'}}>
          {/* Render buttons for each category */}
          {Array.from(new Set(menu.map((item) => item.category))).map((category) => (
            <button className='buttongreen' style = {{justifyContent:'space-between', width:'8vw',backgroundColor:'white', marginRight:'1vw', marginTop:'1vw', padding:'1vw'}} key={category} onClick={() => handleCategoryClick(category)}>{category}</button>
          ))}
        </div>
        <div style={{position: 'relative',left:'31vw', top:'-30vw', width:'59vw'}}>
          {/* Render products based on the selected category */}
          {selectedCategory && menu.filter((item) => item.category === selectedCategory).map((item) => (
            <button  className= 'buttongreen' style = {{justifyContent:'space-between',marginLeft:'0.5vw', marginTop:'0.2vw', width:'9.5vw', height:'8vh', color:'white'}} key={item.id}> <span onClick={() => handleAddToOrder(item.item_name, item.price, selectedTable)}>{item.item_name}</span> <span style = {{color:'red'}}>£{item.price}</span>
            {modifyMode && (<div> 
              <button style={{ backgroundColor: 'red', marginRight: '0.3vw', marginLeft:'0vw', borderRadius:'50%', width:'1.5vw', height:'1.5vw', fontSize:'1vw' }} onClick={() => handleDeleteMenu(item.id)}>
            -
          </button>
          <button style={{ backgroundColor: 'grey', borderRadius:'50%', width:'1.5vw', height:'1.5vw', fontSize:'1vw' }} onClick={() => handleEditMenu(item.id)}>
            ...
          </button>
            </div> ) }
            
          </button>
          ))}
        </div>
      </div>
    )}
    {!modifyMode && showTables && (
      <button className='buttongreen'
        style={{
          position: 'absolute',
          top: '0.1vw',
          left: '90vw',
          padding: '10px',
          
          color: 'black',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={toggleModifyMode}
      >
        Modify Tables
      </button>
    )}
    {modifyMode && (
      <button className='buttongreen'
        style={{
          position: 'absolute',
          top: '0.1vw',
          left: '85vw',
          
          
          color: 'black',
          
          cursor: 'pointer',
        }}
        onClick={handleDone}
      >
        Done
      </button>
    )}
    {modifyMode && showTables && (
      <button className='buttongreen'
        style={{
          position: 'absolute',
          top: '0.1vw',
          left: '90vw',
          
          
          color: 'black',
          
          cursor: 'pointer',
        }}
        onClick={handleAddTable}
      >
        Add Table
      </button>
    )}
    
  </div>
  );
};

export default Pos;
