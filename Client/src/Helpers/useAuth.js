import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { isLoggedIn, data: user, role } = useSelector(state => state.auth);
  
  return {
    isLoggedIn,
    user,
    role,
    isAdmin: role === 'ADMIN',
    isTeacher: role === 'TEACHER',
    isStudent: role === 'USER',
  };
};
