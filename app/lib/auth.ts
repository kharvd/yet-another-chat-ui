import {
  createCookieSessionStorage,
  LoaderFunctionArgs,
  Session,
  TypedResponse,
} from "@vercel/remix"; // or cloudflare/deno
import jwt from "jsonwebtoken";

type SessionData = {
  jwt: string;
};

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData>({
    // a Cookie from `createCookie` or the same CookieOptions to create one
    cookie: {
      name: "__session",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });

const hasPasswordAuth = (request: Request) => {
  const auth = request.headers.get("Authorization");
  if (!auth) {
    return false;
  }

  const base64Credentials = auth.split(" ")[1];
  const [username, password] = Buffer.from(base64Credentials, "base64")
    .toString()
    .split(":");

  const expectedUsername = process.env.AUTH_USERNAME;
  const expectedPassword = process.env.AUTH_PASSWORD;

  return username === expectedUsername && password === expectedPassword;
};

const issueJwt = () => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set");
  }

  return jwt.sign(
    {
      loggedIn: true,
    },
    jwtSecret
  );
};

const verifyJwt = (session: Session<SessionData>) => {
  const jwtToken = session.get("jwt");
  if (!jwtToken) {
    return false;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set");
  }

  try {
    const decoded = jwt.verify(jwtToken, jwtSecret) as { loggedIn: boolean };
    return decoded.loggedIn;
  } catch (e) {
    return false;
  }
};

export const requireAuthentication = async (
  request: Request
): Promise<Session<SessionData>> => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!hasPasswordAuth(request) && !verifyJwt(session)) {
    throw new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": "Basic",
      },
    });
  }
  // refresh jwt
  session.set("jwt", issueJwt());
  return session;
};

export const withAuthentication = <T>(
  loader: (args: LoaderFunctionArgs) => Promise<TypedResponse<T>>
): ((args: LoaderFunctionArgs) => Promise<TypedResponse<T>>) => {
  return async (params) => {
    const { request } = params;
    const session = await requireAuthentication(request);
    const response = await loader(params);
    response.headers.set(
      "Set-Cookie",
      await commitSession(session, {
        expires: new Date(2050, 1, 1),
      })
    );
    return response;
  };
};
