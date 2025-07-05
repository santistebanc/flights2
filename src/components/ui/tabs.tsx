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

// Context for tab state management
interface TabbedWorkspaceContextType {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabAdd: () => void;
  onTabClose: (tabId: string) => void;
}

const TabbedWorkspaceContext =
  React.createContext<TabbedWorkspaceContextType | null>(null);

export const useTabbedWorkspace = () => {
  const context = React.useContext(TabbedWorkspaceContext);
  if (!context) {
    throw new Error("useTabbedWorkspace must be used within a TabbedWorkspace");
  }
  return context;
};

// Tab Menu Component
export interface TabMenuProps {
  className?: string;
  tabClassName?: string;
}

export const TabMenu = React.forwardRef<HTMLDivElement, TabMenuProps>(
  ({ className, tabClassName }, ref) => {
    const { tabs, activeTabId, onTabChange, onTabAdd, onTabClose } =
      useTabbedWorkspace();

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center border-b border-border bg-card rounded-t-lg",
          className
        )}
      >
        {/* Tabs */}
        <div className="flex items-center flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "group flex items-center gap-2 px-4 py-3 border-r border-border bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-sm font-medium",
                activeTabId === tab.id &&
                  "bg-card border-b-card text-card-foreground",
                activeTabId !== tab.id &&
                  "text-muted-foreground hover:text-card-foreground",
                tabClassName
              )}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="truncate">{tab.title}</span>
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
          className="h-8 w-8 p-0 mx-2 hover:bg-accent text-muted-foreground hover:text-accent-foreground"
          onClick={onTabAdd}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);
TabMenu.displayName = "TabMenu";

// Tab Content Component
export interface TabContentProps {
  className?: string;
}

export const TabContent = React.forwardRef<HTMLDivElement, TabContentProps>(
  ({ className }, ref) => {
    const { tabs, activeTabId } = useTabbedWorkspace();
    const activeTab = tabs.find((tab) => tab.id === activeTabId);

    return (
      <div ref={ref} className={cn("flex-1 overflow-auto bg-card", className)}>
        {activeTab ? (
          <div className="h-full">{activeTab.content}</div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No tabs available
          </div>
        )}
      </div>
    );
  }
);
TabContent.displayName = "TabContent";

// Main TabbedWorkspace Component
export interface TabbedWorkspaceProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabAdd: () => void;
  onTabClose: (tabId: string) => void;
  className?: string;
  children?: React.ReactNode;
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
      children,
    },
    ref
  ) => {
    const contextValue: TabbedWorkspaceContextType = {
      tabs,
      activeTabId,
      onTabChange,
      onTabAdd,
      onTabClose,
    };

    return (
      <TabbedWorkspaceContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            "flex flex-col h-full bg-card border border-border rounded-lg",
            className
          )}
        >
          {children}
        </div>
      </TabbedWorkspaceContext.Provider>
    );
  }
);
TabbedWorkspace.displayName = "TabbedWorkspace";

export { TabbedWorkspace };
