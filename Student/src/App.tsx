
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PaymentProvider } from './context/PaymentContext';
import { AppRouter } from './router/AppRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

const queryClient = new QueryClient();

function App() {
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