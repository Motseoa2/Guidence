// utils/companyAuth.js
export const getCompanyAuth = () => {
  try {
    const companyUser = localStorage.getItem('companyUser');
    const companyId = localStorage.getItem('companyId');
    const userRole = localStorage.getItem('userRole');
    
    if (!companyUser || userRole !== 'company') {
      return null;
    }
    
    return {
      ...JSON.parse(companyUser),
      companyId
    };
  } catch (error) {
    console.error('Error getting company auth:', error);
    return null;
  }
};

export const isCompanyLoggedIn = () => {
  return getCompanyAuth() !== null;
};

export const logoutCompany = () => {
  localStorage.removeItem('companyUser');
  localStorage.removeItem('userRole');
  localStorage.removeItem('companyId');
  localStorage.removeItem('companyToken');
};

export const getAuthHeaders = () => {
  const companyAuth = getCompanyAuth();
  return {
    'Content-Type': 'application/json',
    ...(companyAuth && { 'X-Company-ID': companyAuth.id })
  };
};