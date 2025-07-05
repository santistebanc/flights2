import React, { useState } from "react";
import { TabbedWorkspace, Tab } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Search, Settings, BarChart3, FileText } from "lucide-react";

const TabbedWorkspaceDemo: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "search",
      title: "Flight Search",
      content: (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Flight Search</h2>
          <p className="text-muted-foreground">
            Search for flights between airports. Enter your departure and
            arrival locations, select dates, and find the best deals.
          </p>
          <div className="mt-4">
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Start Search
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "analytics",
      title: "Analytics",
      content: (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            View detailed analytics about flight searches, popular routes, and
            pricing trends.
          </p>
          <div className="mt-4">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "settings",
      title: "Settings",
      content: (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <p className="text-muted-foreground">
            Configure your preferences, notification settings, and account
            information.
          </p>
          <div className="mt-4">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </div>
        </div>
      ),
    },
  ]);

  const [activeTabId, setActiveTabId] = useState("search");
  const [tabCounter, setTabCounter] = useState(4);

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleTabAdd = () => {
    const newTabId = `tab-${tabCounter}`;
    const newTab: Tab = {
      id: newTabId,
      title: `New Tab ${tabCounter}`,
      content: (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">New Tab {tabCounter}</h2>
          <p className="text-muted-foreground">
            This is a new tab that was created dynamically. You can add any
            content here.
          </p>
          <div className="mt-4">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Sample Action
            </Button>
          </div>
        </div>
      ),
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
    setTabCounter(tabCounter + 1);
  };

  const handleTabClose = (tabId: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== tabId);

    if (newTabs.length === 0) {
      // If no tabs left, create a default tab
      const defaultTab: Tab = {
        id: "default",
        title: "Welcome",
        content: (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome</h2>
            <p className="text-muted-foreground">
              Click the + button to add a new tab and start working.
            </p>
          </div>
        ),
        closable: false,
      };
      setTabs([defaultTab]);
      setActiveTabId("default");
    } else {
      setTabs(newTabs);
      // If the closed tab was active, switch to the first available tab
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[0].id);
      }
    }
  };

  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <CardTitle>Tabbed Workspace Demo</CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full">
        <TabbedWorkspace
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
          onTabAdd={handleTabAdd}
          onTabClose={handleTabClose}
          className="h-full"
        />
      </CardContent>
    </Card>
  );
};

export default TabbedWorkspaceDemo;
