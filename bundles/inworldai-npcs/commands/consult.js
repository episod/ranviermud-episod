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
  usage: "consult [query]",
  command: (state) => (args, player, arg0) => {
    if (!args.length) {
      return say(player, "Well, say something...", false, true);
    }
    var statement = args;
    return sendText(player, statement);
  },
};

async function sendText(player, text) {
  // const npc = Array.from(player.room.npcs).find(npc => npc.getMeta('inworldai-gertrude'));
  // console.log("Have an npc object:");
  // console.log(npc);
  client.setUser({ fullName: player.name });
  client.setConfiguration({
    capabilities: { audio: false, emotions: true },
    disconnectTimeout: 30000,
  });
  var character = "workspaces/episod-sandbox/characters/gertrude";
  var scene = "workspaces/episod-sandbox/scenes/lobby";
  client.setScene(scene);
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
  // connection.setCurrentCharacter(character);
  connection.sendText(text);
  return true;
}
