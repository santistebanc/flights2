# TabbedWorkspace Component

A browser-like tabbed workspace component that allows users to add and close tabs dynamically.

## Features

- ✅ Add new tabs with a + button
- ✅ Close tabs with an X button (appears on hover)
- ✅ Switch between tabs by clicking
- ✅ Responsive design with horizontal scrolling
- ✅ Support for non-closable tabs
- ✅ Automatic tab switching when active tab is closed
- ✅ Fully customizable styling
- ✅ TypeScript support
- ✅ Dark theme with gray colors and yellow accents

## Usage

```tsx
import { TabbedWorkspace, Tab } from "./ui/tabs";

const MyComponent = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "tab1",
      title: "My Tab",
      content: <div>Tab content here</div>,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState("tab1");

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleTabAdd = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: "New Tab",
      content: <div>New tab content</div>,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleTabClose = (tabId: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    // Switch to first available tab if current tab was closed
    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
  };

  return (
    <TabbedWorkspace
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={handleTabChange}
      onTabAdd={handleTabAdd}
      onTabClose={handleTabClose}
    />
  );
};
```

## API

### Tab Interface

```tsx
interface Tab {
  id: string; // Unique identifier for the tab
  title: string; // Display name for the tab
  content: React.ReactNode; // Content to render in the tab
  closable?: boolean; // Whether the tab can be closed (default: true)
}
```

### TabbedWorkspace Props

```tsx
interface TabbedWorkspaceProps {
  tabs: Tab[]; // Array of tabs to display
  activeTabId: string; // ID of the currently active tab
  onTabChange: (tabId: string) => void; // Called when a tab is clicked
  onTabAdd: () => void; // Called when the add button is clicked
  onTabClose: (tabId: string) => void; // Called when a tab is closed
  className?: string; // Additional CSS classes for the container
  tabClassName?: string; // Additional CSS classes for individual tabs
  contentClassName?: string; // Additional CSS classes for the content area
}
```

## Styling

The component uses a dark theme with Tailwind CSS classes:

- **Container**: `bg-gray-800 border-gray-700` with rounded corners
- **Active tab**: `bg-gray-800 text-white` with border styling
- **Inactive tabs**: `bg-gray-700/50 text-gray-300` with hover effects
- **Close button**: Appears on hover with `hover:bg-red-600` destructive state
- **Add button**: Ghost variant with `hover:bg-gray-700` accent state
- **Content area**: `bg-gray-800` background

## Examples

### Non-closable Tab

```tsx
const tabs: Tab[] = [
  {
    id: "welcome",
    title: "Welcome",
    content: <div>Welcome content</div>,
    closable: false, // This tab cannot be closed
  },
];
```

### Custom Styling

```tsx
<TabbedWorkspace
  tabs={tabs}
  activeTabId={activeTabId}
  onTabChange={handleTabChange}
  onTabAdd={handleTabAdd}
  onTabClose={handleTabClose}
  className="h-full border-2 border-yellow-400"
  tabClassName="px-6 py-3"
  contentClassName="p-4"
/>
```

## Accessibility

- Tab buttons have proper ARIA roles and states
- Keyboard navigation support
- Focus management
- Screen reader friendly
