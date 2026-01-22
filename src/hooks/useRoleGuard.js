import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../services/authService";
import { ROLES } from "../constants/roles.js";

const ALLOWED_ROLE_NAMES = {
  USER: [ROLES.USER],
  OWNER: [ROLES.OWNER, "ROLE_STORE_OWNER"],
  RIDER: [ROLES.RIDER],
};

export default function useRoleGuard(expectedAccountType, fallbackUser) {
  const navigate = useNavigate();
  const [state, setState] = useState({
    user: fallbackUser,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    const fetchMe = async () => {
      try {
        const response = await getMe();
        const data = response.data || {};
        const accountType = data.accountType;
        const roleName = data.roleName;
        const allowedRoles = ALLOWED_ROLE_NAMES[expectedAccountType] || [];
        const allowed =
          (accountType && accountType === expectedAccountType) ||
          (roleName && allowedRoles.includes(roleName));

        if (!allowed) {
          navigate("/select", { replace: true });
          return;
        }

        if (!active) {
          return;
        }

        setState({
          user: {
            ...fallbackUser,
            name: data.name || data.loginKey || fallbackUser.name,
            accountType: accountType || expectedAccountType,
            roleName,
          },
          loading: false,
        });
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          navigate("/select", { replace: true });
          return;
        }

        if (!active) {
          return;
        }

        setState({
          user: fallbackUser,
          loading: false,
        });
      }
    };

    fetchMe();
    return () => {
      active = false;
    };
  }, [expectedAccountType, fallbackUser, navigate]);

  return state;
}
