
const Paho = jest.genMockFromModule('paho-mqtt');

const connect =  jest.fn(() => {
        console.log('connecting paho-mqtt mock client... ');
    });

const send = jest.fn(() => {
    console.log('sending paho-mqtt mock client... ');
});

const subscribe = jest.fn(() => {
    console.log('sending paho-mqtt mock client... ');
});

const unsubscribe = jest.fn(() => {
    console.log('unsubscribe paho-mqtt mock client... ');
});

Paho.Client = jest.fn().mockImplementation((host, port, path, clientId) => {
    console.log('client constructor mockkkk');
    var client = {}

    client.connect = jest.fn((options) => {
            console.log('connecting paho-mqtt mock client... ', options);
            options.onSuccess();
        }); 
    client.send = jest.fn((topic, message) => {
            console.log('sending paho-mqtt mock client... ', topic, message);
            client.onMessageArrived({ destinationName: topic, payloadString: message});
        }); 
    client.subscribe = jest.fn((topics, options) => {
            console.log('subscribe paho-mqtt mock client... ', topics, options);
        }); 
    client.unsubscribe = jest.fn(() => {
            console.log('unsubscribe paho-mqtt mock client... ');
        });
    client.onMessageArrived = jest.fn(() => {
            console.log('message arrived paho-mqtt mock client... ');
        });

    return client;
  });

// Paho.Client.connect = connect;


module.exports = Paho;