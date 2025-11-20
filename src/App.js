import React, { useState, useEffect } from "react";
import "./App.css";

export default function TestLayout() {
  const [tableRows, setTableRows] = useState([
    { time: '00:00', command: '*FW?#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*SN?#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::1:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::2:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::3:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::4:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::5:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::6:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::7:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState(null);
  const [connectivity, setConnectivity] = useState('TCP');

  const connectWebSocket = () => {
    const websocket = new WebSocket('ws://snackboss-iot.in:6060');
    websocket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data);
        setTableRows(prev => prev.map(row => row.command === data.command ? { ...row, reply: data.reply, replyCount: row.replyCount + 1 } : row));
      } catch (e) {
        console.error('Invalid message', e);
      }
    };
    websocket.onerror = (error) => {
      console.error('WebSocket error', error);
    };
    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    setWs(websocket);
  };

  const disconnectWebSocket = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
  };

  const resetTable = () => {
    setTableRows([
      { time: '00:00', command: '*FW?#', count: 0, replyTime: '00:40', reply: '-', replyCount: 0 },
      { time: '00:10', command: '*SN?#', count: 0, replyTime: '—', reply: '-', replyCount: 0 },
      { time: '00:20', command: '*V::1:1#', count: 0, replyTime: '—', reply: '-', replyCount: 0 },
      { time: '00:30', command: '*V::2:1#', count: 0, replyTime: '—', reply: '-', replyCount: 0 },
    ]);
  };

  useEffect(() => {
    return () => {
      if (ws) ws.close();
    };
  }, [ws]);
  return (
    <div className="container">

      <div className="top-buttons">
        <button className="start" onClick={connectWebSocket} disabled={isConnected}>START</button>
        <button className="stop" onClick={disconnectWebSocket} disabled={!isConnected}>STOP</button>
        <button className="reset" onClick={resetTable}>RESET</button>
      </div>

      <div className="row-3">
        <div className="input-group">
          <label>Connectivity</label>
          <select>
            <option>MQTT</option>
            <option>TCP</option>
            <option>UART</option>
            <option>BLE</option>
          </select>
        </div>

        <div className="input-group">
          <label>Device ID (Only if server)</label>
          <input type="text" placeholder="Enter Device ID" />
        </div>

        <div className="input-group">
          <label>Time: 5–99</label>
          <input type="number" />
        </div>
      </div>

      {/* TABLE HEADER with 6 columns */}
      <div className="table-header">
        <div>Time</div>
        <div>Command</div>
        <div>Count</div>
        <div>Time</div>
        <div>Reply</div>
        <div>Count</div>
      </div>

      {tableRows.map((row, index) => (
        <div key={index} className="table-row">
          <div>{row.time}</div>
          <div>{row.command}</div>
          <div>{row.count}</div>
          <div>{row.replyTime}</div>
          <div>{row.reply}</div>
          <div>{row.replyCount}</div>
        </div>
      ))}

      <div className="footer-box">
        <h2>TC-D</h2>
        <p>XXX</p>
      </div>

    </div>
  );
}
