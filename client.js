const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const proto = grpc.loadPackageDefinition(
    protoLoader.loadSync("protos/chat.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

getRandomInt = max => Math.floor(Math.random() * Math.floor(max));

const REMOTE_SERVER = "0.0.0.0:3000";

let username;
let idReceiver = -1;
let idSender;

const client = new proto.example.Chat(
    REMOTE_SERVER,
    grpc.credentials.createInsecure()
);

startChat = () => {
    let channel = client.join({user: username, receiver: idReceiver, sender: idSender});
    let date = new Date().toDateString();

    channel.on("data", onData);

    rl.on("line", text => {
        client.send({user: username, text, date, receiver: idReceiver, sender: idSender}, res => {
        });
    });
}

onData = message => {
    let finalMessage = `User: ${message.user}
    - текст: ${message.text} 
    - дата: ${message.date} 
    - получатель: ${message.receiver}
    - отправитель: ${message.sender}`;

    if (message.user === username || !message.date) {
        return;
    }
    if (message.receiver === -1) {
        console.log(finalMessage);
    } else if (message.receiver === idSender) {
        console.log(finalMessage);
    }

};

rl.question("Как вас зовут? ", answer => {
    username = answer;
    idSender = getRandomInt(10);

    console.log(idSender);
    rl.question("Кому пишем? ", id => {
        idReceiver = id;
        startChat();
    });
});
