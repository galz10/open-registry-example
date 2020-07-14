/* eslint-disable require-jsdoc */
const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const iot = require('@google-cloud/iot');

const app = express();

let bool = false;

const iotClient = new iot.v1.DeviceManagerClient({
  // optional auth parameters.
});

async function checkDevice(deviceID, pkey, res) {
  const devicePath = iotClient.devicePath('class-does-iot-demos', 'us-central1', 'nodeRegistry', deviceID);

  try {
    const responses = await iotClient.getDevice({name: devicePath});
    const data = responses[0];

    console.log('Found device:', deviceID, data);
    bool = true;
    res.redirect('/existing.html');
  } catch (err) {
    console.error('Could not find device:', deviceID);
    const regPath = iotClient.registryPath('class-does-iot-demos', 'us-central1', 'nodeRegistry');
    const device = {
      id: deviceID,
      credentials: [
        {
          publicKey: {
            format: 'ES256_PEM',
            key: Buffer.from(pkey).toString(),
          },
        },
      ],
    };
    const request = {
      parent: regPath,
      device,
    };

    try {
      const responses = await iotClient.createDevice(request);
      const response = responses[0];
      console.log('Created device', response);
      res.redirect('/added.html');
    } catch (err) {
      console.error('Could not create device', err);
    }
  }
}

async function creatDevice(deviceID, pkey, response) {
  const r = await(checkDevice(deviceID, pkey, response));
}

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'style')));

app.use('/add-device', (request, response) => {
  response.sendFile(path.join(__dirname, '../', 'public', 'index.html'));
});

app.use('/added', (request, response) => {
  console.log(' ');
  console.log(request.body['deviceID']);
  console.log(request.body['publicKey']);
  creatDevice(request.body['deviceID'], request.body['publicKey'], response);
  console.log(' ');
  console.log(bool);
  if (bool === false) {
    console.log(bool);
  }
});

app.use('/added.html', (request, response) => {
  response.sendFile(path.join(__dirname, '../', 'public', 'added.html'));
});

exports.app = functions.https.onRequest(app);
