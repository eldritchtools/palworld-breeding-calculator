import { createContext, useContext, useState, useEffect } from "react";
import useDebouncedEffect from "use-debounced-effect";

const ProfileContext = createContext();

function migrateProfile(profile = {}) {
    let latestVersion = "latestVersion" in profile ? profile.latestVersion : 0;
    let migratedProfile = {...profile};
    if (latestVersion < 1) {
        migratedProfile["pals"] = {};
        migratedProfile["latestVersion"] = 1;
    }
    return migratedProfile;
}

export function ProfileProvider({ children }) {
    const [profiles, setProfiles] = useState(() => {
        const profiles = localStorage.getItem("profiles");
        if (profiles) return JSON.parse(profiles);
        else return ["default"];
    });
    useEffect(() => localStorage.setItem("profiles", JSON.stringify(profiles)), [profiles]);

    const [currentProfile, setCurrentProfile] = useState(() => {
        const current = localStorage.getItem("currentProfile");
        if (current) return JSON.parse(current);
        else return "default";
    });
    useEffect(() => localStorage.setItem("currentProfile", JSON.stringify(currentProfile)), [currentProfile]);

    const [profileData, setProfileData] = useState(() => {
        let data = localStorage.getItem(`profile-${currentProfile}`);
        if (data) return JSON.parse(data);
        else {
            const defaultProfile = migrateProfile();
            localStorage.setItem(`profile-${currentProfile}`, JSON.stringify(defaultProfile));
            return defaultProfile;
        }
    })
    useDebouncedEffect(() => localStorage.setItem(`profile-${currentProfile}`, JSON.stringify(profileData)), 5000, [profileData, currentProfile]);

    const addProfile = (name) => {
        if (!name) return;
        if (profiles.includes(name)) return;
        setProfiles(profiles => ([...profiles, name]));
        localStorage.setItem(`profile-${name}`, JSON.stringify(migrateProfile()));
    };

    const switchProfile = (name) => {
        if (!name) return;
        if (!profiles.includes(name)) return;
        localStorage.setItem(`profile-${currentProfile}`, JSON.stringify(profileData));
        const loadedProfile = JSON.parse(localStorage.getItem(`profile-${name}`));
        setProfileData(migrateProfile(loadedProfile));
        setCurrentProfile(name);
    }

    const copyProfile = (oldName, newName) => {
        if (!oldName || !newName) return;
        if (profiles.includes(newName) || !profiles.includes(oldName)) return;
        setProfiles(profiles => ([...profiles, newName]));
        localStorage.setItem(`profile-${newName}`, localStorage.getItem(`profile-${oldName}`));
    }

    const deleteProfile = (name) => {
        if (!name) return;
        if (name === "default") {
            // Return default profile to its default state instead of deleteing
            const defaultProfile = migrateProfile();
            localStorage.setItem(`profile-default`, JSON.stringify(defaultProfile));
            if (currentProfile === "default") {
                setProfileData(defaultProfile);
            }
            return;
        }
        localStorage.removeItem(`profile-${name}`);
        setProfiles(profiles => profiles.filter(p => p !== name));
        if (name === currentProfile) {
            switchProfile("default");
        }
    }

    const value = {
        profiles, currentProfile, profileData, setProfileData, addProfile, switchProfile, copyProfile, deleteProfile,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}

export const useProfiles = () => useContext(ProfileContext);