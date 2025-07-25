# TabbedWorkspace Component

A browser-like tabbed workspace component that allows users to add and close tabs dynamically. The component is built with a context-based architecture that separates the tab menu from the content area, enabling independent scrolling. It uses a theme-aware design system that follows shadcn/ui patterns.

## Features

- ✅ Add new tabs with a + button
- ✅ Close tabs with an X button (appears on hover)
- ✅ Switch between tabs by clicking
- ✅ Responsive design with horizontal scrolling
- ✅ Support for non-closable tabs
- ✅ Automatic tab switching when active tab is closed
- ✅ Fully customizable styling
- ✅ TypeScript support
- ✅ **Theme-aware design** - uses CSS variables for consistent styling
- ✅ **Independent scrolling** - content area scrolls separately from tab menu
- ✅ **Context-based architecture** - flexible component composition
- ✅ **Separated components** - TabMenu and TabContent can be used independently

## Architecture

The component uses a context-based architecture with three main parts:

1. **TabbedWorkspace** - The main container that provides context
2. **TabMenu** - The tab navigation bar (fixed, doesn't scroll)
3. **TabContent** - The content area (scrollable independently)

## Theme System

The component uses CSS variables for theming, following shadcn/ui patterns:

- `--background` - Main background color
- `--foreground` - Main text color
- `--card` - Card background color
- `--card-foreground` - Card text color
- `--muted` - Muted background color
- `--muted-foreground` - Muted text color
- `--border` - Border color
- `--accent` - Accent color (yellow in this theme)
- `--destructive` - Destructive action color

## Usage

### Basic Usage

```tsx
import { TabbedWorkspace, TabMenu, TabContent, Tab } from "./ui/tabs";

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
      className="h-full"
    >
      <TabMenu />
      <TabContent />
    </TabbedWorkspace>
  );
};
```

### Advanced Usage with Custom Layout

```tsx
import {
  TabbedWorkspace,
  TabMenu,
  TabContent,
  useTabbedWorkspace,
} from "./ui/tabs";

const CustomLayout = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Custom header */}
      <div className="bg-card p-4 border-b border-border">
        <h1 className="text-card-foreground">My Application</h1>
      </div>

      {/* Tab menu */}
      <TabMenu />

      {/* Custom sidebar + content */}
      <div className="flex flex-1">
        <div className="w-64 bg-muted p-4">
          <p className="text-muted-foreground">Sidebar content</p>
        </div>
        <div className="flex-1">
          <TabContent />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  // ... state management ...

  return (
    <TabbedWorkspace
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={handleTabChange}
      onTabAdd={handleTabAdd}
      onTabClose={handleTabClose}
    >
      <CustomLayout />
    </TabbedWorkspace>
  );
};
```

### Using the Context Hook

```tsx
import { useTabbedWorkspace } from "./ui/tabs";

const CustomComponent = () => {
  const { tabs, activeTabId, onTabChange, onTabAdd, onTabClose } =
    useTabbedWorkspace();

  return (
    <div>
      <p>Active tab: {activeTabId}</p>
      <p>Total tabs: {tabs.length}</p>
      <button onClick={() => onTabAdd()}>Add Tab</button>
    </div>
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
  children?: React.ReactNode; // Child components (TabMenu, TabContent, etc.)
}
```

### TabMenu Props

```tsx
interface TabMenuProps {
  className?: string; // Additional CSS classes for the menu container
  tabClassName?: string; // Additional CSS classes for individual tabs
}
```

### TabContent Props

```tsx
interface TabContentProps {
  className?: string; // Additional CSS classes for the content area
}
```

### useTabbedWorkspace Hook

```tsx
const {
  tabs, // Array of all tabs
  activeTabId, // ID of the currently active tab
  onTabChange, // Function to change the active tab
  onTabAdd, // Function to add a new tab
  onTabClose, // Function to close a tab
} = useTabbedWorkspace();
```

## Styling

The component uses theme variables for consistent styling:

- **Container**: `bg-card border-border` with rounded corners
- **Active tab**: `bg-card text-card-foreground` with border styling
- **Inactive tabs**: `bg-muted/50 text-muted-foreground` with hover effects
- **Close button**: Appears on hover with `hover:bg-destructive` destructive state
- **Add button**: Ghost variant with `hover:bg-accent` accent state
- **Content area**: `bg-card` background with independent scrolling

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
  className="h-full border-2 border-accent"
>
  <TabMenu tabClassName="px-6 py-3" />
  <TabContent className="p-4" />
</TabbedWorkspace>
```

### Custom Layout with Sidebar

```tsx
<TabbedWorkspace
  tabs={tabs}
  activeTabId={activeTabId}
  onTabChange={handleTabChange}
  onTabAdd={handleTabAdd}
  onTabClose={handleTabClose}
>
  <div className="flex flex-col h-full">
    <TabMenu />
    <div className="flex flex-1">
      <div className="w-64 bg-muted p-4">
        <p className="text-muted-foreground">Sidebar</p>
      </div>
      <div className="flex-1">
        <TabContent />
      </div>
    </div>
  </div>
</TabbedWorkspace>
```

## Accessibility

- Tab buttons have proper ARIA roles and states
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Independent scrolling maintains accessibility
