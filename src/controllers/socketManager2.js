import { Server } from "socket.io";

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
        console.log('someone connected !');

        socket.on('join-room', (roomId) => {
            socket.broadcast.to(roomId).emit('user-connected', socket.id);
            socket.join(roomId);
        })

        socket.on('signal', (data) => {
            const { to, from, signal } = data;
            io.to(to).emit('signal', {from:from,signal:signal});
        });

        socket.on('callNewUser', (data) => {
            const { to, from, signal } = data;
            io.to(to).emit('callNewUser', {from:from,signal:signal});
        });

        socket.on('answerCall', (data) => {
            console.log('answercall');
            const { to, from, signal } = data;
            io.to(to).emit('answerCall', {from:from,signal:signal});
        });
        

        socket.on('disconnect', () => {
            console.log('Client disconnected !');
        });

        socket.on('leave-room', (roomId) => {
            socket.leave(roomId);
            socket.broadcast.to(roomId).emit('user-disconnected', socket.id);
        });

    })
    return io;
}

