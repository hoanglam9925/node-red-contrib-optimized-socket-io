const socketio = require("socket.io");
const fs = require('fs');
const https = require('https');

module.exports = function (RED) {
  function checkConfigMemory(node, settingContext, userInputContextName) {
    if (!userInputContextName) {
      node.error("Cannot create node without context storage name");
      return false;
    }

    if (settingContext === null || settingContext === undefined) {
      node.error("Create context storage setting in settings.js with module memory first");
      return false;
    }

    const contextStorage = settingContext[userInputContextName];
    if (!contextStorage) {
      node.error(`Context storage ${userInputContextName} not found in settings.js`);
      return false;
    }

    if (contextStorage?.module !== "memory") {
      node.error(`Context storage ${userInputContextName} is not set to module memory`);
      return false;
    }
    return true;
  }
  function NodeFunction(config) {
    // *************************************************************************
    // Boilerplate
    // *************************************************************************
    RED.nodes.createNode(this, config);
    const node = this;
    const contextStorageSetting = RED.settings.contextStorage;

    // *************************************************************************
    // Setup
    // *************************************************************************
    node.contextStorageName = config.contextStorageName;
    node.inPort = config.port;

    // Check if context storage is set up correctly
    const alreadySetupContext = checkConfigMemory(node, contextStorageSetting, node.contextStorageName);
    if (!alreadySetupContext) {
      return;
    }

    let useSSL = false;
    const sslConfig = {};
    try {
      const options = config.options ? JSON.parse(config.options) : {};
      if (options.ssl) {
        useSSL = true;
        if (!options.ssl.key || !options.ssl.cert) {
          node.error("[Wrong Options] create socket.io instance fail!");
          node.options = {};
          return;
        }
        sslConfig.key = fs.readFileSync(options.ssl.key);
        sslConfig.cert = fs.readFileSync(options.ssl.cert);
        delete options.ssl;
      }

      node.options = options;
    } catch (error) {
      node.error("[Wrong Options] create socket.io instance fail!");
      node.options = {};
    }

    // *************************************************************************
    // Create server
    // *************************************************************************
    let httpsServer = null;
    let io = null;
    // If SSL is enabled, create an HTTPS server
    if (useSSL) {
      httpsServer = https.createServer(sslConfig, (req, res) => {
        res.writeHead(404);
      });
      io = new socketio.Server(httpsServer, node.options);
    } else {
      io = new socketio.Server(node.options);
    }
    node.io = io;

    // *************************************************************************
    // Set up sockets
    // *************************************************************************

    io.on("connection", (socket) => {
      const socketId = socket.id;

      node.log(`${socketId} connected`);

      socket.on("disconnect", () => {
        node.log(`${socketId} disconnected`);node
      });
    });

    // *************************************************************************
    // Handle disconnect
    // *************************************************************************
    node.on("close", function () {
      io.close();
    });

    // *************************************************************************
    // Start server
    // *************************************************************************
    if (useSSL) {
      httpsServer.listen(node.inPort);
      node.log(`Server listening on port ${node.inPort} with SSL`);
    } else {
      io.listen(node.inPort);
      node.log(`Server listening on port ${node.inPort}`);
    }
  }
  RED.nodes.registerType("socket.io server", NodeFunction);
};
