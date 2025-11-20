import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

function App() {
  const [commandTime1, setCommandTime1] = useState('10:00 AM');
  const [commandTime2, setCommandTime2] = useState('11:00 AM');
  const [commandTime3, setCommandTime3] = useState('12:00 PM');
  const [commandTime4, setCommandTime4] = useState('1:00 PM');
  const [commandTime5, setCommandTime5] = useState('2:00 PM');
  
  return (
    <div className="App">
      <table style={{ borderCollapse: 'collapse', width: '100%', margin: '20px 0' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>TIME</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>COMMAND</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>COUNT</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>TIME</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>REPLY</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>COUNT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>1</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>John Doe</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>25</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>New York</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>john@example.com</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Active</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>2</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Jane Smith</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>30</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Los Angeles</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>jane@example.com</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Inactive</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>3</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Bob Johnson</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>35</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Chicago</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>bob@example.com</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Active</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>4</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Alice Brown</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>28</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Houston</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>alice@example.com</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Active</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>5</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Charlie Wilson</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>40</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Phoenix</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>charlie@example.com</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>Inactive</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
