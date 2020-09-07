import React, { useEffect, useState } from "react";
import SocketIO from "socket.io-client";
import ax from "axios";
import "./App.css";

function App() {
  const [qr, setQr] = useState<any>(null);
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

  const [orderId, setOrderId] = useState<string | null>(null);

  const generateQr = async (orderId: string) => {
    const res = await ax.post(
      "http://localhost:4000/api/v1/qr/generate",
      {
        orderId,
      },
      { responseType: "blob" }
    );

    return res;
  };

  const generateOrderId = async (): Promise<string> => {
    const order = await ax.post("http://localhost:4000/api/v1/order/generate");
    return order.data?.orderId;
  };

  const initateCheckout = async () => {
    // 1. Generate Payment Request
    // 2. Connect to WS and create room with orderId
    // 3. Attach listeners for that orderId

    try {
      const orderId = await generateOrderId();

      const qr = await generateQr(orderId);

      const socket = SocketIO("http://localhost:4000", {});
      setSocket(socket);

      socket.emit("create-order", {
        orderId,
      });

      socket.on(`ORDER_${orderId}`, (data: any) => {
        console.log("IMAMO NESTO OD ORDERA", data);
      });

      setQr(qr.data);
      console.log("ORDER ID", orderId);
    } catch (e) {
      socket?.disconnect();
    }
  };
  //tekPartTP59
  return (
    <div className="App">
      <h1>Test</h1>
      <button onClick={() => initateCheckout()}>GENERATE QR</button>
      {qr && <img src={window.URL.createObjectURL(qr)} alt="PAYMENT QR" />}
    </div>
  );
}

export default App;
