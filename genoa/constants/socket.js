import { io } from 'socket.io-client';

const socket = io('http://172.21.4.73:3000'); // remplacer par son IP locale WSL

export default socket;
