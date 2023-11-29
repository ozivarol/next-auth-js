import cookie from "cookie";
import { useEffect } from "react";
import axios from "axios";

function validateState(state, cookies) {
  if (cookies) {
    const parsed = cookie.parse(cookies);
    const authCookie = parsed.authState;
    if (authCookie) {
      return state === authCookie;
    }
  }
  return false;
}

async function getTokenFromCode(code) {
  if (code) {
    try {
      const response = await axios.post(
        `https://github.com/login/oauth/access_token`,
        null,
        {
          params: {
            client_id: "da49f68ac43db28dfd0e",
            client_secret: "901770d363da71f9c2e0052e720c578c2fbffae5",
            code: code,
          },
          headers: {
            Accept: "application/json",
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  return null;
}

async function getUserFromToken(token) {
  if (token) {
    try {
      const response = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/json",
        },
      });

      const data = response.data;
      console.log(data);

      return {
        id: data.id,
        name: data.name,
        token: token,
        username: data.login,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  return null;
}

export async function getServerSideProps(ctx) {
  const { code, state } = ctx.query;

  if (code) {
    if (validateState(state, ctx.req.headers.cookie)) {
      const token = await getTokenFromCode(code);

      if (token) {
        const user = await getUserFromToken(token);

        if (user) {
          const authCookie = cookie.serialize("auth", JSON.stringify(user), {
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: true,
            path: "/",
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
          });

          ctx.res.setHeader("Set-Cookie", authCookie);
        }
      }
    }
  }

  return {
    props: {},
  };
}

const Callback = () => {
  useEffect(() => {
    window.location.href = "/";
  }, []);
  return null;
};

export default Callback;
