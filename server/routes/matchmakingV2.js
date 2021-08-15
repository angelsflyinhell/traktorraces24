const users = require('../savefiles/users.json');
const sessions = require('../savefiles/sessions.json');
const matches = require('../savefiles/matches.json');
const fs = require('fs/promises');
const makeId = require('../utils/sessionKeyGen');

const multiplayerV2 = function (app) {

    app.post('/matches/create', (req, res) => {
        const sessionKey = req.body.sessionToken;
        const username = req.body.owner;
        const name = req.body.name;
        const description = req.body.description;
        const isPrivate = req.body.privacy;
        const price = req.body.price;

        if (sessions[sessionKey] === undefined || sessions[sessionKey].username !== username) {
            res.json({
                success: false,
                message: "unauthorized"
            })
            return;
        }

        const matchId = makeId(5);
        matches[matchId] = {
            'name': name,
            'description': description,
            'isPrivate': isPrivate,
            'price': price,
            'owner': username,
            'players': [],
            'id': matchId
        }

        fs.writeFile("./savefiles/matches.json", JSON.stringify(matches));

        res.json(matches[matchId]);
        return;
    })

    app.post('/match/join', (req, res) => {
        const sessionKey = req.body.sessionToken;
        const matchId = req.body.matchId;
        const username = sessions[sessionKey].username;

        if (sessions[sessionKey] === undefined || sessions[sessionKey].username !== username) {
            res.json({
                success: false,
                message: "unauthorized"
            })
            return;
        }

        if (matches[matchId] === undefined) {
            res.json({
                success: false,
                message: "match does not exist"
            })
            return;
        }

        if (matches[matchId].players.indexOf(username) > -1) {
            res.json({
                success: false,
                message: "user already joined"
            })
            return;
        }

        matches[matchId].players.push(username);
        users[username].credits = Number.parseFloat(users[username].credits) - 5;

        fs.writeFile("./savefiles/users.json", JSON.stringify(users));
        fs.writeFile("./savefiles/matches.json", JSON.stringify(matches));


        res.json({
            success: true,
            message: "user joined match"
        })
        return;
    })

    app.get('/matches', (req, res) => {
        const publicMatches = [];

        const matcharray = Object.values(matches);
        for (let i = 0; i < matcharray.length; i++) {
            if (matcharray[i].isPrivate === 'false') {
                publicMatches.push(matcharray[i])
            }
        }

        res.json(publicMatches);
    })

    app.post('/match/start', (req, res) => {
        const sessionKey = req.body.sessionToken;
        const matchId = req.body.matchId;

        if (sessions[sessionKey] === undefined) {
            res.json({
                success: false,
                message: "unauthorized"
            })
            return;
        }

        if (matches[matchId] === undefined) {
            res.json({
                success: false,
                message: "match does not exist"
            })
            return;
        }

        const players = matches[matchId].players;
        if (players === []) {
            res.json({
                success: false,
                message: "no players"
            })
            return;
        }

        const winner = getRandomInt(players.length);
        const winnerName = players[winner];
        users[winnerName].credits = Number.parseFloat(users[winnerName].credits) + Number.parseFloat(matches[matchId].price);

        matches[matchId].isPrivate = true;

        fs.writeFile("./savefiles/users.json", JSON.stringify(users));
        fs.writeFile("./savefiles/matches.json", JSON.stringify(matches));

        
        res.json({
            winner: players[winner],
            success: true,
            message: "match ended"
        })
    })

}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

module.exports = multiplayerV2;