"use strict";
require("dotenv").config();
const sdk = require("@inworld/nodejs-sdk");
const { Broadcast: B } = require("ranvier");

module.exports = {
  usage: "gertrude [statement]",
  command: (state) => (args, player, arg0) => {
    if (!args.length) {
      return say(player, "What do you want to say to Gertrude?", false, true);
    }
    var statement = args;
    return sendTextToGertrude(player, statement);
  },
};

function sendTextToGertrude(player, text) {
  var client = new sdk.InworldClient().setApiKey({
    key: process.env.INWORLD_KEY,
    secret: process.env.INWORLD_SECRET,
  });

  client.setUser({ fullName: player.name });
  client.setConfiguration({
    capabilities: { audio: false, emotions: true },
    autoreconnect: false,
    disconnectTimeout: 25000,
  });

  var character = "workspaces/episod-sandbox/characters/gertrude";
  var scene = "workspaces/episod-sandbox/scenes/lobby";
  client.setScene(character);

  client.setOnMessage(function (message) {
    if (message.isText()) {
      text = message.text.text;
      B.sayAt(player, message.text.text, false, true);
    } else if (message.isEmotion()) {
      var emotions = message.emotions;
      var behavior = emotions.behavior.code.toString().toLowerCase();
      if (emotions.strength.isStrong()) {
        behavior = "<b>" + behavior + "</b>";
      }
      var statement =
        B.line(78, "-", "cyan") +
        "\n<magenta>Gertrude exhudes " +
        behavior +
        ".</magenta>\n" +
        B.line(78, "-", "cyan") +
        "\n";
      B.at(player, statement, false, true);
    } else if (message.isControl()) {
      if (message.isInteractionEnd()) {
        B.prompt(player);
      }
    } else {
      console.log(message);
    }
  });

  client.setOnError((err) => console.error(`Error: ${err.message}`));
  client.setOnDisconnect(() => console.log("Disconnected"));

  var connection = client.build();
  if (text.includes("/stop")) {
    B.sayAt(player, "Goodbye.\n");
    B.prompt(player);
    connection.close();
    connection = null;
    client = null;
  } else {
    B.sayAt(player, "<magenta>Gertrude says:</magenta> ", false, true);
    connection.sendText(text);
  }
}
