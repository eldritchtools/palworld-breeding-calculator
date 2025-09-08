import SnippetContainer from "./SnippetContainer";
import { PalIcon } from "@eldritchtools/palworld-shared-library";
import DataTable from 'react-data-table-component';
import { pals } from "@eldritchtools/palworld-shared-library";
import { OtherIcon, OtherIconObjects } from "../../components/OtherIcon";

const columns = [
    {
        name: "Pal",
        cell: row => <div style={{ display: "flex", flexDirection: "row", gap: "5px", alignItems: "center" }}>
            <PalIcon pal={row.pal} size={32} />
            <span>{row.pal.name}</span>
        </div>,
        sortable: true,
        sortFunction: (a, b) => a.pal.name.toLowerCase().localeCompare(b.pal.name.toLowerCase())
    },
    {
        name: <OtherIcon object={OtherIconObjects.male} size={30} />,
        selector: row => row.male + "%",
        sortable: true,
        center: true
    },
    {
        name: <OtherIcon object={OtherIconObjects.female} size={30} />,
        selector: row => (100 - row.male) + "%",
        sortable: true,
        center: true
    },
];

const data = Object.values(pals).filter(pal => pal.maleProbability !== 50).map(pal => { return { pal: pal, male: pal.maleProbability } })

const styles = {
    headRow: {
        style: {
            backgroundColor: '#1f1f1f',
            color: '#ddd',
            fontSize: "1rem"
        }
    },
    rows: {
        style: {
            backgroundColor: '#1f1f1f',
            color: '#ddd',
            fontSize: "1rem"
        },
        highlightOnHoverStyle: {
            backgroundColor: '#3f3f3f',
            color: '#ddd',
            fontSize: "1rem"
        },
    }
}

function Gender() {
    return <SnippetContainer title={"Gender"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "start", textAlign: "start", width: "100%" }}>
            Most pals have a 50/50 chance to be male or female, but some don't follow the same rule. If you're wondering why you keep getting one gender over the other, it may be one of the following pals:

            <DataTable
                columns={columns}
                data={data}
                customStyles={styles}
                fixedHeader
                fixedHeaderScrollHeight="300px"
                highlightOnHover
            />
        </div>
    </SnippetContainer>
}

export default Gender;