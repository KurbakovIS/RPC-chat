const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const server = new grpc.Server();
const SERVER_ADDRESS = "0.0.0.0:3000";

const proto = grpc.loadPackageDefinition(
    protoLoader.loadSync("protos/chat.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

const users = [];

join = (call, callback) => {
    users.push(call);
    notifyChat({user: "Server", text: "new user joined ..."});
};

send = (call, callback) => {
    notifyChat(call.request);
};

notifyChat = message => {
    users.forEach(user => {
        user.write(message);
    });
};

server.addService(proto.example.Chat.service, {join, send});

server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure());

server.start();
console.log("Сервер запущен");
