import { Link } from "@remix-run/react";
import { X } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { useChatHistory } from "~/hooks/use_chat_history";
import { Button } from "./button";
import { deleteChat } from "~/lib/client_data";

export function AppSidebar() {
  const chats = useChatHistory();
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={`/chat/${chat.id}`}
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                      className="flex items-center justify-between"
                    >
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {chat.title}
                      </span>
                      <div className="group/item pl-4">
                        <Button
                          variant="ghost"
                          className="invisible group-hover/item:visible text-gray-500 hover:text-gray-700 transition-opacity p-0"
                          onClick={(e) => {
                            deleteChat(chat.id);
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
