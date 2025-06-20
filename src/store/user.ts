import { defineStore } from 'pinia';
import { StorageUtil, Api, CUtil } from 'cty-cms-ui';
import Cookie from 'js-cookie';
import { config } from '../config';

const TokenKey = 'success-token';

export interface userInfo {
  id: number | string;
  name: string;
  username: string;
  instName: string;
  instid: string;
  orgName: string;
  email: string;
  phone: string;
  token: string;
  avatar: string;
  roles: string[];
  permissions: string[];
  orgid: string;
}

export const useUserStore = defineStore('user', {
  state() {
    const userState: userInfo = {
      id: '',
      name: '',
      username: '',
      instName: '',
      instid: '',
      orgName: '',
      email: '',
      phone: '',
      token: '',
      avatar: '',
      roles: [],
      permissions: [],
      orgid: '',
    };
    return userState;
  },
  actions: {
    setInfo(userInfo: any) {
      this.id = userInfo.userId;
      this.name = userInfo.nickName;
      this.username = userInfo.username;
      this.instName = userInfo.instName;
      this.instid = userInfo.instid;
      this.orgName = userInfo.orgName;
      this.email = userInfo.email;
      this.phone = userInfo.phone;
      this.avatar = userInfo.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
      if (userInfo.roles && userInfo.roles.length > 0) this.roles = [...userInfo.roles];
      this.permissions = [...userInfo.roles];
      if (userInfo.orgid) this.orgid = userInfo.orgid;
      StorageUtil.setSession('user-info', {
        name: userInfo.nickName,
        username: userInfo.username,
        instName: userInfo.instName,
        instid: userInfo.instid,
        orgName: userInfo.orgName,
        email: userInfo.email,
        phone: userInfo.phone,
        roles: userInfo.roles,
        permissions: userInfo.roles,
        avatar: userInfo.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        orgid: this.orgid,
      });
      StorageUtil.setSession('status', 1);
    },
    setId(id: string | number) {
      this.id = id;
    },
    setName(name: string) {
      this.name = name;
    },
    setUserName(name: string) {
      this.username = name;
    },
    setInstName(instname: string) {
      this.instName = instname;
    },
    setInstid(instid: string) {
      this.instid = instid;
    },
    setOrgName(orgname: string) {
      this.orgName = orgname;
    },
    setEmail(email: string) {
      this.email = email;
    },
    setPhone(phone: string) {
      this.phone = phone;
    },
    setOrgid(orgid: string) {
      this.orgid = orgid;
    },
    setAvatar(avatar: string) {
      this.avatar = avatar;
    },
    setRoles(roles: string[]) {
      this.roles = roles;
    },
    setPermissions(permissions: string[]) {
      this.permissions = permissions;
    },
    setToken() {
      Cookie.set(TokenKey, 'success');
    },
    removeToken() {
      Cookie.remove(TokenKey);
    },
    isLogin() {
      return !!Cookie.get(TokenKey);
    },
    async logOut(is401 = false) {
      if (this.isLogin()) {
        if (!is401) {
          await Api.callApi('home.Logout');
        }
        this.token = '';
        this.name = '';
        this.username = '';
        this.instName = '';
        this.instid = '';
        this.orgName = '';
        this.orgid = '';
        this.email = '';
        this.phone = '';
        this.avatar = '';
        this.roles = [];
        this.permissions = [];
        this.removeToken();
      }
      location.reload();
    },
    login(userInfo: any) {
      const { username, password, code } = userInfo;
      return new Promise((resolve, reject) => {
        const params = {
          name: username.trim(),
          pwd: CUtil.getPwdEncrypt(password),
          vcode: code,
        };
        if (config.loginSwitch) {
          // 虚拟登录
          this.setInfo({
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            nickName: '超级管理员',
            username: 'admin',
            instName: '',
            instid: '',
            orgName: '',
            orgid: '',
            email: '',
            phone: '',
            roles: [],
            userId: 1,
          });
          this.setPermissions(['admin']);
          this.setToken();
          setTimeout(() => {
            resolve('ok');
          }, 1000);
        } else {
          // 通过登录API请求
          Api.callApi('home.Login', params)
            .then((res: any) => {
              if (res.code === 0) {
                this.setToken();
                this.setName(res.data.name);
                this.setAvatar(res.data.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png');
                this.setPermissions(res.data.roles);
                this.setId(res.data.id);
                StorageUtil.setSession('user-info', {
                  name: res.data.name,
                  roles: res.data.roles,
                  permissions: res.data.roles,
                  avatar: res.data.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
                });
                resolve('ok');
              } else {
                reject(res.msg || `error`);
              }
            })
            .catch((err: any) => {
              reject(err);
            });
        }
      });
    },
    // 获取用户信息
    getUserInfo() {
      return new Promise((resolve, reject) => {
        const infoStr = sessionStorage.getItem('user-info');
        if (infoStr) {
          const userInfo = JSON.parse(infoStr);
          this.setRoles(userInfo.roles);
          this.setPermissions(userInfo.permissions);
          this.setName(userInfo.name);
          this.setUserName(userInfo.username);
          this.setInstName(userInfo.instName);
          this.setInstid(userInfo.instid);
          this.setOrgName(userInfo.orgName);
          this.setEmail(userInfo.email);
          this.setPhone(userInfo.phone);
          this.setOrgid(userInfo.orgid);
          this.setAvatar(userInfo.avatar);
          resolve('ok');
        } else {
          reject();
        }
      });
    },
  },
});
