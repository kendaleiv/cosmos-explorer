import React from "react";
import { useObservableState } from "../../hooks/useObservableState";
import TabsBase from "./TabsBase";

type Props = {
  tabs: readonly TabsBase[];
  activeTab: TabsBase;
  closeTab: (tab: TabsBase) => void;
};

export function Tabs({ tabs, activeTab }: Props): JSX.Element {
  return (
    <div className="tabsManagerContainer">
      <div id="content" className="flexContainer hideOverflows">
        <div className="nav-tabs-margin">
          <ul className="nav nav-tabs level navTabHeight" id="navTabs" role="tablist">
            {tabs.map((tab) => (
              <TabLI key={tab.tabId} tab={tab} isActive={tab === activeTab} />
            ))}
          </ul>
        </div>

        <div className="tabPanesContainer">
          <div className="tabs-container">
            <pre>
              {JSON.stringify(
                {
                  kind: activeTab.tabKind,
                  path: activeTab.tabPath(),
                },
                undefined,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorIcon(props: { tab: TabsBase; isActive: boolean }) {
  const { tab, isActive } = props;
  const className = ["errorIconContainer", isActive && "actionsEnabled"].filter(Boolean).join(" ");
  const tabIndex = isActive ? 0 : undefined;

  return (
    <div
      id="errorStatusIcon"
      role="button"
      title="Click to view more details"
      className={className}
      tabIndex={tabIndex}
      onClick={({ nativeEvent: e }) => tab.onErrorDetailsClick(undefined, e)}
      onKeyPress={({ nativeEvent: e }) => tab.onErrorDetailsKeyPress(undefined, e)}
    >
      <span className="errorIcon"></span>
    </div>
  );
}

function TabLI(props: { tab: TabsBase; isActive: boolean }) {
  const { tab, isActive } = props;

  const [tabPath] = useObservableState(tab.tabPath);
  const [tabTitle] = useObservableState(tab.tabTitle);
  const [isExecuting] = useObservableState(tab.isExecuting);
  const [isExecutionError] = useObservableState(tab.isExecutionError);
  const className = ["tabList", isActive && "active"].filter(Boolean).join(" ");

  return (
    <li
      onClick={() => tab.onTabClick()}
      onKeyPress={({ nativeEvent: e }) => tab.onKeyPressActivate(undefined, e)}
      className={className}
      key={tab.tabId}
      title={tabPath}
      aria-selected={isActive}
      aria-expanded={isActive}
      aria-controls={tab.tabId}
      tabIndex={0}
      role="tab"
    >
      <span className="tabNavContentContainer">
        <a data-toggle="tab" href={"#" + tab.tabId} tabIndex={-1}>
          <div className="tab_Content">
            <span className="statusIconContainer">
              {isExecutionError && <ErrorIcon tab={tab} isActive={isActive} />}
              {isExecuting && (
                <img
                  className="loadingIcon"
                  title="Loading"
                  src="../../../images/circular_loader_black_16x16.gif"
                  alt="Loading"
                />
              )}
            </span>
            <span className="tabNavText">{tabTitle}</span>
            <span className="tabIconSection">
              {isActive && (
                <span
                  title="Close"
                  role="button"
                  aria-label="Close Tab"
                  className="cancelButton"
                  onClick={() => tab.onCloseTabButtonClick()}
                  tabIndex={isActive ? 0 : undefined}
                  onKeyPress={({ nativeEvent: e }) => tab.onKeyPressClose(undefined, e)}
                >
                  <span className="tabIcon close-Icon">
                    <img src="../../../images/close-black.svg" title="Close" alt="Close" />
                  </span>
                </span>
              )}
            </span>
          </div>
        </a>
      </span>
    </li>
  );
}
