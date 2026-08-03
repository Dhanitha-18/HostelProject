import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PaymentProvider } from './context/PaymentContext';
import { AppRouter } from './router/AppRouter';
// import { useEffect } from 'react';
// import { initSocket } from './lib/socket';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css'; // keeps Vite structure intact

const queryClient = new QueryClient();

function App() {
  // useEffect(() => {
  //   initSocket();
  // }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PaymentProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </PaymentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
