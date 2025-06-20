import { useUserStore } from '../store/user';

const { permissions, roles } = useUserStore();

/**
 * 字符权限校验
 * @param {Array} value 校验值
 * @return {Boolean}
 */
export const checkPermiss = (value: string[]) => {
  if (Array.isArray(value) && value.length > 0) {
    const permissionDatas = value;
    const all_permission = '*:*:*';
    const hasPermission = permissions.some((permission: string) => {
      return all_permission === permission || permissionDatas.includes(permission);
    });
    return hasPermission;
  } else {
    console.error(`need roles!Like checkPermi="['system:user:add','system:user:edit']"`);
    return false;
  }
};

/**
 * 角色权限校验
 * @param {Array} value 校验值
 * @return {Boolean}
 */

export const checkRole = (value: string[]) => {
  if (Array.isArray(value) && value.length > 0) {
    const permissionRoles = value;
    const super_role = 'admin';
    const hasRole = roles.some((role: string) => {
      return super_role === role || permissionRoles.includes(role);
    });
    return hasRole;
  } else {
    console.error(`need roles! Like checkRole="['admin','editor']"`);
    return false;
  }
};
