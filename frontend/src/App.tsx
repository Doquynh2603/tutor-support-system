/**
 * File: App.tsx
 * Mục đích: Root component của application
 * Vai trò:
 *   - Setup các providers (Redux, React Query, Router)
 *   - Định nghĩa routing structure
 * Lưu ý:
 *   - Thứ tự providers: Redux → React Query → Router
 *   - React Query config: refetchOnWindowFocus = false, retry = 1
 *   - Cần cài đặt dependencies trước: react-router-dom, @tanstack/react-query, react-redux
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './store';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// Cấu hình React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Không refetch khi focus window
      retry: 1, // Chỉ retry 1 lần khi fail
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
