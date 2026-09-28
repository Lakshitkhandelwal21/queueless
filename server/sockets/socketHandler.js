const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join specific Organization public room (for TV displays)
    socket.on('join:org', (orgId) => {
      socket.join(`org:${orgId}`);
      console.log(`Socket ${socket.id} joined room org:${orgId}`);
    });

    // Join Queue room (for Staff and Customers monitoring queue)
    socket.on('join:queue', (queueId) => {
      socket.join(`queue:${queueId}`);
      console.log(`Socket ${socket.id} joined room queue:${queueId}`);
    });

    // Join specific Ticket room (for private customer live updates)
    socket.on('join:ticket', (ticketId) => {
      socket.join(`ticket:${ticketId}`);
      console.log(`Socket ${socket.id} joined room ticket:${ticketId}`);
    });

    // Leave rooms
    socket.on('leave:queue', (queueId) => {
      socket.leave(`queue:${queueId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocketHandlers;
