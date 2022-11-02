// importing 
import express from "express";
import mongoose from "mongoose";
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1500590",
    key: "96463a5ea749e77a5e2e",
    secret: "a4bf6a529403ae6e0924",
    cluster: "eu",
    useTLS: true
});


// middleware
app.use(express.json());
app.use(cors())

//request if accepted from any head point anyone
// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin","*");
//     res.setHeader("Access-Control-Allow-Headers","*");
//     next();
// })

//Db config
const connection_url = "mongodb+srv://admin:admin@cluster0.dqiytpy.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(connection_url, {
    // useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})


const db = mongoose.connection

db.once('open', () => {
    console.log("DB connected");

    const msgCollection = db.collection("messagecontents")

    const changeStream = msgCollection.watch();

    changeStream.on("change", (change) => {
        console.log("A change occured", change);

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;

            pusher.trigger('messsages', 'inserted',
                {
                    name: messageDetails.name,
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp,
                    received: messageDetails.received,
                }
            );
        }
        else {
            console.log('Error triggering pusher')
        }
    });
});

//api routes
app.get("/", (req, res) => res.status(200).send("hello world"));

app.post('/api/v1/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.status(201).send(data)
        }
    })
})


//listen
app.listen(port, () => console.log(`listening on localhost :${port}`));