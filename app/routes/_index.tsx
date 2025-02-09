import { HeadersFunction } from "@remix-run/node";
import { type MetaFunction, json } from "@vercel/remix";
import { withAuthentication } from "~/lib/auth";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "@remix-run/react";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";
import { getChatId } from "~/lib/client_data";

export const meta: MetaFunction = () => {
  return [
    { title: "Yet Another Chat UI" },
    { name: "description", content: "Yet Another Chat UI" },
    {
      name: "viewport",
      content:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    },
  ];
};

export const loader = withAuthentication(async () => {
  return json({});
});

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const headers = new Headers();
  const settableHeaders = ["WWW-Authenticate"];

  for (const header of settableHeaders) {
    if (loaderHeaders.has(header)) {
      headers.set(header, loaderHeaders.get(header)!);
    }
  }

  return headers;
};

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 401:
        return <div>Unauthorized</div>;
      default:
        return <div>Error</div>;
    }
  }
}

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    let chatId = getChatId() ?? uuidv4();
    navigate(`/chat/${chatId}`);
  }, [navigate]);

  return null;
}
