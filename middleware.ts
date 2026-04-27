import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ token }) {
      if (token) return true;
      return false;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/chat/:path*', '/users/:path*'],
};