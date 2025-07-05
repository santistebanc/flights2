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
          <h2 className="text-xl font-semibold mb-4 text-white">Code Editor</h2>
          <p className="text-gray-400 mb-4">
            This tab demonstrates independent scrolling. The content area can
            scroll independently from the tab menu above.
          </p>

          {/* Generate lots of content to demonstrate scrolling */}
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="mb-4 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">
                Section {i + 1}
              </h3>
              <p className="text-gray-300 mb-2">
                This is section {i + 1} with some sample content to demonstrate
                scrolling. The tab menu stays fixed at the top while this
                content scrolls independently.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  Action {i + 1}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-600"
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
          <h2 className="text-xl font-semibold mb-4 text-white">Data View</h2>
          <p className="text-gray-400 mb-4">
            Another example with scrollable content. Notice how the tab menu
            remains fixed while you can scroll through this content.
          </p>

          {/* Generate a data table to demonstrate scrolling */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-3 text-left text-white border border-gray-600">
                    ID
                  </th>
                  <th className="p-3 text-left text-white border border-gray-600">
                    Name
                  </th>
                  <th className="p-3 text-left text-white border border-gray-600">
                    Status
                  </th>
                  <th className="p-3 text-left text-white border border-gray-600">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 50 }, (_, i) => (
                  <tr key={i} className="hover:bg-gray-700">
                    <td className="p-3 text-gray-300 border border-gray-600">
                      {i + 1}
                    </td>
                    <td className="p-3 text-gray-300 border border-gray-600">
                      Item {i + 1}
                    </td>
                    <td className="p-3 text-gray-300 border border-gray-600">
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
                    <td className="p-3 text-gray-300 border border-gray-600">
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
          <h2 className="text-xl font-semibold mb-4 text-white">Settings</h2>
          <p className="text-gray-400 mb-4">
            Settings panel with various configuration options.
          </p>

          <div className="space-y-6">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3">
                General Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Auto-save</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Notifications</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    Enabled
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3">
                Appearance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Theme</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    Dark
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Font Size</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300"
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
          <h2 className="text-xl font-semibold mb-4 text-white">
            New Tab {tabCounter}
          </h2>
          <p className="text-gray-400 mb-4">
            This is a new tab that was created dynamically. You can add any
            content here.
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
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
            <h2 className="text-xl font-semibold mb-4 text-white">Welcome</h2>
            <p className="text-gray-400">
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
    <div className="container mx-auto p-6 bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Tabbed Workspace Component
        </h1>
        <p className="text-gray-400 mb-8">
          This is a browser-like tabbed workspace component that allows you to
          add and close tabs. Each tab can contain any content and supports
          dynamic creation and removal. The content area scrolls independently
          from the tab menu.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Demo */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">
              Basic Demo
            </h2>
            <TabbedWorkspaceDemo />
          </div>

          {/* Advanced Demo with Scrollable Content */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">
              Advanced Demo - Independent Scrolling
            </h2>
            <Card className="h-[600px] bg-gray-800 border-gray-700">
              <CardContent className="p-0 h-full bg-gray-800">
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

        <div className="mt-8 p-6 bg-gray-800 border border-gray-700 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Features</h2>
          <ul className="space-y-2 text-sm text-gray-300">
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
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TabbedWorkspaceExample;
