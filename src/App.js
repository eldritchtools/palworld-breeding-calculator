import './App.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ParentCalcTab from './tabs/ParentCalcTab';
import ChildCalcTab from './tabs/ChildCalcTab';
import PathCalcTab from './tabs/PathCalcTab';
import SpreadCalcTab from './tabs/SpreadCalcTab';
import ProfilesTab from './tabs/ProfilesTab';
// import AboutTab from './tabs/AboutTab';
import { ProfileProvider } from './profileProvider';
import { Tooltip } from 'react-tooltip';
import { tooltipStyle } from './styles';
import Footer from './Footer';

function App() {
    const tooltipNormalStyle = {...tooltipStyle, fontWeight: "normal"};

    return (
        <ProfileProvider>
            <div className="App">
                <header className="App-header">
                    <h2>Palworld Breeding Calculator</h2>
                    <Tabs className="tabs" selectedTabClassName="selected-tab" selectedTabPanelClassName="selected-tab-panel">
                        <TabList className="tab-list">
                            <Tab className="tab" data-tooltip-id={"parentCalcTab"}>
                                Parent Calculator
                                <Tooltip id={"parentCalcTab"} style={tooltipNormalStyle}>
                                    Find what pals a certain parent/s can breed
                                </Tooltip>
                            </Tab>
                            <Tab className="tab" data-tooltip-id={"childCalcTab"}>
                                Child Calculator
                                <Tooltip id={"childCalcTab"} style={tooltipNormalStyle}>
                                    Find what parents can breed a certain pal
                                </Tooltip>
                            </Tab>
                            <Tab className="tab" data-tooltip-id={"pathCalcTab"}>
                                Breed Path Calculator
                                <Tooltip id={"pathCalcTab"} style={tooltipNormalStyle}>
                                    Find what paths you can take to breed a specific pal (and optionally with specific passives) based on the pals you own
                                </Tooltip>
                            </Tab>
                            <Tab className="tab" data-tooltip-id={"spreadCalcTab"}>
                                Breed Spread Calculator
                                <Tooltip id={"spreadCalcTab"} style={tooltipNormalStyle}>
                                    Find what pals you can breed based on the pals you own
                                </Tooltip>
                            </Tab>
                            <Tab className="tab" data-tooltip-id={"profilesTab"}>
                                Profiles
                                <Tooltip id={"profilesTab"} style={tooltipNormalStyle}>
                                    Switch profiles to better manage your pals if you have multiple saves
                                </Tooltip>
                            </Tab>
                            {/* <Tab className="tab">About this Tool</Tab> */}
                        </TabList>

                        <TabPanel className="tab-panel"><ParentCalcTab /></TabPanel>
                        <TabPanel className="tab-panel"><ChildCalcTab /></TabPanel>
                        <TabPanel className="tab-panel"><PathCalcTab /></TabPanel>
                        <TabPanel className="tab-panel"><SpreadCalcTab /></TabPanel>
                        <TabPanel className="tab-panel"><ProfilesTab /></TabPanel>
                        {/* <TabPanel className="tab-panel"><AboutTab /></TabPanel> */}
                    </Tabs>
                </header>
                <Footer />
            </div>
        </ProfileProvider>
    );
}

export default App;