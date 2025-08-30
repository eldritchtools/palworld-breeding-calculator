import Select from "react-select";
import { PalIcon } from "./PalIcon";

import data from "../data/data.json";
import { checkPalSearchMatch } from "../palLogic/searchLogic";
import { selectStyle } from "../styles";
import { useMemo } from "react";

const palToOption = (pal) => {
    return {
        value: pal.id,
        label: <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
            <PalIcon pal={pal} size={32} />
            <span>{pal.name}{pal.no !== "-1" ? ` (${pal.no})` : null}</span>
        </div>,
        name: pal.name,
        index: pal.sortIndex,
        id: pal.id,
        no: pal.no
    }
}

const options = Object.entries(data.pals).map(([_id, pal]) => palToOption(pal)).sort((a, b) => a.index - b.index);

const valueToOption = options.reduce((acc, option) => {
    acc[option.value] = option;
    return acc
}, {});

function PalSelect({ value, onChange, optionsOverride=null }) {
    const handleChange = (selected) => {
        if (selected) onChange(selected.value);
        else onChange(null);
    }

    const finalOptions = useMemo(() => {
        return optionsOverride ? optionsOverride.map(palToOption).sort((a, b) => a.index - b.index) : options;
    }, [optionsOverride]);

    return <Select 
        styles={selectStyle} 
        options={finalOptions} 
        isClearable={true} 
        placeholder={"Select Pal"}
        filterOption={(candidate, input) => checkPalSearchMatch(input, candidate.data)} 
        value={value ? valueToOption[value] : null} 
        onChange={handleChange} />
}

export default PalSelect;