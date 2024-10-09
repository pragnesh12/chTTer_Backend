const jwt = require("jsonwebtoken");

const usersMap = new Map(); // Store userId -> socketId mapping

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket id:", socket.id);

    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
      users.push({
        userID: id,
        username: socket.username,
      });
    }
    socket.emit("users", users);

    const token = socket.handshake.auth.token;
    const secretKey = process.env.ACCESS_TOKEN;

    try {
      const decoded = jwt.verify(token, secretKey);
      const userId = decoded.id;

      // Store the user's socket ID
      usersMap.set(userId, socket.id);
      console.log(`User ${userId} connected with socket.id: ${socket.id}`);

      // // Set Active or InActive Emit..
      // usersMap.forEach((val) => {
      //   socket.emit("IsOnline", { val });
      // });

      // Handle Send-Message event
      socket.on("Send-Message", ({ message, to }) => {
        const receiverSocketId = usersMap.get(to); // Get the socket ID for the receiver
        console.log("receiver id: ", receiverSocketId);
        if (receiverSocketId) {
          // Send the message to the receiver
          socket.to(receiverSocketId).emit("Receive-Message", {
            message,
            from: socket.id,
          });

          console.log(`Message sent to ${to}: ${message}`);
        } else {
          console.log(`Receiver with ID ${socket.id} is not connected.`);
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        usersMap.delete(userId); // Remove the user from the map on disconnect
        console.log(`User ${userId} disconnected.`);
      });
    } catch (err) {
      console.log("Token verification failed:", err.message);
      socket.emit("unauthorized", { message: "Invalid Token" });
      socket.disconnect();
    }
  });
};

module.exports = socketHandler;
