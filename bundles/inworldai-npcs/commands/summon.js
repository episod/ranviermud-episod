"use strict";
require("dotenv").config();
const sdk = require("@inworld/nodejs-sdk");
const { Broadcast: B } = require("ranvier");
const say = B.sayAt;
const line = B.line;

const client = new sdk.InworldClient().setApiKey({
  key: process.env.INWORLD_KEY,
  secret: process.env.INWORLD_SECRET,
});

module.exports = {
  usage: "summon [character from inworldai]",
  command: (state) => (args, player, arg0) => {
    if (!args.length) {
      return say(player, "Specify a character", false, true);
    }
    var character = args;
    return summonCharacter(player, character);
  },
};

async function sendText(player, character) {
  client.setUser({ fullName: player.name });
  client.setConfiguration({
    capabilities: { audio: false, emotions: true },
    disconnectTimeout: 50000,
  });
  character = "workspaces/episod-sandbox/characters/".character;
  client.setScene(character);
  // client.setCurrentCharacter(character); // Doesn't work despite seeing code like this...
  client.setOnMessage(function (message) {
    if (message.isText()) {
      text = message.text.text;
      say(player, message.text.text, false, true);
    } else if (message.isEmotion()) {
      var emotions = message.emotions;
      var behavior = emotions.behavior.code.toString().toLowerCase();
      var statement = "Gertrude is feeling " + behavior + ".";
      if (emotions.isStrong) {
        statement = statement + " BIG TIME.";
      }
      B.at(player, statement, false, true);
      line(5, "cyan");
    } else if (message.isControl()) {
      if (message.isInteractionEnd()) {
        B.prompt(player);
      }
    } else {
      console.log(message);
    }
  });

  const connection = client.build();
  connection.sendText(text);
  return true;
}
