const ASSETS_ROOT = `${process.env.PUBLIC_URL}/assets`;

const OtherIconObjects = {
    cookingStove: "Cooking Stove",
    electricKitchen: "Electric Kitchen",
    berryPlantation: "Berry Plantation",
    wheatPlantation: "Wheat Plantation",
    mill: "Mill",
    largeScaleStoneOven: "Large-scale Stone Oven",
    ranch: "Ranch",
    breedingFarm: "Breeding Farm",
    berries: "Berries",
    cake: "Cake",
    egg: "Egg",
    milk: "Milk",
    wheat: "Wheat",
    honey: "Honey",
    flour: "Flour",
    merchant: "Merchant",
    female: "Female",
    male: "Male",
    commonEgg: "Common Egg",
    palSurgeryTable: "Pal Surgery Table",
    dimensionalPalStorage: "Dimensional Pal Storage"
}

const OtherIconPaths = {
    "Cooking Stove": "T_icon_buildObject_CookingStove",
    "Electric Kitchen": "T_icon_buildObject_ElectricKitchen",
    "Berry Plantation": "T_icon_buildObject_FarmBlockV2_Berries",
    "Wheat Plantation": "T_icon_buildObject_FarmBlockV2_wheet",
    "Mill": "T_icon_buildObject_FlourMill",
    "Large-scale Stone Oven": "T_icon_buildObject_HugeKitchen",
    "Ranch": "T_icon_buildObject_MonsterFarm",
    "Breeding Farm": "T_icon_buildObject_BreedFarm",
    "Berries": "T_itemicon_Food_Berries",
    "Cake": "T_itemicon_Food_Cake",
    "Egg": "T_itemicon_Food_Egg",
    "Milk": "T_itemicon_Food_Milk",
    "Wheat": "T_itemicon_Food_Wheat",
    "Honey": "T_itemicon_Food_Honey",
    "Flour": "T_itemicon_Material_Flour",
    "Merchant": "Red_Wandering_Merchant",
    "Female": "T_Icon_PanGender_Female",
    "Male": "T_Icon_PanGender_Male",
    "Common Egg": "Common_Egg_icon",
    "Pal Surgery Table": "T_icon_buildObject_OperatingTable",
    "Dimensional Pal Storage": "T_icon_buildObject_DimensionPalStorage"
}

function OtherIcon({ object, size = null, count = null }) {
    const actualSize = size ? `${size}px` : "60px";
    const sizeStyle = { width: actualSize, height: actualSize };

    if (!object) {
        return <div style={sizeStyle} />
    }

    return <div style={{ ...sizeStyle, display: "flex" }}>
        <div style={{ ...sizeStyle, position: "relative" }}>
            <img src={`${ASSETS_ROOT}/others/${OtherIconPaths[object]}.png`} alt={object} title={object} style={sizeStyle} />
            {count ? <span style={{ fontSize: "1em", color: "#aaa", position: "absolute", bottom: "0%", right: "0%", fontWeight: "bold" }}>x{count}</span> : null}
        </div>
    </div>
}

export { OtherIconObjects, OtherIcon };
