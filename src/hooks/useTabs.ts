import TabsBase from "../Explorer/Tabs/TabsBase";
import { TabsManager } from "../Explorer/Tabs/TabsManager";
import { useObservableState } from "./useObservableState";

export type UseTabs = {
  tabs: readonly TabsBase[];
  activeTab: TabsBase;
  focusTab: (tab: TabsBase) => TabsBase;
  closeTab: (tab: TabsBase) => void;
  tabsManager: TabsManager;
};

const manager = new TabsManager();

export const useTabs = (): UseTabs => {
  const [tabs] = useObservableState(manager.openedTabs);
  const [activeTab] = useObservableState(manager.activeTab);

  const closeTab = (tabToClose: TabsBase) => manager.closeTab(tabToClose.tabId, tabToClose.getContainer());
  const focusTab = (tabToFocus: TabsBase) => {
    if (tabs.some((tab) => tab === tabToFocus)) {
      manager.activateTab(tabToFocus);
    } else {
      manager.activateNewTab(tabToFocus);
    }

    return tabToFocus;
  };

  return { tabs, activeTab, focusTab, closeTab, tabsManager: manager };
};
