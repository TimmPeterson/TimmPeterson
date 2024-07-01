let socket;
export let send;

export const wsInit = (onMessage) => {
  socket = new WebSocket("ws://localhost:8000");
  socket.onopen = () => {};
  socket.onmessage = (message) => {
    console.log("message received");
    onMessage(JSON.parse(message.data), socket);
  };
  send = (message) => {
    socket.send(JSON.stringify(message));
  };
};
