'use client';
import { Box, Button, Stack, TextField, Typography, CircularProgress } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import Image from 'next/image'; // Import Image component for Next.js

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi! I'm the Wildcat Support Agent, how can I assist you today?`
  }]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return; // Avoid sending empty messages

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' }
    ]);
    setMessage(''); // Clear the input field after sending
    setLoading(true); // Show loading indicator

    try {
      const response = await fetch('api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) {
        console.error('Failed to fetch response from API');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          return [
            ...prevMessages.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + result }
          ];
        });
      }
      setLoading(false); // Hide loading indicator
    } catch (error) {
      console.error('Error:', error);
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex"
      flexDirection="column"
      alignItems="center"
      position="relative" // Ensure the image can be positioned absolutely
    >
      <Box className="header" mb={2}>
        <Typography variant="h4" component="h1">Wildcat AI Chatbot</Typography>
      </Box>
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={2}
        borderRadius={10}
        overflow="auto"
        position="relative"
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
        >
          {messages.map((msg, index) => (
            <Box 
              key={index} 
              display="flex" 
              justifyContent={msg.role === 'assistant' ? "flex-start" : "flex-end"}
            >
              <Box 
                bgcolor={msg.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                color="white"
                borderRadius={16}
                p={2}
                maxWidth="80%"
              >
                {msg.content}
              </Box>
            </Box>
          ))}
          {loading && (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Stack>
        
        <Stack direction="row" spacing={2} alignItems="center"> 
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
      <Box className="chatbot-image" mt={2}>
        <Image src="/wildcat.jpg" alt="Wildcat" width={100} height={100} />
      </Box>
    </Box>
  );
}
