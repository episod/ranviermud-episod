'use strict';

const { Broadcast, Damage, SkillType } = require('ranvier');
const Combat = require('../../ranvier-combat/lib/Combat');

const cooldown = 10;
const damagePercent = 350;
const favorAmount = 5;

module.exports = {
  name: 'Smite',
  requiresTarget: true,
  initiatesCombat: true,
  resource: {
    attribute: 'favor',
    cost: favorAmount
  },
  cooldown,

  run: state => function (args, player, target) {
    if (!player.equipment.has('wield')) {
      return Broadcast.sayAt(player, "You don't have a weapon equipped.");
    }

    const damage = new Damage({
      attribute: 'health',
      amount: Combat.calculateWeaponDamage(player) * (damagePercent / 100),
      attacker: player,
      type: 'holy',
      source: this
    });

    Broadcast.sayAt(player, `<b><yellow>Your weapon radiates holy energy and you strike ${target.name}!</yellow></b>`);
    Broadcast.sayAtExcept(player.room, `<b><yellow>${player.name}'s weapon radiates holy energy and they strike ${target.name}!</yellow></b>`, [target, player]);
    Broadcast.sayAt(target, `<b><yellow>${player.name}'s weapon radiates holy energy and they strike you!</yellow></b>`);

    damage.commit(target);
  },

  info: (player) => {
    return `Empower your weapon with holy energy and strike, dealing <b>${damagePercent}%</b> weapon damage. Requires a weapon.`;
  }
};
