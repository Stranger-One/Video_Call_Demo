import { Server } from "socket.io";

const io = new Server(8000, {
    cors: true
})

const emailToSocketIdMap = new Map()
const socketIdToEmailMap = new Map()
const roomUser = new Map(); // Map to manage users per room

io.on("connection", (socket) => {
    console.log("Socket Connected", socket.id);

    socket.on("room_join", (data) => {
        const { email, room } = data;

        // Map email and socket ID
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);

        // Add user to the room's user list
        if (!roomUser.has(room)) {
            roomUser.set(room, new Set());
        }
        roomUser.get(room).add({ email, id: socket.id });

        // Join the room
        socket.join(room);

        // Emit the updated list of all users in the room to everyone in the room
        const allUsersInRoom = Array.from(roomUser.get(room));
        io.to(room).emit("all_user", allUsersInRoom);

        // Emit the list of users to the newly joined user
        io.to(socket.id).emit("room_join_success", { email, room, allUsers: allUsersInRoom });
    });

    socket.on("disconnect", () => {
        // Handle user disconnect and remove them from the room's user list
        roomUser.forEach((users, room) => {
            for (const user of users) {
                if (user.id === socket.id) {
                    users.delete(user);
                }
            }

            // Emit updated user list to the room
            io.to(room).emit("all_user", Array.from(users));
        });

        // Remove user from maps
        emailToSocketIdMap.delete(socketIdToEmailMap.get(socket.id));
        socketIdToEmailMap.delete(socket.id);
    });
});
