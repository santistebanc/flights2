import React from "react";
import TabbedWorkspaceDemo from "../components/TabbedWorkspaceDemo";
import {
  TabbedWorkspace,
  TabMenu,
  TabContent,
  Tab,
} from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Search,
  Settings,
  BarChart3,
  FileText,
  Code,
  Database,
  Globe,
} from "lucide-react";

const TabbedWorkspaceExample: React.FC = () => {
  const [tabs, setTabs] = React.useState<Tab[]>([
    {
      id: "code",
      title: "Code Editor",
      content: (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">
            Code Editor
          </h2>
          <p className="text-muted-foreground mb-4">
            This tab demonstrates independent scrolling. The content area can
            scroll independently from the tab menu above.
          </p>

          {/* Generate lots of content to demonstrate scrolling */}
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="mb-4 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                Section {i + 1}
              </h3>
              <p className="text-muted-foreground mb-2">
                This is section {i + 1} with some sample content to demonstrate
                scrolling. The tab menu stays fixed at the top while this
                content scrolls independently.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Action {i + 1}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Action {i + 2}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "data",
      title: "Data View",
      content: (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">
            Data View
          </h2>
          <p className="text-muted-foreground mb-4">
            Another example with scrollable content. Notice how the tab menu
            remains fixed while you can scroll through this content.
          </p>

          {/* Generate a data table to demonstrate scrolling */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-3 text-left text-card-foreground border border-border">
                    ID
                  </th>
                  <th className="p-3 text-left text-card-foreground border border-border">
                    Name
                  </th>
                  <th className="p-3 text-left text-card-foreground border border-border">
                    Status
                  </th>
                  <th className="p-3 text-left text-card-foreground border border-border">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 50 }, (_, i) => (
                  <tr key={i} className="hover:bg-muted">
                    <td className="p-3 text-muted-foreground border border-border">
                      {i + 1}
                    </td>
                    <td className="p-3 text-muted-foreground border border-border">
                      Item {i + 1}
                    </td>
                    <td className="p-3 text-muted-foreground border border-border">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          i % 3 === 0
                            ? "bg-green-600 text-white"
                            : i % 3 === 1
                              ? "bg-yellow-600 text-white"
                              : "bg-red-600 text-white"
                        }`}
                      >
                        {i % 3 === 0
                          ? "Active"
                          : i % 3 === 1
                            ? "Pending"
                            : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground border border-border">
                      ${(Math.random() * 1000).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: "settings",
      title: "Settings",
      content: (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">
            Settings
          </h2>
          <p className="text-muted-foreground mb-4">
            Settings panel with various configuration options.
          </p>

          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-medium text-card-foreground mb-3">
                General Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Auto-save</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-muted-foreground"
                  >
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Notifications</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-muted-foreground"
                  >
                    Enabled
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-medium text-card-foreground mb-3">
                Appearance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Theme</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-muted-foreground"
                  >
                    Dark
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Font Size</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-muted-foreground"
                  >
                    Medium
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]);

  const [activeTabId, setActiveTabId] = React.useState("code");
  const [tabCounter, setTabCounter] = React.useState(4);

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
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">
            New Tab {tabCounter}
          </h2>
          <p className="text-muted-foreground mb-4">
            This is a new tab that was created dynamically. You can add any
            content here.
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              className="border-border text-muted-foreground hover:bg-muted hover:text-card-foreground"
            >
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
      const defaultTab: Tab = {
        id: "default",
        title: "Welcome",
        content: (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-card-foreground">
              Welcome
            </h2>
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
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[0].id);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-foreground">
          Tabbed Workspace Component
        </h1>
        <p className="text-muted-foreground mb-8">
          This is a browser-like tabbed workspace component that allows you to
          add and close tabs. Each tab can contain any content and supports
          dynamic creation and removal. The content area scrolls independently
          from the tab menu.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Demo */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Basic Demo
            </h2>
            <TabbedWorkspaceDemo />
          </div>

          {/* Advanced Demo with Scrollable Content */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Advanced Demo - Independent Scrolling
            </h2>
            <Card className="h-[600px] bg-card border-border">
              <CardContent className="p-0 h-full bg-card">
                <TabbedWorkspace
                  tabs={tabs}
                  activeTabId={activeTabId}
                  onTabChange={handleTabChange}
                  onTabAdd={handleTabAdd}
                  onTabClose={handleTabClose}
                  className="h-full"
                >
                  <TabMenu />
                  <TabContent />
                </TabbedWorkspace>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 p-6 bg-card border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Features
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Add new tabs with the + button</li>
            <li>• Close tabs by clicking the X button (appears on hover)</li>
            <li>• Switch between tabs by clicking on them</li>
            <li>• Responsive design with horizontal scrolling for many tabs</li>
            <li>• Support for non-closable tabs</li>
            <li>• Automatic tab switching when active tab is closed</li>
            <li>
              • <strong>Independent scrolling</strong> - content area scrolls
              separately from tab menu
            </li>
            <li>
              • Context-based state management for flexible component
              composition
            </li>
            <li>
              • <strong>Theme-aware</strong> - uses CSS variables for consistent
              styling
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TabbedWorkspaceExample;
