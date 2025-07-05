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
      <div ref={ref} className={cn("flex flex-col h-full", className)}>
        {/* Tab Bar */}
        <div className="flex items-center border-b bg-background">
          {/* Tabs */}
          <div className="flex items-center flex-1 overflow-x-auto">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  "group flex items-center gap-2 px-4 py-2 border-r border-b border-border bg-muted/50 hover:bg-muted transition-colors cursor-pointer",
                  activeTabId === tab.id && "bg-background border-b-background",
                  tabClassName
                )}
                onClick={() => onTabChange(tab.id)}
              >
                <span className="text-sm font-medium truncate">
                  {tab.title}
                </span>
                {tab.closable !== false && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
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
            className="h-8 w-8 p-0 mx-2 hover:bg-accent"
            onClick={onTabAdd}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Content */}
        <div className={cn("flex-1 overflow-auto", contentClassName)}>
          {activeTab ? (
            <div className="h-full">{activeTab.content}</div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
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
