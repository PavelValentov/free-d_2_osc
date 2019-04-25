const dgram = require('dgram');
const OSC = require('osc-js');
const config = require('./config');

const server = dgram.createSocket('udp4');
const client = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

function bytesToFloat(bytes) {
  // JavaScript bitwise operators yield a 32 bits integer, not a float.
  // Assume LSB (least significant byte first).
  var bits = bytes[3]<<24 | bytes[2]<<16 | bytes[1]<<8 | bytes[0];
  var sign = (bits>>>31 === 0) ? 1.0 : -1.0;
  var e = bits>>>23 & 0xff;
  var m = (e === 0) ? (bits & 0x7fffff)<<1 : (bits & 0x7fffff) | 0x800000;
  var f = sign * m * Math.pow(2, e - 150);
  return f;
}

function getSignedNumber(number, bitLength) {
  let mask = Math.pow(2, bitLength) - 1;
  if (number & (1 << (bitLength - 1))) {
    // console.log('---', cameraXPosition, mask, !mask, cameraXPosition | ~mask);
    return number | ~mask;
  } else {
    return number & mask;
    // console.log('+++', cameraXPosition);
  }
}

server.on('message', (msg, rinfo) => {
  // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  // console.log(`server got message ${msg.length} ${msg instanceof Buffer} from ${rinfo.address}:${rinfo.port}`);
  console.log(msg);

  if (msg instanceof Buffer && msg.length === 29 && msg.readUInt8(0) === 209) {
    let message = {
      messageType: msg.readUInt8(0),
      cameraID: msg.readUInt8(1),
      spare: (msg.readUInt8(26) << 8) + msg.readUInt8(27),
      checkSum: msg.readUInt8(28),
    };


    // *** Camera Pan Angle
    let cameraPanAngle1 = (msg.readUInt8(2)) << 16;
    let cameraPanAngle2 = msg.readUInt8(3) << 8;
    let cameraPanAngle3 = msg.readUInt8(4) << 0;
    let cameraPanAngle = getSignedNumber(cameraPanAngle1 + cameraPanAngle2 + cameraPanAngle3, 24);
    message.cameraPanAngle = cameraPanAngle / 32768;

    let sendMessage = new OSC.Message('PanAngle', message.cameraPanAngle);
    let binary = sendMessage.pack();
    client.send(new Buffer(binary), 0, binary.byteLength, config.OSCPort, config.OSCAddress);



    // *** Camera Tilt Angle 5-6-7
    let cameraTiltAngle1 = (msg.readUInt8(5)) << 16;
    let cameraTiltAngle2 = msg.readUInt8(6) << 8;
    let cameraTiltAngle3 = msg.readUInt8(7) << 0;
    let cameraTiltAngle = getSignedNumber(cameraTiltAngle1 + cameraTiltAngle2 + cameraTiltAngle3, 24);
    message.cameraTiltAngle = cameraTiltAngle / 32768;

    sendMessage = new OSC.Message('TiltAngle', message.cameraTiltAngle);
    binary = sendMessage.pack();
    client.send(new Buffer(binary), 0, binary.byteLength, config.OSCPort, config.OSCAddress);



    // *** Camera Roll Angle 8-9-10
    let cameraRollAngle1 = (msg.readUInt8(8)) << 16;
    let cameraRollAngle2 = msg.readUInt8(9) << 8;
    let cameraRollAngle3 = msg.readUInt8(10) << 0;
    let cameraRollAngle = getSignedNumber(cameraRollAngle1 + cameraRollAngle2 + cameraRollAngle3, 24);
    message.cameraRollAngle = cameraTiltAngle / 32768;

    sendMessage = new OSC.Message('RollAngle', message.cameraRollAngle);
    binary = sendMessage.pack();
    client.send(new Buffer(binary), 0, binary.byteLength, config.OSCPort, config.OSCAddress);

    // *** Camera X-Position 11-12-13
    let cameraXPosition1 = (msg.readUInt8(11)) << 16;
    let cameraXPosition2 = msg.readUInt8(12) << 8;
    let cameraXPosition3 = msg.readUInt8(13) << 0;
    let cameraXPosition = getSignedNumber(cameraXPosition1 + cameraXPosition2 + cameraXPosition3, 24);
    message.cameraXPosition = cameraXPosition / 64000;

    sendMessage = new OSC.Message('XPosition', message.cameraXPosition);
    binary = sendMessage.pack();
    client.send(new Buffer(binary), 0, binary.byteLength, config.OSCPort, config.OSCAddress);

    // *** Camera Y-Position 14-15-16
    let cameraYPosition1 = (msg.readUInt8(14)) << 16;
    let cameraYPosition2 = msg.readUInt8(15) << 8;
    let cameraYPosition3 = msg.readUInt8(16) << 0;
    let cameraYPosition = getSignedNumber(cameraYPosition1 + cameraYPosition2 + cameraYPosition3, 24);
    message.cameraYPosition = cameraYPosition / 64000;

    sendMessage = new OSC.Message('YPosition', message.cameraYPosition);
    binary = sendMessage.pack();
    client.send(new Buffer(binary), 0, binary.byteLength, config.OSCPort, config.OSCAddress);



    // *** Camera Height (Z-Position) 17-18-19
    let cameraZPosition1 = (msg.readUInt8(14)) << 16;
    let cameraZPosition2 = msg.readUInt8(15) << 8;
    let cameraZPosition3 = msg.readUInt8(16) << 0;
    let cameraZPosition = getSignedNumber(cameraZPosition1 + cameraZPosition2 + cameraZPosition3, 24);
    message.cameraZPosition = cameraZPosition / 64000;

    sendMessage = new OSC.Message('ZPosition', message.cameraZPosition);
    binary = sendMessage.pack();
    client.send(new Buffer(binary), 0, binary.byteLength, config.OSCPort, config.OSCAddress);



    // *** Camera Zoom 20-21-22
    let cameraZoom1 = (msg.readUInt8(20)) << 16;
    let cameraZoom2 = msg.readUInt8(21) << 8;
    let cameraZoom3 = msg.readUInt8(22) << 0;
    let cameraZoom = getSignedNumber(cameraZoom1 + cameraZoom2 + cameraZoom3, 24);
    message.cameraZoom = cameraZoom / 524288;

    sendMessage = new OSC.Message('Zoom', message.cameraZoom);
    binary = sendMessage.pack();
    client.send(new Buffer(binary), 0, binary.byteLength, config.OSCPort, config.OSCAddress);



    // *** Camera Focus 23-24-25
    let cameraFocus1 = (msg.readUInt8(20)) << 16;
    let cameraFocus2 = msg.readUInt8(21) << 8;
    let cameraFocus3 = msg.readUInt8(22) << 0;
    let cameraFocus = getSignedNumber(cameraFocus1 + cameraFocus2 + cameraFocus3, 24);
    message.cameraFocus = cameraFocus / 524288;

    sendMessage = new OSC.Message('Focus', message.cameraFocus);
    binary = sendMessage.pack();
    client.send(new Buffer(binary), 0, binary.byteLength, config.OSCPort, config.OSCAddress);

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
