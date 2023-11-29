import crypto from "crypto";
import cookie from "cookie";
import { HttpsProxyAgent } from "https-proxy-agent";
export async function getServerSideProps(ctx) {
  const state = crypto.randomUUID();

  const authCookie = cookie.serialize("authState", state, {
    maxAge: 60 * 15, // 15 dakika
    httpOnly: true,
    path: "/auth/",
    secure: process.env.NODE_ENV === "production",
  });

  ctx.res.setHeader("Set-Cookie", authCookie);

  return {
    redirect: {
      destination: `https://github.com/login/oauth/authorize?client_id=da49f68ac43db28dfd0e&scope=read:user&state=${state}`,
      permanent: false,
    },
  };
}

const Login = () => null;

export default Login;
