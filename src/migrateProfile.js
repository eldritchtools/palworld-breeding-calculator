import { db } from "@eldritchtools/shared-components";

const DB_NAME = "palworld-breeding-calculator"

async function firstMigrate() {
    let profiles = await db.getItem(DB_NAME, "profiles");
    if (!profiles) {
        let lsProfiles = localStorage.getItem("profiles");
        // User has never used the tool before
        if (!lsProfiles) return;

        // User has used the tool before migration to IndexedDB
        lsProfiles = JSON.parse(lsProfiles);
        const currentProfile = JSON.parse(localStorage.getItem("currentProfile"));
        await db.setItem(DB_NAME, "profiles", lsProfiles);
        await db.setItem(DB_NAME, "currentProfile", currentProfile);

        for (let i=0; i<lsProfiles.length; i++) {
            const profileKey = `profile-${lsProfiles[i]}`;
            await db.setItem(DB_NAME, profileKey, JSON.parse(localStorage.getItem(profileKey)));
        }
    }
}

function migrateProfile(profile = {}) {
    let latestVersion = "latestVersion" in profile ? profile.latestVersion : 0;
    let migratedProfile = { ...profile };
    if (latestVersion < 1) {
        migratedProfile["pals"] = {};
        migratedProfile["latestVersion"] = 1;
    }
    return migratedProfile;
}

export { firstMigrate };
export default migrateProfile;