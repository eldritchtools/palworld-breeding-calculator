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
import { Header, Footer, ProfileProvider } from '@eldritchtools/shared-components';
import migrateProfile, { firstMigrate } from './migrateProfile';
import { useEffect, useState } from 'react';
import MigrationTab from './tabs/MigrationTab';

const tooltipNormalStyle = { ...tooltipStyle, fontWeight: "normal" };

const description = <span>
    Palworld Breeding Calculator is a free fan-made online tool that helps players with their breeding plans.
    <br /><br />
    Find out how to breed specific Pals, discover breeding paths based on the Pals and passives you already have, or view all the Pals you can breed from your current collection.
    <br /><br />
    The goal is to make it easier to plan breeding without guesswork, whether you just need a quick answer or want to map out longer routes.
</span>;

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
                <div style={{ minHeight: "100vh", height: "auto" }} >
                    <Header title={"Palworld Breeding Calculator"} lastUpdated={process.env.REACT_APP_LAST_UPDATED} />
                    <div className="App-content">
                        <Tabs className="tabs" selectedTabClassName="selected-tab" selectedTabPanelClassName="selected-tab-panel">
                            <TabList className="tab-list">
                                <Tab className="tab" data-tooltip-id={"tabTooltip"} data-tooltip-content={"Find what pals a certain parent/s can breed"}>
                                    Parent Calculator
                                </Tab>
                                <Tab className="tab" data-tooltip-id={"tabTooltip"} data-tooltip-content={"Find what parents can breed a certain pal"}>
                                    Child Calculator
                                </Tab>
                                <Tab className="tab" data-tooltip-id={"tabTooltip"} data-tooltip-content={"Find what paths you can take to breed a specific pal (and optionally with specific passives) based on the pals you own"}>
                                    Breed Path Calculator
                                </Tab>
                                <Tab className="tab" data-tooltip-id={"tabTooltip"} data-tooltip-content={"Find what pals you can breed based on the pals you own"}>
                                    Breedable Pals Calculator
                                </Tab>
                                <Tab className="tab" data-tooltip-id={"tabTooltip"} data-tooltip-content={"Short snippets and tips on how breeding works"}>
                                    Breeding Snippets
                                </Tab>
                                <Tab className="tab" data-tooltip-id={"tabTooltip"} data-tooltip-content={"Switch profiles to better manage your pals if you have multiple saves"}>
                                    Profiles
                                </Tab>
                                <Tab className="tab" data-tooltip-id={"tabTooltip"} data-tooltip-content={"Details on migration"}>
                                    Click here if your data's missing
                                </Tab>
                            </TabList>

                            <TabPanel className="tab-panel"><ParentCalcTab /></TabPanel>
                            <TabPanel className="tab-panel"><ChildCalcTab /></TabPanel>
                            <TabPanel className="tab-panel"><PathCalcTab /></TabPanel>
                            <TabPanel className="tab-panel"><BreedableCalcTab /></TabPanel>
                            <TabPanel className="tab-panel"><BreedingSnippetsTab /></TabPanel>
                            <TabPanel className="tab-panel"><ProfilesTab /></TabPanel>
                            <TabPanel className="tab-panel"><MigrationTab /></TabPanel>
                        </Tabs>
                    </div>
                </div>
                <Tooltip id={"tabTooltip"} style={tooltipNormalStyle} />
                <Footer
                    description={description}
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