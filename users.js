class Users {
    constructor() {
        this.state = {};
        this.login = 'anon';
        this.id = -1;
        this.inGame = false;
    }

    getState() {
        return this.state;
    }

    getAuthUsers(connectionId) {
        const authUsers = [];

        for (let key in this.state) {
            if (
                key !== connectionId &&
                this.state[key].id !== this.id &&
                this.state[key].inGame === this.inGame
            ) {
                authUsers.push({
                    connectionId: key,
                    ...this.state[key],
                });
            }
        }

        return authUsers;
    }

    checkUserInOnline(user) {
        let userInOnline = false;

        if (user.id !== this.id) {
            for (let key in this.state) {
                if (this.state[key].id === user.id) {
                    userInOnline = true;
                }
            }
        }

        return userInOnline;
    }

    addUser(connectionId, user = { id: this.id, login: this.login }) {
        const logout = this.checkUserInOnline(user);

        if (logout) {
            user = { id: this.id, login: this.login };
        }

        this.state[connectionId] = {
            id: user.id,
            login: user.login,
            inGame: this.inGame,
        };
        return { userData: this.state[connectionId], logout };
    }

    updateUser(
        connectionId,
        user = { id: this.id, login: this.login },
        inGame = this.inGame,
    ) {
        let { id, login } = user;

        this.state[connectionId] = {
            ...this.state[connectionId],
            id,
            login,
            inGame,
        };
        return this.state[connectionId];
    }

    deleteUser(connectionId) {
        delete this.state[connectionId];
        return connectionId;
    }
}

module.exports = Users;
