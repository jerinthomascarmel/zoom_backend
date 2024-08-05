import { Server } from "socket.io";
import { ChatMessage } from "../models/chatmessage.model.js";
import { Meeting } from "../models/meeting.model.js";

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['*'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {

        console.log('someone connected !', socket.id);


        socket.on('join-room', (roomId) => {
            socket.broadcast.to(roomId).emit('user-connected', socket.id);
            socket.join(roomId);
        })

        socket.on('chat message', async (chatMessage, roomId) => {
            try {
                const newMessage = new ChatMessage({
                    user_name: chatMessage.sender,
                    message: chatMessage.message
                })
                await newMessage.save();
                const meetingRoom = await Meeting.findOne({
                    meetingCode: roomId
                });
                meetingRoom.messages.push(newMessage);
                await meetingRoom.save();

                // Log current members in the room before broadcasting
                const roomSockets = io.sockets.adapter.rooms.get(roomId);
                if (roomSockets) {
                    console.log(`Broadcasting to members of room ${roomId}:`, Array.from(roomSockets));
                }

                Array.from(roomSockets).forEach(element => {
                    io.to(element).emit('chat message', chatMessage);
                });
            } catch (err) {
                console.dir(err);
            }
        });

        socket.on('signal', (data) => {
            const { to, from, signal } = data;
            io.to(to).emit('signal', { from: from, signal: signal });
        });

        socket.on('callNewUser', (data) => {
            const { to, from, signal } = data;
            io.to(to).emit('callNewUser', { from: from, signal: signal });
        });

        socket.on('answerCall', (data) => {
            console.log('answercall : ', data.to, "<-", data.from);
            const { to, from, signal } = data;
            io.to(to).emit('answerCall', { from: from, signal: signal });
        });


        socket.on('disconnect', () => {
            console.log('Client disconnected !', socket.id);
        });

        socket.on('leave-room', (roomId) => {
            console.log('leave room triggered ! ');
            console.log(roomId)
            // Log current members in the room before broadcasting
            const roomSockets = io.sockets.adapter.rooms.get(roomId);
            if (roomSockets) {
                console.log(`Broadcasting to members of room ${roomId}:`, Array.from(roomSockets));
            }

            socket.leave(roomId);
            if (roomSockets) Array.from(roomSockets).forEach(element => {
                io.to(element).emit('user-disconnected', socket.id);
            });
        });

    })
    return io;
}

