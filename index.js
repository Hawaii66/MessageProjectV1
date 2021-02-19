const express = require("express");
const cors = require("cors");
const monk = require("monk");
const { response, json } = require("express");
const { compile } = require("morgan");

const app = express();

const PORT = process.env.PORT || 5000;

const db = monk(process.env.MONGO_DB_URI || "localhost/allMessages");

const messages = db.get("messages");
const channels = db.get("channesls");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Server here"
    });
});

app.get("/getAllChannels", (req, res) => {
    channels.find().then(answer => {
        res.json(answer);
    });
});

app.get("/All", (req, res) => {
    GetArrayWithChannelName("All", function(toSend) {
        res.json(toSend);
    });
});

app.get("/Random", (req, res) => {
    GetArrayWithChannelName("Random", function(toSend) {
        res.json(toSend);
    });
});

app.get("/Food", (req, res) => {
    GetArrayWithChannelName("Food", function(toSend) {
        res.json(toSend);
    });
});

app.get("/Homework", (req, res) => {
    GetArrayWithChannelName("Homework", function(toSend) {
        res.json(toSend);
    });
});

app.get("/createChannel", (req, res) => {
    channels.find().then(channelsOutput => {
        res.json(channelsOutput);
    })
});

app.get("/customChannel", (req, res) => {
    GetArrayWithChannelName(req.body.channelName, function(toSend) {
        res.json(toSend);
    });
});

app.post("/customChannel", (req, res) => {
    console.log(req.body.channel);
    DoesChannelNameExist(req.body.channel, function(doesExists) {
        if (doesExists) {
            console.log("Channel Name exist, getting all messages: " + req.body.channel);
            GetArrayWithChannelName(req.body.channel, function(toSend) {
                res.json(toSend);
            });
        } else {
            console.log("Channel dont exist");
            res.status(422);
            res.json({
                message: "Channel Dont Exists"
            })
        }
    });
});

app.post("/createChannel", (req, res) => {
    channels.find().then(channelsCurrent => {
        alreadyExist = false;
        for (let i = 0; i < channelsCurrent.length; i++) {
            if (channelsCurrent[i].channel !== undefined) {
                if (channelsCurrent[i].channel == req.body.name) {
                    alreadyExist = true;
                }
            }
        }

        if (alreadyExist || !isValidChannelName(req.body.name)) {
            res.json("ERROR: ALREAY EXISTS");
        } else {
            const toInsert = {
                channel: req.body.name.toString(),
                password: req.body.password.toString(),
                created: new Date()
            }
            channels.insert(toInsert).then(result => {
                console.log(toInsert);
                res.json(result);
            });
        }
    });
});

function DoesChannelNameExist(channelName, callback) {
    channels.find().then(msg => {
        exist = false;
        for (let i = 0; i < msg.length; i++) {
            console.log(msg[i].channel);
            if (msg[i].channel !== undefined || msg[i].channel != null) {
                if (msg[i].channel == channelName) {
                    exist = true;
                    callback(exist);
                    return;
                }
            }
        }
        callback(exist);
    });
}

function GetArrayWithChannelName(channelName, callback) {
    messages.find().then(msg => {
        toSend = [];
        for (let i = 0; i < msg.length; i++) {
            if (msg[i].channel == channelName || channelName == "All") {
                toSend.push(msg[i]);
            }
        }
        toSend.reverse();
        callback(toSend);
    });
}

function isValidChannelName(toCheck) {
    if (toCheck && toCheck.toString().trim() !== "" && toCheck.toString().trim() !== "null") {
        console.log("Channel name was valid");
        return true;
    } else {
        console.log("Channel name was not valid");
        return false;
    }
}

function isValid(toCheck) {
    if (toCheck.name && toCheck.name.toString().trim() !== "" && toCheck.message && toCheck.message.toString().trim() !== "") {
        console.log("message was valid");
        return true;
    } else {
        console.log("message was not valid");
        return false;
    }
}

app.post("/newChannel", (req, res) => {
    const newChannel = {
        channel: req.body.channel
    };

    res.json(newChannel);
})

app.post("/newMessage", (req, res) => {
    if (isValid(req.body)) {
        const msg = {
            name: req.body.name.toString(),
            message: req.body.message.toString(),
            channel: req.body.channel.toString(),
            created: new Date()
        };

        messages
            .insert(msg)
            .then(createdMessage => {
                res.json(createdMessage);
            });
    } else {
        res.status(422);
        console.log("Error with message");
        res.json({
            message: "Please enter name and message"
        })
    }
});

app.listen(PORT, () => {
    console.log("Listening on port: " + PORT);
});