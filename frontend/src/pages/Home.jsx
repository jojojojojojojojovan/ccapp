import { useAuth } from '../context/AuthContext';
import AdminHomePage from './AdminHomePage';
import HomePage from './HomePage';

export default function Home() {
  const { user } = useAuth();

  if (user?.role === 'ROLE_ADMIN') {
    return <AdminHomePage />;
  }

  return <HomePage />;
}