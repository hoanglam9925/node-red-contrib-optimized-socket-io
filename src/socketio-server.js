const socketio = require("socket.io");
const fs = require('fs');
const https = require('https');

module.exports = function (RED) {
  function NodeFunction(config) {
    // *************************************************************************
    // Boilerplate
    // *************************************************************************
    RED.nodes.createNode(this, config);
    const node = this;

    // *************************************************************************
    // Setup
    // *************************************************************************
    node.inPort = config.port;
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


    // io.use(socketioWildcardMiddleware());

    // *************************************************************************
    // Set up sockets
    // *************************************************************************
    io.on("connection", (socket) => {
      const socketId = socket.id;

      node.log(`${socketId} connected`);

      socket.on("disconnect", () => {
        node.log(`${socketId} disconnected`);
      });
    });

    // *************************************************************************
    // Handle disconnect
    // *************************************************************************
    node.on("close", function () {
      node.log("Closing");
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
