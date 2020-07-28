// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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

/*
* deviceID - user imputed device id
* pkey - user imputed public key
* res - response to redirect after completion
*
* This function checks whether a device already has the same deviceID as the user imputed 
* if there is a device already redirects to existing.html
* else it registers the deviceID with pkey and redirects to added.html
*/
async function checkDevice(deviceID, pkey, res) {
  const devicePath = iotClient.devicePath('GCLOUD_PROJECT', 'us-central1', 'GCLOUD_REGISTRY', deviceID);

  try {
    const responses = await iotClient.getDevice({name: devicePath});
    const data = responses[0];

    console.log('Found device:', deviceID, data);
    bool = true;
    res.redirect('/existing.html');
  } catch (err) {
    console.error('Could not find device:', deviceID);
    const regPath = iotClient.registryPath('GCLOUD_PROJECT', 'us-central1', 'GCLOUD_REGISTRY');
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


app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'style')));

app.use('/add-device', (request, response) => {
  response.sendFile(path.join(__dirname, '../', 'public', 'index.html'));
});

app.use('/added.html', (request, response) => {
  response.sendFile(path.join(__dirname, '../', 'public', 'added.html'));
});

exports.app = functions.https.onRequest(app);