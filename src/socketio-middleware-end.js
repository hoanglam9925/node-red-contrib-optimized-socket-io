const { showNodeStatus } = require("./util/nodeStatus");
const parseTypedInputs = require("./util/parseTypedInputs");

module.exports = function (RED) {
    function socketIoMiddlewareEnd(config) {
        RED.nodes.createNode(this, config);
        // node-specific code goes here
        const node = this;

        node.on("input", (msg) => {
            if (!msg._next) {
                showNodeStatus(node, "red", "No next function found (56756)");
                node.log("No next function found (56756)");
                return;
            }

            if (msg.payload) {
                showNodeStatus(node, "blue", `Connection ${msg._socketId} allowed`);
                msg._next();
                return;
            }

            const error = new Error(msg.errMsg ? msg.errMsg : 'Your connection is not allowed (345456)');
            // Add error data to the error object
            if (msg.error_data) {
                error.data = msg.error_data;
            }

            showNodeStatus(node, "red", `Connection ${msg._socketId} is not allowed`);
            msg._next(error);
        });

    }

    RED.nodes.registerType("socket.io middleware-end", socketIoMiddlewareEnd);
};
