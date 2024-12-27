import React, { useEffect, useState } from 'react';
import * as TicketService from "@/services/ticketService";
import * as Message from "@/components/ui/alert"
import { useMutation } from 'react-query';

const Test = () => {
    
  const MY_BANK = "MB"; 
  const ACCOUNT_NO = "0948041545"; 
  const ACCOUNT_NAME = "CAO DUONG LAM";
  const price = 50000;


  const [selectedLine, setSelectedLine] = useState("");

  const mutationCreate = useMutation({
    mutationFn: async (data) => {
      return await TicketService.createTicket(data)
    },
    onSuccess: (data) => {
      if (data.status === "OK"){
        Message.success(data.message);
      } else {
        Message.error(data.message);
      }
    },
    onError: (error) => {
      console.log(error);
    },
  })

  const mutationCheckPaid = useMutation({
    mutationFn: async () => {
      return await TicketService.checkPaid()
    },
    onSuccess: (data) => {
    
    },
    onError: (error) => {
      console.log(error);
    },
  })

    useEffect(() => {
        setInterval(() => {
            mutationCheckPaid.mutate();
        }, 5000)
    })
    
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex items-center gap-2 basis-1/5">
            <label className="text-gray-700">Time:</label>
            <select
              onChange={(e) => setSelectedLine(e.target.value)}
              value={selectedLine}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700">
              <option value="Line 1">Line 1</option>
              <option value="Line 2">Line 2</option>
              <option value="Line 3">Line 3</option>
            </select>
          </div>
      <img src={`https://img.vietqr.io/image/${MY_BANK}-${ACCOUNT_NO}-compact2.png?amount=${price}&accountName=${ACCOUNT_NAME}`}></img>
    </div>
  );
};

export default Test;
