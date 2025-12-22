import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function TestLayout() {
  const [tableRows, setTableRows] = useState([
    { time: '00:00', command: '*CC#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*PT:dashboard:0000:N#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*FW?#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*SN?#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*RSSI?#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::1:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::2:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::3:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::4:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::5:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::6:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
    { time: '00:00', command: '*V::7:1#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
  ]);

  const [tcResponse,setTcResponse]=useState({time:'00:00',count:0,reply:'-'});
  const [hbtResponse,setHBTResponse]=useState({time:'00:00',count:0,reply:'-'});

  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState(null);
  const [connectivity, setConnectivity] = useState('MQTT');
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState([]);
  const [time, setTime] = useState(3);
  const [intervalId, setIntervalId] = useState(null);
  const commandIndexRef = useRef(0);
  const [bleDevice, setBleDevice] = useState(null);
  const [bleServer, setBleServer] = useState(null);
  const [bleCharacteristic, setBleCharacteristic] = useState(null);


  const OptionAUrl="ws://snackboss-iot.in:1010";
  const OptionBUrl="ws://snackboss-iot.in:2020";
  const OptionCUrl="ws://snackboss-iot.in:6060";

  // New state for three select options
  const [mqttServer, setMqttServer] = useState("A");
 
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

  const handleStart = () => {
    if (connectivity === 'MQTT') {
      connectWebSocket();
    } else if (connectivity === 'BLE') {
      connectBLE();
    } else {
      console.log('Connectivity type not supported yet');
    }
  };

  const handleStop = () => {
    if (connectivity === 'MQTT') {
      disconnectWebSocket();
    } else if (connectivity === 'BLE') {
      disconnectBLE();
    }
  };

  const connectWebSocket = async () => {

    let url='';
    if(mqttServer=='A')
    {
      url=OptionAUrl;
    }
    else if(mqttServer=='B')
    {
      url=OptionBUrl;
    }
    else if(mqttServer=='C')
    {
      url=OptionCUrl;
    }

    if (connectivity === 'MQTT' && deviceId && time >= 3 && time <= 99) {
      const websocket = new WebSocket(url);
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
          let DeviceId=deviceId;
          if(!deviceId.includes('NA-1507-'))
          {
            DeviceId=`NA-1507-${deviceId}`
          }
          const message = JSON.stringify({ topic: `GVC/KP/${DeviceId}`, value:command });
          websocket.send(message);
          console.log(message);
          setTableRows(prevRows => prevRows.map((row, idx) => idx === nextIndex ? { ...row, count: row.count + 1, time: new Date().toLocaleTimeString() } : row));
          commandIndexRef.current = nextIndex + 1;
        }, time * 1000);
        setIntervalId(id);
      };
      websocket.onmessage = (event) => {
        try {
          let DeviceId=deviceId;
          if(!deviceId.includes('NA-1507-'))
          {
            DeviceId=`NA-1507-${deviceId}`
          }
          const data = JSON.parse(event.data);
          console.log(data);
          if (data.value && data.value.includes('Kwikpay')) {
            const replyStr = data.value;
            const parts = replyStr.split(',');
            const deviceIdExtracted = parts[0].substring(1);
            if(deviceIdExtracted == DeviceId) {
              const reply = parts.slice(1).join(',');
              setTableRows(prev => prev.map(row => row.command === '*FW?#' ? { ...row, reply: reply, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));
            }
          } else if (data.value && data.value.includes('*SN')) {
            const replyStr = data.value;
            const parts = replyStr.split(',');
            const deviceIdExtracted = parts[0].substring(1);
            if(deviceIdExtracted == DeviceId) {
              const reply = deviceIdExtracted;
              setTableRows(prev => prev.map(row => row.command === '*SN?#' ? { ...row, reply: reply, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));
            }
          } else if (data.value && data.value.includes('*V-OK')) {
            const replyStr = data.value;
            const parts = replyStr.split(',');
            const deviceIdExtracted = parts[0].substring(1);
            if(deviceIdExtracted == DeviceId) {
              const reply = parts.slice(1).join(',');
              const replyParts = reply.split(',');
              const channel = replyParts[2]; // *V-OK,value,channel,...
              const commandToMatch = `*V::${channel}:1#`;
              setTableRows(prev => prev.map(row => row.command === commandToMatch ? { ...row, reply: reply, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));
            }
          } else if (data.value && data.value.includes('*T-OK')) {
            const replyStr = data.value;
            const parts = replyStr.split(',');
            const deviceIdExtracted = parts[0].substring(1);
            if(deviceIdExtracted == DeviceId) {
              const reply = parts.slice(1).join(',');
              const replyParts = reply.split(',');
              const channel = replyParts[2]; // *V-OK,value,channel,...
              const commandToMatch = `*V::${channel}:1#`;
              setTableRows(prev => prev.map(row => row.command === commandToMatch ? { ...row, reply: reply, replyCount: row.replyCount, replyTime: new Date().toLocaleTimeString() } : row));
            }
          } else if (data.value && data.value.includes('*TC-D')) {
            const replyStr = data.value;
            const parts = replyStr.split(',');
            const deviceIdExtracted = parts[0].substring(1);
            if(deviceIdExtracted == DeviceId) {
              const reply = parts.slice(1).join(',');
              setTcResponse(prev => ({ ...prev, time: new Date().toLocaleTimeString(), count: prev.count + 1 ,reply:reply}));
            }
          }else if (data.value && data.value.includes('*HBT')) {
            const replyStr = data.value;
            const parts = replyStr.split(',');
            const deviceIdExtracted = parts[0].substring(1);
            if(deviceIdExtracted == DeviceId) {
              const reply = parts.slice(1).join(',');
              setHBTResponse(prev => ({ ...prev, time: new Date().toLocaleTimeString(), count: prev.count + 1 ,reply:reply}));
            }
          } else if (data.value && data.value.includes('*RSSI')) {
             const replyStr = data.value;

              setTableRows(prev => prev.map(row => row.command === '*RSSI?#' ? { ...row, reply: replyStr, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));

          }else if (data.value && data.value.includes('*CC-OK')) {
             const replyStr = data.value;

              setTableRows(prev => prev.map(row => row.command === '*CC#' ? { ...row, reply: replyStr, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));

          }else if (data.value && data.value.includes('*PT-OK')) {
             const replyStr = data.value;

              setTableRows(prev => prev.map(row => row.command === '*PT:dashboard:0000:N#' ? { ...row, reply: replyStr, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));

          }else {
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

  const connectBLE = async () => {
    if (!navigator.bluetooth) {
      console.error('Web Bluetooth API not supported');
      return;
    }
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "ESP" }],
        optionalServices: [
          "00001801-0000-1000-8000-00805f9b34fb"
        ]
      });
      setBleDevice(device);
      const server = await device.gatt.connect();
      setBleServer(server);
      const services = await server.getPrimaryServices("00001801-0000-1000-8000-00805f9b34fb");
      let selectedCharacteristic = null;
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write && char.properties.notify) {
            selectedCharacteristic = char;
            break;
          }
        }
        if (selectedCharacteristic) break;
      }
      if (!selectedCharacteristic) {
        console.error('No suitable characteristic found');
        return;
      }
      setBleCharacteristic(selectedCharacteristic);
      await selectedCharacteristic.startNotifications();
      selectedCharacteristic.addEventListener('characteristicvaluechanged', handleBleMessage);
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
        const encoder = new TextEncoder();
        const data = encoder.encode(command);
        selectedCharacteristic.writeValue(data);
        console.log('Sent BLE command:', command);
        setTableRows(prevRows => prevRows.map((row, idx) => idx === nextIndex ? { ...row, count: row.count + 1, time: new Date().toLocaleTimeString() } : row));
        commandIndexRef.current = nextIndex + 1;
      }, time * 1000);
      setIntervalId(id);
    } catch (error) {
      console.error('BLE connection error:', error);
    }
  };

  const handleBleMessage = (event) => {
    const value = event.target.value;
    const decoder = new TextDecoder();
    const replyStr = decoder.decode(value);
    console.log('BLE reply:', replyStr);
    if (replyStr.includes('Kwikpay')) {
      const parts = replyStr.split(',');
      const reply = parts.slice(1).join(',');
      setTableRows(prev => prev.map(row => row.command === '*FW?#' ? { ...row, reply: reply, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));
    } else if (replyStr.includes('*SN')) {
      const parts = replyStr.split(',');
      const reply = parts[0].substring(1);
      setTableRows(prev => prev.map(row => row.command === '*SN?#' ? { ...row, reply: reply, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));
    } else if (replyStr.includes('*V-OK')) {
      const parts = replyStr.split(',');
      const reply = parts.slice(1).join(',');
      const replyParts = reply.split(',');
      const channel = replyParts[2];
      const commandToMatch = `*V::${channel}:1#`;
      setTableRows(prev => prev.map(row => row.command === commandToMatch ? { ...row, reply: reply, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));
    } else if (replyStr.includes('*T-OK')) {
      const parts = replyStr.split(',');
      const reply = parts.slice(1).join(',');
      const replyParts = reply.split(',');
      const channel = replyParts[2];
      const commandToMatch = `*V::${channel}:1#`;
      setTableRows(prev => prev.map(row => row.command === commandToMatch ? { ...row, reply: reply, replyCount: row.replyCount, replyTime: new Date().toLocaleTimeString() } : row));
    } else if (replyStr.includes('*TC-D')) {
      const parts = replyStr.split(',');
      const reply = parts.slice(1).join(',');
      setTcResponse(prev => ({ ...prev, time: new Date().toLocaleTimeString(), count: prev.count + 1, reply: reply }));
    } else if (replyStr.includes('*HBT')) {
      const parts = replyStr.split(',');
      const reply = parts.slice(1).join(',');
      setHBTResponse(prev => ({ ...prev, time: new Date().toLocaleTimeString(), count: prev.count + 1, reply: reply }));
    } else if (replyStr.includes('*RSSI')) {
      setTableRows(prev => prev.map(row => row.command === '*RSSI?#' ? { ...row, reply: replyStr, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));
    } else {
      setTableRows(prev => prev.map(row => row.command === replyStr ? { ...row, reply: replyStr, replyCount: row.replyCount + 1, replyTime: new Date().toLocaleTimeString() } : row));
    }
  };

  const disconnectBLE = () => {
    if (bleCharacteristic) {
      bleCharacteristic.stopNotifications();
      bleCharacteristic.removeEventListener('characteristicvaluechanged', handleBleMessage);
      setBleCharacteristic(null);
    }
    if (bleServer) {
      bleServer.disconnect();
      setBleServer(null);
    }
    if (bleDevice) {
      setBleDevice(null);
    }
    setIsConnected(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    commandIndexRef.current = 0;
  };

  const resetTable = () => {
    setTcResponse({time:'00:00',count:0,reply:'-'})
    setHBTResponse({time:'00:00',count:0,reply:'-'})

    setTableRows([
      { time: '00:00', command: '*CC#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
      { time: '00:00', command: '*PT:dashboard:0000:N#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
      { time: '00:00', command: '*FW?#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
      { time: '00:00', command: '*SN?#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
      { time: '00:00', command: '*RSSI?#', count: 0, replyTime: '00:00', reply: '-', replyCount: 0 },
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
      if (bleServer) bleServer.disconnect();
    };
  }, [ws, bleServer]);

  return (
    <div className="container">

      <div className="top-buttons">
        <button className="start" onClick={handleStart} disabled={isConnected}>START</button>
        <button className="stop" onClick={handleStop} disabled={!isConnected}>STOP</button>
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
          <input value={deviceId} onChange={(e) => setDeviceId(e.target.value)}/>
        </div>

        <div className="input-group">
          <label>Time: 5–99</label>
          <input type="number" value={time} onChange={(e) => setTime(Number(e.target.value))} min="5" max="99" />
        </div>

        {connectivity === 'MQTT' && (
          <>
            <div className="input-group">
              <label>Mqtt Servers</label>
              <select value={mqttServer} onChange={(e) => setMqttServer(e.target.value)}>
              
                <option value="A">kwikpayProduction</option>
                <option value="B">kwikpaySandbox</option>
                <option value="C">gvcMqttServer</option>
              </select>
            </div>

           
          </>
        )}

      </div>

      <div className="footer-box">
        <div style={{display:'flex',alignItems:'center'}}>
          <h2>TC-D : </h2>
          <p>Time:{tcResponse.time} Count:{tcResponse.count} {tcResponse.reply}</p>
        </div>
        <div style={{display:'flex',alignItems:'center'}}>
          <h2>HBT : </h2>
          <p>Time:{hbtResponse.time} Count:{hbtResponse.count} {hbtResponse.reply}</p>
        </div>

      </div>

      {/* TABLE HEADER with 6 columns */}
      <div className="table-header">
        <div>Time</div>
        <div>Command</div>
        <div>Count</div>
        <div>Time</div>
        <div style={{width:'300px'}}>Reply</div>
        <div>Count</div>
      </div>

      {tableRows.map((row, index) => (
        <div key={index} className="table-row">
          <div>{row.time}</div>
          <div>{row.command}</div>
          <div style={{width:'100px'}}>{row.count}</div>
          <div>{row.replyTime}</div>
          <div style={{width:'300px'}}>{row.reply}</div>
          <div>{row.replyCount}</div>
        </div>
      ))}

    </div>
  );
}
