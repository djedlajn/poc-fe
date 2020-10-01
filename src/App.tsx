import React, { useState } from "react";
import SocketIO from "socket.io-client";
import ax from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const URL = "http://localhost:4001";

function App() {
  const [qr, setQr] = useState<any>(null);
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

  // const [orderId, setOrderId] = useState<string | null>(null);

  const generateQr = async (orderId: string) => {
    const res = await ax.post(
      `${URL}/api/v1/qr/generate`,
      {
        orderId,
      },
      { responseType: "blob" }
    );

    return res;
  };

  const generateOrderId = async (): Promise<string> => {
    const order = await ax.post(`${URL}/api/v1/order/generate`, {
      amount: 931.22,
      currency: "981",
      item: [{ id: 123 }],
    });
    return order.data?.orderId;
  };

  const initateCheckout = async () => {
    // 1. Generate Payment Request
    // 2. Connect to WS and create room with orderId
    // 3. Attach listeners for that orderId

    try {
      const orderId = await generateOrderId();

      const qr = await generateQr(orderId);

      const socket = SocketIO(`${URL}`, {});
      setSocket(socket);

      socket.emit("create-order", {
        orderId,
      });

      socket.on(`ORDER_ID_${orderId}`, (data: any) => {
        console.log("IMAMO NESTO OD ORDERA", data);
        if (data.type === "TRANSACTION_SUCCESSFULL") {
          toast(`Order: ${data.orderId} successfull :)`, {
            type: "success",
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          toast(`Order: ${data.orderId} unsuccessfull :(`, {
            position: "bottom-right",
            type: "error",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
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
      <ToastContainer />
      <h1>Test</h1>
      <button onClick={() => initateCheckout()}>GENERATE QR</button>
      {qr && <img src={window.URL.createObjectURL(qr)} alt="PAYMENT QR" />}
    </div>
  );
}

export default App;
