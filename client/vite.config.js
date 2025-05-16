
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: [
      'sih-chatbot-app-frntd.onrender.com', // Add your Render.com host here
      // Add other allowed hosts if needed
    ],
  },
  // Other configurations...
});
