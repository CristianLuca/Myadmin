import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../ComponentsCss/table.css'
import '../ComponentsCss/button.css'
import '../ComponentsCss/popup.css'

export default function Stock() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [values, setValues] = useState({
    product_name: '',
    expiry_date: '',
    quantity_left: '',
    unit: '',
    kg_unit: '',
    stock_level: '',
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/stock`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleEditStock = (index) => {
    const stock = data[index];
    setEditingIndex(index);
    setValues({
      product_name: stock.product_name,
      expiry_date: stock.expiry_date,
      quantity_left: stock.quantity_left,
      unit: stock.unit,
      kg_unit: stock.kg_unit,
      stock_level: stock.stock_level,
    });
    setShowModal(true);
  };

  const handleAddStock = () => {
    setValues({
      product_name: '',
      expiry_date: '',
      quantity_left: '',
      unit: '',
      kg_unit: '',
      stock_level: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingIndex !== null) {
        const stockId = data[editingIndex].id;
        await axios.put(`http://localhost:8800/updatestock/${stockId}`, values);
      } else {
        await axios.post('http://localhost:8800/addstock', values);
      }

      const response = await axios.get('http://localhost:8800/stock');
      setData(response.data);
    } catch (err) {
      console.error(err);
    }

    setShowModal(false);
  };

  const handleDeleteStock = async (id) => {
    try {
      await axios.delete(`http://localhost:8800/deletestock/${id}`);
      const response = await axios.get('http://localhost:8800/stock');
      setData(response.data);
    } catch (error) {
      console.error('Error deleting stock:', error);
    }
  };

  const stockRows = data.map((item, index) => (
    <tr key={index}>
      <td>{item.product_name}</td>
      <td>{item.expiry_date}</td>
      <td>{item.quantity_left}</td>
      <td>{item.unit}</td>
      <td>{item.kg_unit}</td>
      <td>{item.stock_level}</td>
      <td>
        <button className='buttongreen' onClick={() => handleEditStock(index)}>
          Edit
        </button>
      </td>
      <td>
        <button className='buttonred' onClick={() => handleDeleteStock(item.id)}>
          Delete
        </button>
      </td>
    </tr>
  ));

  return (
    <div style={{ backgroundColor: 'black', minHeight: '100vh' }}>
      <Navbar />
      <h1 style={{position:'relative', top:'2vw', width:'1vw', left:'50vw', color:'white', fontSize:'1.5vw'}}>Inventory</h1>
      <button
        className="buttongreen"
        style={{ position: 'absolute', top: '5vw', left: '11vw', color: 'white' }}
        onClick={handleAddStock}
      >
        ADD STOCK
      </button>
      {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={handleCloseModal}>&times;</span>
              <form onSubmit={handleSubmit}>
                {/* Form fields go here */}
                <input onChange={handleInput} required id='product_name' name='product_name' type="text" placeholder="Product Name" value={values.product_name} />
                <input onChange={handleInput} required id='expiry_date' name='expiry_date' type="date" placeholder="Expiry Date" value={values.expiry_date} />
                <input onChange={handleInput} required id='quantity_left' name='quantity_left' type="text" placeholder="Quantity" value={values.quantity_left} />
                <input onChange={handleInput} required id='unit' name='unit' type="text" placeholder="Unit(e.g Bag/Box)" value={values.unit} />
                <input onChange={handleInput} required id='kg_unit' name='kg_unit' type="text" placeholder="Kg/Buc per unit" value={values.kg_unit} />
                <input onChange={handleInput} required id='stock_level' name='stock_level' type="text" placeholder='Good/Low' value={values.stock_level} />
                <button onClick={handleSubmit} type="submit">Submit</button>
              </form>
            </div>
          </div>
        )}
      <div style={{ position: 'absolute', top: '10vw', left: '10vw', height: '40vw' }} className="table-container">
        <table style={{ width: '80vw' }} className="table gelasio">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Expiry date</th>
              <th>Quantity Left</th>
              <th>Unit</th>
              <th>Kg/Buc per Unit</th>
              <th>Stock Level</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>{stockRows}</tbody>
        </table>
      </div>
    </div>
  );
}
