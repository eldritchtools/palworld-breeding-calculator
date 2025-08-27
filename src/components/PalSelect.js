import Select from "react-select";
import { PalIcon } from "./PalIcon";

import data from "../data/data.json";
import { checkPalSearchMatch } from "../palLogic/searchLogic";
import { selectStyle } from "../styles";

const options = Object.entries(data.pals).map(([id, pal]) => {
    return {
        value: id,
        label: <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
            <PalIcon pal={pal} size={32} />
            <span>{pal.name} ({id})</span>
        </div>,
        name: pal.name,
        index: pal.index,
        id: id
    }
}).sort((a, b) => a.index - b.index);

const valueToOption = options.reduce((acc, option) => {
    acc[option.value] = option;
    return acc
}, {});

function PalSelect({ value, onChange }) {
    const handleChange = (selected) => {
        if (selected) onChange(selected.value);
        else onChange(null);
    }

    return <Select 
        styles={selectStyle} 
        options={options} 
        isClearable={true} 
        placeholder={"Select Pal"}
        filterOption={(candidate, input) => checkPalSearchMatch(input, candidate.data)} 
        value={value ? valueToOption[value] : null} 
        onChange={handleChange} />
}

export default PalSelect;