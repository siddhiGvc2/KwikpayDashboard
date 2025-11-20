import React from "react";
import "./App.css";

export default function TestLayout() {
  return (
    <div className="container">

      <div className="top-buttons">
        <button className="start">START</button>
        <button className="stop">STOP</button>
        <button className="reset">RESET</button>
      </div>

      <div className="row-3">
        <div className="input-group">
          <label>Connectivity</label>
          <select>
            <option>TCP</option>
            <option>MQTT</option>
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

      {/* ROW 1 */}
      <div className="table-row">
        <div>00:00</div>
        <div>*FW?#</div>
        <div>0</div>
        <div>00:40</div>
        <div>-</div>
        <div>0</div>
      </div>

      {/* ROW 2 */}
      <div className="table-row">
        <div>00:10</div>
        <div>*SN?#</div>
        <div>0</div>
        <div>—</div>
        <div>-</div>
        <div>0</div>
      </div>

      {/* ROW 3 */}
      <div className="table-row">
        <div>00:20</div>
        <div>*V::1:1#</div>
        <div>0</div>
        <div>—</div>
        <div>-</div>
        <div>0</div>
      </div>

      {/* ROW 4 */}
      <div className="table-row">
        <div>00:30</div>
        <div>*V::2:1#</div>
        <div>0</div>
        <div>—</div>
        <div>-</div>
        <div>0</div>
      </div>

      <div className="footer-box">
        <h2>TC-D</h2>
        <p>XXX</p>
      </div>

    </div>
  );
}
