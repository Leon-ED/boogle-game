import useWebSocket from 'react-use-websocket';
import { useState, useEffect } from 'react';
import { BACKEND_URL, MP_WS_URL } from '../env';

interface Settings{
  lignes: number,
  colonnes: number,
  temps: number,
  gameID: string,
  bloquerMots: boolean,
  politiqueScore: number,
}
export const Multiplayer = (props: any) => {
  const { sendMessage, lastMessage } = useWebSocket(MP_WS_URL);
  

  useEffect(() => {
    if (!props.gameID)
      return;
    const joinRoom = {
      type: "join",
      token: localStorage.getItem("token"),
      gameID: props.gameID,
    }
    sendMessage(JSON.stringify(joinRoom));
  }, [props.gameID]);

  return (
    <>

    </>);
}