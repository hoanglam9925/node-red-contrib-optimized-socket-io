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

    // Parse options
    try {
      const options = config.options ? JSON.parse(config.options) : {};
      node.options = options;
    } catch (error) {
      node.error("[Wrong Options] create socket.io instance fail!");
      node.options = {};
    }

    // Parse SSL
    let useSSL = false;
    const sslConfig = {};
    try {
      if (config.ssl_key && config.ssl_cert) {
        sslConfig.key = fs.readFileSync(config.ssl_key);
        sslConfig.cert = fs.readFileSync(config.ssl_cert);
        useSSL = true;
      }
    } catch (error) {
      node.error("[Wrong SSL] create socket.io with ssl fail!");
    }

    if (!useSSL) {
      node.warn("SocketIO server not using SSL");
      if (!config.ssl_key) {
        node.warn("No SSL key provided. Or the key file does not exist.");
      }
      if (!config.ssl_cert) {
        node.warn("No SSL cert provided. Or the cert file does not exist.");
      }
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
        node.log(`${socketId} disconnected`);
        // Leave all rooms
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
