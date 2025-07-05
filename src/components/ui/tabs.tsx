import * as React from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/utils";
import { Button } from "./button";

export interface Tab {
  id: string;
  title: string;
  content: React.ReactNode;
  closable?: boolean;
}

export interface TabbedWorkspaceProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabAdd: () => void;
  onTabClose: (tabId: string) => void;
  className?: string;
  tabClassName?: string;
  contentClassName?: string;
}

const TabbedWorkspace = React.forwardRef<HTMLDivElement, TabbedWorkspaceProps>(
  (
    {
      tabs,
      activeTabId,
      onTabChange,
      onTabAdd,
      onTabClose,
      className,
      tabClassName,
      contentClassName,
    },
    ref
  ) => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col h-full bg-gray-800 border border-gray-700 rounded-lg",
          className
        )}
      >
        {/* Tab Bar */}
        <div className="flex items-center border-b border-gray-700 bg-gray-800 rounded-t-lg">
          {/* Tabs */}
          <div className="flex items-center flex-1 overflow-x-auto">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  "group flex items-center gap-2 px-4 py-3 border-r border-gray-700 bg-gray-700/50 hover:bg-gray-700 transition-colors cursor-pointer text-sm font-medium",
                  activeTabId === tab.id &&
                    "bg-gray-800 border-b-gray-800 text-white",
                  activeTabId !== tab.id && "text-gray-300 hover:text-white",
                  tabClassName
                )}
                onClick={() => onTabChange(tab.id)}
              >
                <span className="truncate">{tab.title}</span>
                {tab.closable !== false && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose(tab.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add Tab Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 mx-2 hover:bg-gray-700 text-gray-400 hover:text-white"
            onClick={onTabAdd}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Content */}
        <div
          className={cn("flex-1 overflow-auto bg-gray-800", contentClassName)}
        >
          {activeTab ? (
            <div className="h-full">{activeTab.content}</div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No tabs available
            </div>
          )}
        </div>
      </div>
    );
  }
);
TabbedWorkspace.displayName = "TabbedWorkspace";

export { TabbedWorkspace };
