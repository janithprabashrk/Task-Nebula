export type JwtUser = {
  id: number;
  role: 'admin' | 'member';
  email: string;
  name: string;
};
