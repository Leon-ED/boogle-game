import useWebSocket from 'react-use-websocket';
import { useState, useEffect } from 'react';
import { BACKEND_URL, WS_URL } from '../env';
import '../assets/chat.css';
function Chat(props: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const { sendMessage, lastMessage } = useWebSocket(WS_URL);
  const [rooms, setRooms] = useState<any[]>([]);

  if (props.roomID !== undefined) {
    const joinRoom = {
      type: "join",
      token: localStorage.getItem("token"),
      roomID: props.roomID
    }
    sendMessage(JSON.stringify(joinRoom));
  }



  function handleSendMessage(event: any) {

    event.preventDefault();
    const message = event.target.elements[0].value;
    if (message === '') return;
    event.target.elements[0].value = '';
    const jsonMessage = JSON.stringify({ type: "message", token: localStorage.getItem("token"), date: new Date(), content: message });
    sendMessage(jsonMessage);


  }

  useEffect(() => {
    if (lastMessage === null)
      return;
    const lastMessageData = JSON.parse(lastMessage.data);
    if (lastMessageData.type === "message") {
      return setMessages([...messages, lastMessageData]);
    }
    if (lastMessageData.type === "got") {
      return setRooms(lastMessageData.rooms);
    }
    if (lastMessageData.type === "join") {
      return setMessages([...messages, lastMessageData]);
    }




  }, [lastMessage]);


  useEffect(() => {
    const getAllRooms = {
      type: "get",
      token: localStorage.getItem("token"),
    }
    sendMessage(JSON.stringify(getAllRooms));
  }, []);



  return (
    <section className='chat'>
      <h1>Chat</h1>
      <div className="chat-container">
        <div className='chat-messages'>

          {messages.map((message, index) => (
            <Message key={index} {...message} />
          ))}

        </div>
        <div className="chat-rooms">
          {rooms.map((room, index) => (
            <ChatRoom key={index} id={room.id} nom={room.name} number={room.number} />
          ))}



        </div>
      </div>
      <form className="chat-message-footer" onSubmit={handleSendMessage}>
        <input type='text' />
        <button>Envoyer</button>
      </form>
    </section>
  );

  function ChatRoom(props: any) {
    const nom: string = props.nom;
    const id: string = props.id;
    const number: number = props.number;



    return (
      <div className="chat-room">
        <h2 className="room-name">{nom}</h2>
        <div className='room-content'>
          <p className='romm-users'>{number} utilisateurs</p>
          <button onClick={joinRoom}>Rejoindre</button>
        </div>
      </div>
    )

    function joinRoom() {
      sendMessage(JSON.stringify({ type: "join", token: localStorage.getItem("token"), roomId: id }));
    }


  }
}

export default Chat;



function Message(message: any) {
  const system = message.system;
  console.log(message);
  if (system == true) {
    return (

      <div className='message system'>
        <div className='message-header'>
          <div>
            <span className='message-author'>{message.author}</span>
            <svg className='author-verified' width="24" height="24" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M10.5213 2.62368C11.3147 1.75255 12.6853 1.75255 13.4787 2.62368L14.4989 3.74391C14.8998 4.18418 15.4761 4.42288 16.071 4.39508L17.5845 4.32435C18.7614 4.26934 19.7307 5.23857 19.6757 6.41554L19.6049 7.92905C19.5771 8.52388 19.8158 9.10016 20.2561 9.50111L21.3763 10.5213C22.2475 11.3147 22.2475 12.6853 21.3763 13.4787L20.2561 14.4989C19.8158 14.8998 19.5771 15.4761 19.6049 16.071L19.6757 17.5845C19.7307 18.7614 18.7614 19.7307 17.5845 19.6757L16.071 19.6049C15.4761 19.5771 14.8998 19.8158 14.4989 20.2561L13.4787 21.3763C12.6853 22.2475 11.3147 22.2475 10.5213 21.3763L9.50111 20.2561C9.10016 19.8158 8.52388 19.5771 7.92905 19.6049L6.41553 19.6757C5.23857 19.7307 4.26934 18.7614 4.32435 17.5845L4.39508 16.071C4.42288 15.4761 4.18418 14.8998 3.74391 14.4989L2.62368 13.4787C1.75255 12.6853 1.75255 11.3147 2.62368 10.5213L3.74391 9.50111C4.18418 9.10016 4.42288 8.52388 4.39508 7.92905L4.32435 6.41553C4.26934 5.23857 5.23857 4.26934 6.41554 4.32435L7.92905 4.39508C8.52388 4.42288 9.10016 4.18418 9.50111 3.74391L10.5213 2.62368Z" stroke="currentColor" stroke-width="1.5" /> <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /> </svg>
          </div>
          <span className='message-date'>{message.date}</span>
        </div>
        <div className='message-content'>{message.content}</div>
      </div>
    );
  }
  var className = 'message'

  if (message.cancelled == true)
    className = 'message cancelled';


  return (


    <div className={className}>
      <div className='message-header'>
        <span className='message-author'>{message.author}</span>
        <span className='message-date'>{message.date}</span>
      </div>
      <div className='message-content'>{message.content}</div>
    </div>
  );

}


