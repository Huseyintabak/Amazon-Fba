import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from './useSubscription';
import { useToast } from '../contexts/ToastContext';

export const useUpgradeRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { planType } = useSubscription();
  const { showToast } = useToast();

  const redirectToUpgrade = (feature?: string) => {
    if (!isAuthenticated) {
      showToast('Bu özelliği kullanmak için giriş yapın', 'info');
      navigate('/login');
      return;
    }

    if (planType === 'pro') {
      // Pro kullanıcı zaten premium, devam et
      return true;
    }

    // Free kullanıcı için premium yönlendirme
    const message = feature 
      ? `"${feature}" özelliği Pro plan gerektirir. Premium özelliklerimizi keşfedin!`
      : 'Bu özellik Pro plan gerektirir. Premium özelliklerimizi keşfedin!';
    
    showToast(message, 'info');
    navigate('/pricing');
    return false;
  };

  const checkAccess = (feature?: string) => {
    if (planType === 'pro') {
      return true;
    }
    
    redirectToUpgrade(feature);
    return false;
  };

  return {
    redirectToUpgrade,
    checkAccess,
    isFreeUser: planType === 'free',
    isProUser: planType === 'pro'
  };
};
