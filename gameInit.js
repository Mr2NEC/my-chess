const Game = require('./sequelize/schema/gameSchema')

async function gameInit(userId, gameId) {
    try {
            const game = await Game.findByPk(gameId);
            if (!game) throw new Error(`BAD Game`);
            if (game.blackId === userId ||game.whiteId === userId) {
                return game;
            }else {
                return null
            }
    } catch (e) {
        return null
    }
}
module.exports = gameInit