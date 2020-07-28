---
title: Creating an Open Registry
description: This is an example of an open registry, where users can register their devices without accessing the registry
author: galz10
tags: IoT, Google Cloud, Internet of Things, ESP32, ESP-IDF, IoT Core
date_published: 2020-07-27
---

The code in this repository is a public device registry application written in javascript and uses google cloud functions, the goal of this example is to create a proof of concept for a global environmental data set. 

When scientists want to start an environmental study they need to have thousands of data points to make their study accurate and to draw trends from this data. This is where the public device registry can help, the scientist would need to set up a registry and other people who are interested in participating in the study could help with adding their data to the study.

To help with data collection all the user would need to do is, go to the web application and enter the device id and ES256 public key. Once the device is registered the user could publish telemetry data and that data will go to the corresponding subscription topic.

Follow the tutorial below to set up the web application.

### Objectives
- Create a registry
- Setup Firebase
- Run Web Application

## Google IoT Core

If you’ve never used IoT Core, don’t worry, the steps below will get you set up to transmit telemetry data to the cloud but before we can do that let's talk about IoT Core and its components. IoT Core is a complete set of tools to connect, process, store, and analyze data both at the edge and in the cloud. Google Cloud IoT consists of the device management API for creating and managing logical collections of devices and the protocol bridge which adapts device-friendly protocols (MQTT or HTTP) to scalable Google infrastructure.

Now that we have a little bit of information about IoT Core lets set it up.

To learn more about the protocols for [IoT Core](https://cloud.google.com/iot/docs/), read the [MQTT](https://cloud.google.com/iot/docs/how-tos/mqtt-bridge) and [HTTP](https://cloud.google.com/iot/docs/how-tos/http-bridge) documentation.

### Setting up your device registry

Before connecting to Google Cloud you need to create device authentication credentials and a device registry to contain your devices.

There are two ways you can set up your project on Google Cloud IoT, you can use the Cloud SDK (gcloud) or using the UI in the [Google Cloud Console](https://console.cloud.google.com/) This guide will go through setting the project up using gcloud. After you have downloaded the [Cloud SDK](https://cloud.google.com/sdk).

**To set up your device registry:**

1. Generate Elliptic Curve (EC) device credentials for authenticating the device when it’s
trying to connect with the cloud, You will need to know where these files are later so make sure they’re saved somewhere you can access.

```bash
openssl ecparam -genkey -name prime256v1 -noout -out ec_private.pem openssl ec -in ec_private.pem -pubout -out ec_public.pem
```

1. Make sure your gcloud is up to date. gcloud components update
1. Create a PubSub topic and subscription used for storing telemetry.

```c
gcloud pubsub topics create temperature
gcloud pubsub subscriptions create data --topic=temperature
```

1. Create a device registry and add a device to the registry.

```c
gcloud iot registries create esp-test --region=us-central1 --event-notification-config=topic=temperature
```

## Running the Sample

### Cloning mqtt example

You will need to clone the repo to get the example code. In your terminal, go to a location you want to store the cloned repo and run the following command:

```bash
git clone
```

Once you've cloned the repo successfully, go into the index.js file in functions, change the GCLOUD_PROJECT, and GCLOUD_REGISTRY in the checkDevice function to your registry and project ID.

### Connecting to Firebase

Once you've cloned the repo, in your terminal go to open-registry-example and run:

```bash
npm install
```

This will install the dependencies for the open-registry-example. After npm successfully installed you can log in to firebase by using:

```bash
firebase login
```

This command will redirect you to log in to firebase, after you're logged in you'll need to initialize firebase to do so run:

```bash
firebase init
```

This will bring up options, you'll want to use the hosting option, press the down arrow key until you reach the hosting option, and press the space bar. Next, it will ask you if you want to use an existing project, or create a new one, you'll want to create a new project, go through the steps of creating the project.

Once the project is created you have two options for hosting, you can host the web application on your local machine or you can host the web application on firebase. You'd host on your local machine if you wanted to change the web application and you'd host on firebase if you're done with the web application.

To host locally:

```bash
firebase server
```

To host on firebase:

```bash
firebase deploy
```

This will set up the web application and now you can register your devices.

## Next Steps

Now that you've set up a public device registry add your own spin on the application, you could connect to the device and publish messages from the device. 