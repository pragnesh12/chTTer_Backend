const express = require("express");
const sendMessage = require("../../Controllers/ConversationController/SendMessage.js");
const getConversationBetweenUsers = require("../../Controllers/ConversationController/getConversationBetweenUsers.js");
const conversationRouter = express.Router();

conversationRouter.post("/chat", sendMessage);
conversationRouter.post("/getmessages", getConversationBetweenUsers);

module.exports = conversationRouter;
  