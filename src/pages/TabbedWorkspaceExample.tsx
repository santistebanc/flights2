import React from "react";
import TabbedWorkspaceDemo from "../components/TabbedWorkspaceDemo";

const TabbedWorkspaceExample: React.FC = () => {
  return (
    <div className="container mx-auto p-6 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Tabbed Workspace Component
        </h1>
        <p className="text-gray-400 mb-8">
          This is a browser-like tabbed workspace component that allows you to
          add and close tabs. Each tab can contain any content and supports
          dynamic creation and removal.
        </p>

        <TabbedWorkspaceDemo />

        <div className="mt-8 p-6 bg-gray-800 border border-gray-700 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Features</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Add new tabs with the + button</li>
            <li>• Close tabs by clicking the X button (appears on hover)</li>
            <li>• Switch between tabs by clicking on them</li>
            <li>• Responsive design with horizontal scrolling for many tabs</li>
            <li>• Support for non-closable tabs</li>
            <li>• Automatic tab switching when active tab is closed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TabbedWorkspaceExample;
