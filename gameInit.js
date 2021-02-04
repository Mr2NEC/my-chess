const Game = require('./sequelize/schema/gameSchema')

async function gameInit(userId, gameId) {
    try {
            const game = await Game.findByPk(gameId);
            if (game && (game.blackId === userId ||game.whiteId === userId)) {
                return game;
            }

            return null

    } catch (e) {
        return null
    }
}
module.exports = gameInit