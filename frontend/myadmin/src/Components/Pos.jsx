import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Draggable, { DraggableCore } from 'react-draggable';
import { Resizable, ResizableBox } from 'react-resizable';
import axios from 'axios';

const Pos = () => {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    // Fetch tables from the database when the component mounts
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

  const handleAddTable = async () => {
    try {
      const response = await axios.post('http://localhost:8800/tables', {
        name: `Table ${tables.length + 1}`,
        position: { x: 50, y: 50 },
        width: 200, // Initial width
        height: 100, // Initial height
      });

      setTables((prevTables) => [...prevTables, response.data]);
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const handleDragStop = async (id, position) => {
    try {
      // Send the updated position to the server
      await axios.put(`http://localhost:8800/tables/${id}`, { position });
    } catch (error) {
      console.error('Error updating table position:', error);
    }
  };

  const handleResizeStop = async (id, size) => {
    try {
      // Send the updated size to the server
      await axios.put(`http://localhost:8800/tables/${id}`, { size });
    } catch (error) {
      console.error('Error updating table size:', error);
    }
  };

  return (
    <div style={{ backgroundColor: 'black', minHeight: '100vh', position: 'relative' }}>
      <Navbar />
      <h1 style={{ color: 'white' }}>Pos page</h1>

      {tables.map((table) => (
       <div>
       <Draggable
          key={table.id}
          defaultPosition={table.position || { x: 0, y: 0 }}
          onStop={(e, data) => handleDragStop(table.id, { x: data.x, y: data.y })}
        >
         
            <div
              style={{
                position: 'absolute',
                border: '2px solid white',
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: 'green',
                color: 'white',
                width: '10%',
                height: '10%',
              }}
            >
              {table.name}
            </div>
           
        </Draggable>
        </div>
      ))}

      <button
        style={{
          position: 'absolute',
          top: '5vw',
          left: '10vw',
          padding: '10px',
          backgroundColor: 'blue',
          color: 'white',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={handleAddTable}
      >
        Add Table
      </button>
    </div>
  );
};

export default Pos;
