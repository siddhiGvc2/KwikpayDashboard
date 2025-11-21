# TODO for Parsing Incoming Message in Kwikpay Dashboard

- [x] Modify WebSocket onmessage handler in src/App.js to parse reply for *FW?# command
  - [x] Extract deviceId from data.reply (remove leading *, take part before first comma)
  - [x] Set extracted deviceId in state using setDeviceId
  - [x] Update table reply for *FW?# to the part after the comma (version info)
- [x] Ensure other commands' logic remains unchanged
