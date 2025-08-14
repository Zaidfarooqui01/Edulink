// utils/socket.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication failed'));
      }
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.profile.firstName} connected`);
    
    // Join user to their personal room
    socket.join(socket.user._id.toString());

    // Handle private messages
    socket.on('send_message', async (data) => {
      try {
        const { recipientId, content, type = 'text' } = data;
        
        // Check if users are friends
        const sender = await User.findById(socket.user._id);
        if (!sender.friends.includes(recipientId)) {
          socket.emit('error', { message: 'Can only message friends' });
          return;
        }

        const message = new Message({
          sender: socket.user._id,
          recipient: recipientId,
          content,
          type
        });

        await message.save();
        await message.populate('sender', 'profile.firstName profile.lastName profile.avatar');

        // Send to recipient
        io.to(recipientId).emit('new_message', message);
        
        // Confirm to sender
        socket.emit('message_sent', message);
        
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle friend requests
    socket.on('send_friend_request', async (data) => {
      try {
        const { recipientId } = data;
        
        const recipient = await User.findById(recipientId);
        if (!recipient) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        // Check if already friends or request exists
        if (recipient.friends.includes(socket.user._id) || 
            recipient.friendRequests.some(req => req.from.toString() === socket.user._id.toString())) {
          socket.emit('error', { message: 'Friend request already exists or you are already friends' });
          return;
        }

        recipient.friendRequests.push({
          from: socket.user._id,
          status: 'pending'
        });

        await recipient.save();

        // Notify recipient
        io.to(recipientId).emit('friend_request_received', {
          from: {
            _id: socket.user._id,
            profile: socket.user.profile
          }
        });

        socket.emit('friend_request_sent', { recipientId });
        
      } catch (error) {
        socket.emit('error', { message: 'Failed to send friend request' });
      }
    });

    // Handle quiz notifications
    socket.on('join_quiz_room', (quizId) => {
      socket.join(`quiz_${quizId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.profile.firstName} disconnected`);
    });
  });

  return io;
};

module.exports = initializeSocket;
