import './App.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ParentCalcTab from './tabs/ParentCalcTab';
import ChildCalcTab from './tabs/ChildCalcTab';
import PathCalcTab from './tabs/PathCalcTab';
import BreedableCalcTab from './tabs/BreedableCalcTab';
import BreedingSnippetsTab from './tabs/BreedingSnippetsTab';
import ProfilesTab from './tabs/ProfilesTab';
import { Tooltip } from 'react-tooltip';
import { tooltipStyle } from './styles';
import { Footer, ProfileProvider } from '@eldritchtools/shared-components';
import migrateProfile, { firstMigrate } from './migrateProfile';
import { useEffect, useState } from 'react';

const tooltipNormalStyle = { ...tooltipStyle, fontWeight: "normal" };

function App() {
    const [migrated, setMigrated] = useState(false);

    useEffect(() => {
        if (!migrated) {
            firstMigrate().then(() => {
                setMigrated(true);
            }).catch(err => {
                console.error(err.message);
            });
        }
    }, [migrated]);

    return (migrated ?
        <ProfileProvider dbName={"palworld-breeding-calculator"} migrateProfile={migrateProfile}>
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
                            <Tab className="tab" data-tooltip-id={"breedableCalcTab"}>
                                Breedable Pals Calculator
                                <Tooltip id={"breedableCalcTab"} style={tooltipNormalStyle}>
                                    Find what pals you can breed based on the pals you own
                                </Tooltip>
                            </Tab>
                            <Tab className="tab" data-tooltip-id={"breedingSnippetsTab"}>
                                Breeding Snippets
                                <Tooltip id={"breedingSnippetsTab"} style={tooltipNormalStyle}>
                                    Short snippets and tips on how breeding works
                                </Tooltip>
                            </Tab>
                            <Tab className="tab" data-tooltip-id={"profilesTab"}>
                                Profiles
                                <Tooltip id={"profilesTab"} style={tooltipNormalStyle}>
                                    Switch profiles to better manage your pals if you have multiple saves
                                </Tooltip>
                            </Tab>
                        </TabList>

                        <TabPanel className="tab-panel"><ParentCalcTab /></TabPanel>
                        <TabPanel className="tab-panel"><ChildCalcTab /></TabPanel>
                        <TabPanel className="tab-panel"><PathCalcTab /></TabPanel>
                        <TabPanel className="tab-panel"><BreedableCalcTab /></TabPanel>
                        <TabPanel className="tab-panel"><BreedingSnippetsTab /></TabPanel>
                        <TabPanel className="tab-panel"><ProfilesTab /></TabPanel>
                    </Tabs>
                </header>
                <Footer
                    description={"This site is a fan-made web tool built to help with breeding planning for Palworld players."}
                    gameName={"Palworld"}
                    developerName={"Pocketpair"}
                    githubLink={"https://github.com/eldritchtools/palworld-breeding-calculator"}
                />
            </div>
        </ProfileProvider> :
        null
    );
}

export default App;