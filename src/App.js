import React, { useState, useEffect, useRef } from "react";
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
  const [connectivity, setConnectivity] = useState('MQTT');
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState([]);
  const [time, setTime] = useState(5);
  const [intervalId, setIntervalId] = useState(null);
  const commandIndexRef = useRef(0);



  useEffect(() => {
    const fetchData = async () => {
      if (connectivity === 'MQTT') {
        try {
          const response = await fetch('http://snackboss-iot.in:8080/mqtt/getAllMacAddress');
          const data = await response.json();
          console.log('Fetched MAC addresses:', data);
          const onlineDevices = data.data.filter(device => device.lastHeartBeatTime && (Date.now() - new Date(device.lastHeartBeatTime).getTime()) < 5 * 60 * 1000); // Online if heartbeat within 5 minutes
          setDevices(onlineDevices);
          // if (onlineDevices.length > 0) {
          //   setDeviceId(onlineDevices[0].SNoutput);
          // }
        } catch (error) {
          console.error('Error fetching MAC addresses:', error);
        }
      }
    };
    fetchData();
  }, [connectivity]);

  const connectWebSocket = async () => {
    if (connectivity === 'MQTT' && deviceId && time >= 5 && time <= 99) {
      const websocket = new WebSocket('ws://snackboss-iot.in:6060');
      websocket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        // Start sending commands at intervals
        const id = setInterval(() => {
          const nextIndex = commandIndexRef.current % tableRows.length;
          let command = tableRows[nextIndex].command;
          if (command.startsWith('*V::') && command.endsWith(':1#')) {
            const match = command.match(/^\*V::(\d+):1#$/);
            if (match) {
              const randomNum = Math.floor(Math.random() * 100);
              command = `*V:${randomNum}:${match[1]}:1#`;
            }
          }
          const message = JSON.stringify({ topic: `GVC/KP/${deviceId}`, value:command });
          websocket.send(message);
          console.log(message);
          setTableRows(prevRows => prevRows.map((row, idx) => idx === nextIndex ? { ...row, count: row.count + 1, time: new Date().toLocaleTimeString() } : row));
          commandIndexRef.current = nextIndex + 1;
        }, time * 1000);
        setIntervalId(id);
      };
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(data);
          if (data.value && data.value.includes('Kwikpay')) {
            const replyStr = data.value;
            const parts = replyStr.split(',');
            const deviceIdExtracted = parts[0].substring(1);
            if(deviceIdExtracted == deviceId) {
              const reply = parts.slice(1).join(',');
              setTableRows(prev => prev.map(row => row.command === '*FW?#' ? { ...row, reply: reply, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));
            }
          } else if (data.value && data.value.includes('*SN')) {
            const replyStr = data.value;
            const parts = replyStr.split(',');
            const deviceIdExtracted = parts[0].substring(1);
            if(deviceIdExtracted == deviceId) {
              const reply = deviceIdExtracted;
              setTableRows(prev => prev.map(row => row.command === '*SN?#' ? { ...row, reply: reply, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));
            }
          } else if (data.value && data.value.includes('*V-OK')) {
            const replyStr = data.value;
            const parts = replyStr.split(',');
            const deviceIdExtracted = parts[0].substring(1);
            if(deviceIdExtracted == deviceId) {
              const reply = parts.slice(1).join(',');
              console.log("parts[1]",parts[1]);
              const replyParts = parts[1].split(',');
              console.log("replyParts",replyParts);
              const channel = replyParts[1]; // assuming format *V-OK,value,channel,...
              const commandToMatch = `*V::${channel}:1#`;
              setTableRows(prev => prev.map(row => row.command === commandToMatch ? { ...row, reply: reply, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));
            }
          } else {
            setTableRows(prev => prev.map(row => row.command === data.command ? { ...row, reply: data.reply, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));
          }
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
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
        commandIndexRef.current = 0;
      };
      setWs(websocket);
    } else {
      console.log('WebSocket connection requires MQTT connectivity, selected deviceId, and valid time (5-99)');
    }
  };

  const disconnectWebSocket = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const resetTable = () => {
    setTableRows([
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
  };

  useEffect(() => {
    return () => {
      if (ws) ws.close();
    };
  }, [ws]);
  return (
    <div className="container">

      <div className="top-buttons">
        <button className="start" onClick={connectWebSocket} disabled={isConnected || connectivity !== 'MQTT' || !deviceId || time < 5 || time > 99}>START</button>
        <button className="stop" onClick={disconnectWebSocket} disabled={!isConnected}>STOP</button>
        <button className="reset" onClick={resetTable}>RESET</button>
      </div>

      <div className="row-3">
        <div className="input-group">
          <label>Connectivity</label>
          <select value={connectivity} onChange={(e)=>setConnectivity(e.target.value)}>
            <option value="MQTT">MQTT</option>
            <option value="TCP">TCP</option>
            <option value="UART">UART</option>
            <option value="BLE">BLE</option>
          </select>
        </div>

        <div className="input-group">
          <label>Device ID (Only if server)</label>
          <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
            {devices.map((device, index) => (
              <option key={index} value={device.SNoutput}>{device.SNoutput}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Time: 5–99</label>
          <input type="number" value={time} onChange={(e) => setTime(Number(e.target.value))} min="5" max="99" />
        </div>
      </div>
       <div className="footer-box">
        <h2>TC-D</h2>
        <p>XXX</p>
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

     
    </div>
  );
}
