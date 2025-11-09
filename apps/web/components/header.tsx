"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center">
              <span className="text-blue-600 text-xs font-bold">Lidl</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Buchhaltung</div>
              <div className="text-xs text-gray-500">12 members</div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src="/avatar.jpg" />
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Amit Jadhav</span>
            <span className="text-xs text-gray-500">Admin</span>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  );
}

