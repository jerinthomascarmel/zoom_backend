import { Server } from "socket.io";

let connections={} // key:path(room) value:[array of socket.id]
let messages={}// key :path(room) value:[array of message obj contains data,sender,socket-id-sender]
let timeOnline={} // key:socket.id value :time of joined 

export const connectToSocket=(server)=>{
    const io=new Server(server,{
        cors:{
            origin:'*',
            methods:['GET','POST'],
            allowedHeaders:['*'],
            credentials:true
        }
    });

    io.on('connection',(socket)=>{
        

        socket.on('join-call',(path)=>{

            if(connections[path]===undefined){
                connections[path]=[]
            }
            connections[path].push(socket.id);

            //add joining time of user
            timeOnline[socket.id]=new Date();

            //emit to other users of this room 
            connections[path].forEach(user=>{
                io.to(user).emit('user-joined',socket.id,connections[path]);
            });

            //recover messages send in this room 
            if(messages[path]!==undefined){
                messages[path].forEach((message)=>{
                    io.to(socket.id).emit('chat-message',message.data,message.sender,message["socket-id-sender"]);
                })
            }
        });


        socket.on('chat-message',(data,sender)=>{
            
            const [Room, isFound] = Object.entries(connections).reduce(([roomPath,isFound],[currRoom,arrayOfUsers])=>{
                
                if(!isFound && currRoom===arrayOfUsers.includes(socket.id)){
                    return [currRoom,true];
                }

                return [roomPath, isFound];
            },['',false]);

            if(isFound===true){
                if(messages[Room]===undefined){
                    messages[Room]=[]
                }

                messages[Room].push({'sender':sender,'data':data,'socket-id-sender':socket.id})
                console.log('message',":",sender,data);

                //send message to room peoples 
                connections[Room].forEach((userSocketId)=>{
                    io.to(userSocketId).emit('chat-message',data,sender,socket.id);
                })
            }
        });


        socket.on('disconnect',()=>{
            var diffTime=Math.abs(timeOnline[socket.id]-new Date());

            const [Room ,isFound]=Object.entries(connections).reduce(([accRoom,isFound],[currRoom,arrayOfUsers])=>{

                if(!isFound && arrayOfUsers.includes(socket.id)){
                    arrayOfUsers.forEach((userSocketId)=>{
                        io.to(userSocketId).emit('user-left',socket.id);
                    });

                    return [currRoom,true];
                }
                return [accRoom,isFound];
            },['',false]);

            if(isFound && connections[Room].length===0){
                delete connections[Room];
            }

        })

    })
    return io;
}

