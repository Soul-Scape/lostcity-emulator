/**
 * General Store Shopkeeper (NPC ID: 220) and Shop Assistant (NPC ID: 221).
 * Op1: Talk-to — opens general store.
 * Op2: Trade — opens general store directly.
 */
import Player from '#/engine/entity/Player.js';
import ScriptProvider, { ScriptContext } from '#/engine/script/ScriptProvider.js';
import ServerTriggerType from '#/engine/script/ServerTriggerType.js';
import { messageGame } from '#/network/server/ServerMessages.js';

const SHOPKEEPER_ID = 220;
const SHOP_ASSISTANT_ID = 221;

// Placeholder — full shop interface requires the shop system (Phase 3)
function openGeneralStore(player: Player): void {
    messageGame(player, 'Welcome to the general store!');
    messageGame(player, 'The shop system is not yet implemented.');
}

ScriptProvider.register(ServerTriggerType.OPNPC1, SHOPKEEPER_ID, (ctx: ScriptContext) => {
    openGeneralStore(ctx.self as Player);
});

ScriptProvider.register(ServerTriggerType.OPNPC2, SHOPKEEPER_ID, (ctx: ScriptContext) => {
    openGeneralStore(ctx.self as Player);
});

ScriptProvider.register(ServerTriggerType.OPNPC1, SHOP_ASSISTANT_ID, (ctx: ScriptContext) => {
    openGeneralStore(ctx.self as Player);
});

ScriptProvider.register(ServerTriggerType.OPNPC2, SHOP_ASSISTANT_ID, (ctx: ScriptContext) => {
    openGeneralStore(ctx.self as Player);
});
