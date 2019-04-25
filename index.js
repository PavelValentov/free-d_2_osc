const dgram = require('dgram');
const OSC = require('osc-js');
const config = require('./config');

const server = dgram.createSocket('udp4');
const client = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  // console.log(`server got message ${msg.length} ${msg instanceof Buffer} from ${rinfo.address}:${rinfo.port}`);
  // console.log(msg);

  if (msg instanceof Buffer && msg.length === 29 && msg.readUInt8(0) === 209) {
    let message = {
      messageType: msg.readUInt8(0),
      cameraID: msg.readUInt8(1),
      spare: (msg.readUInt8(26) << 8) + msg.readUInt8(27),
      checkSum: msg.readUInt8(28),
    };



    // *** Camera Pan Angle

    // message.cameraPanAngle0 = (msg.readUInt32BE(2)).toString(16);
    let cameraPanAngle1 = (msg.readUInt8(2)) << 16;
    let cameraPanAngle2 = msg.readUInt8(3) << 8;
    let cameraPanAngle3 = msg.readUInt8(4) << 0;
    let cameraPanAngle = cameraPanAngle1 + cameraPanAngle2 + cameraPanAngle3;
    // message.cameraPanAngle32 = cameraPanAngle.toString(16);

    let view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, cameraPanAngle);
    // view.setFloat32(0, Math.PI);
    message.cameraPanAngle = view.getFloat32(0).toFixed(16);

    let osc = new OSC();
    let sendMessage = new OSC.Message('/cameraPanAngle', message.cameraPanAngle, 'cameraPanAngle');
    let binary = sendMessage.pack();
    client.send(new Buffer(binary), 0, binary.byteLength, config.OSCPort, config.OSCAddress);


    // *** Camera Tilt Angle 5-6-7
    let cameraTiltAngle1 = (msg.readUInt8(5)) << 16;
    let cameraTiltAngle2 = msg.readUInt8(6) << 8;
    let cameraTiltAngle3 = msg.readUInt8(7) << 0;
    let cameraTiltAngle = cameraTiltAngle1 + cameraTiltAngle2 + cameraTiltAngle3;
    view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, cameraTiltAngle);
    message.cameraTiltAngle = view.getFloat32(0).toFixed(16);

    // *** Camera Roll Angle 8-9-10
    // *** Camera X-Position 11-12-13
    // *** Camera Y-Position 14-15-16
    // *** Camera Height (Z-Position) 17-18-19
    // *** Camera Zoom 20-21-22
    // *** Camera Focus 23-24-25


    console.log(message);
  }

  // TRANSLATION
  // let osc = new OSC();
  // let message = new OSC.Message('/translation/x', tf.translation.x, 'x');
  // osc.send(message);
  // let binary = message.pack()
  // client.send(new Buffer(binary), 0, binary.byteLength, 4444, '192.168.77.18');
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(config.trackingPort);
// Prints: server listening 0.0.0.0:41234
