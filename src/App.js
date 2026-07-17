import './App.css';
import { HashRouter, Link, Routes, Route } from 'react-router-dom';
import ParentCalcTab from './tabs/ParentCalcTab';
import ChildCalcTab from './tabs/ChildCalcTab';
import PathCalcTab from './tabs/PathCalcTab';
import BreedableCalcTab from './tabs/BreedableCalcTab';
import BreedingSnippetsTab from './tabs/BreedingSnippetsTab';
import ProfilesTab from './tabs/ProfilesTab';
import { ProfileProvider, Layout } from '@eldritchtools/shared-components';
import migrateProfile, { firstMigrate } from './migrateProfile';
import { useEffect, useState } from 'react';

const description = <span>
    Palworld Breeding Calculator is a free fan-made online tool that helps players with their breeding plans.
    <br /><br />
    Find out how to breed specific Pals, discover breeding paths based on the Pals and passives you already have, or view all the Pals you can breed from your current collection.
    <br /><br />
    The goal is to make it easier to plan breeding without guesswork, whether you just need a quick answer or want to map out longer routes.
</span>;

function SidebarLink({ href, className, style, onClick, children }) {
    return <Link className={className} style={{ ...style, textAlign: "start" }} to={href} onClick={onClick}>{children}</Link>;
}

const paths = [
    { path: "/parent-calc", title: "Parent Calculator", tooltip: "Find what pals a certain parent/s can breed" },
    { path: "/child-calc", title: "Child Calculator", tooltip: "Find what parents can breed a certain pal" },
    { path: "/path-calc", title: "Breed Path Calculator", tooltip: "Find what paths you can take to breed a specific pal (and optionally with specific passives) based on the pals you own" },
    { path: "/breed-calc", title: "Breedable Pals Calculator", tooltip: "Find what pals you can breed based on the pals you own" },
    { path: "/snippets", title: "Breeding Snippets", tooltip: "Short snippets and tips on how breeding works" },
    { path: "/profiles", title: "Profiles", tooltip: "Switch profiles to better manage your pals if you have multiple saves" }
]

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
                <HashRouter>
                    <Layout
                        title={"Palworld Breeding Calculator"}
                        lastUpdated={process.env.REACT_APP_LAST_UPDATED}
                        linkSet={"palworld"}
                        description={description}
                        gameName={"Palworld"}
                        developerName={"Pocketpair"}
                        githubLink={"https://github.com/eldritchtools/palworld-breeding-calculator"}
                        paths={paths}
                        LinkComponent={SidebarLink}
                        includeDiscord={false}
                    >
                        <div className="App-content">
                            <div style={{ width: "100%" }}>
                                <Routes>
                                    <Route path="/" element={<ParentCalcTab />} />
                                    <Route path="/parent-calc" element={<ParentCalcTab />} />
                                    <Route path="/child-calc" element={<ChildCalcTab />} />
                                    <Route path="/path-calc" element={<PathCalcTab />} />
                                    <Route path="/breed-calc" element={<BreedableCalcTab />} />
                                    <Route path="/snippets" element={<BreedingSnippetsTab />} />
                                    <Route path="/profiles" element={<ProfilesTab />} />
                                </Routes>
                            </div>
                        </div>
                    </Layout>
                </HashRouter>
            </div>
        </ProfileProvider> :
        null
    );
}

export default App;