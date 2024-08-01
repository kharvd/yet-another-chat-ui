export const isAuthenticated = (request: Request) => {
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

  if (username !== expectedUsername || password !== expectedPassword) {
    return false;
  }

  return true;
};
