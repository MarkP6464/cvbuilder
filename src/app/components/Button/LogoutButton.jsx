import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';

export const LogoutButton = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: '/login',
      },
      returnTo: '/login',
    });
  };

  return (
    <button
      className="button__logout"
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
    >
      Log Out
    </button>
  );
};
