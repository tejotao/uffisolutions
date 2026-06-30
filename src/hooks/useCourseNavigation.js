import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Or your specific auth hook path

export function useCourseNavigation() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCourseClick = (product, isFreeCourse, isPurchased = false) => {
    const targetId = product.slug || product.id;

    if (isPurchased) {
      navigate(`/courses/${targetId}`);
      return;
    }

    if (!user) {
      if (isFreeCourse) {
        navigate('/login', {
          state: {
            message: "Para acessar nossos conteúdos gratuitos, faça seu cadastro rapidamente.",
            redirectTo: `/courses/${targetId}`
          }
        });
      } else {
        navigate(`/curso/${targetId}`);
      }
    } else {
      if (isFreeCourse) {
        navigate(`/courses/${targetId}`);
      } else {
        navigate(`/curso/${targetId}`);
      }
    }
  };

  return { handleCourseClick };
}