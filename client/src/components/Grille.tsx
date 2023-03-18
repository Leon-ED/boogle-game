import "../assets/grille.css";
import { useState } from "react";

type Grille = string[][];
function Grille(props: { largeur: number, hauteur: number }) {
    const { largeur, hauteur } = props;
    const [inputWord, setInputWord] = useState<string>("");


    var selectedCells: HTMLDivElement[] = [];
    var inSelection = false;
    var clearBox = false;

    function onCellMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        var cell = event.target as HTMLDivElement;

        if (cell.tagName == "SPAN") {
            cell = cell.parentElement as HTMLDivElement;
        }

        if (clearBox) {
            setInputWord("");
            clearBox = false;
        }


        if (cell.classList.contains('selected')) {
            selectedCells = selectedCells.filter(function (selectedCell) {
                return selectedCell !== cell;
            });
            return;
        } else {
            selectedCells.push(cell);
        }
        cell.classList.toggle('selected');
        inSelection = true;

        addWordToInput(cell);
    }

    function leaveGrid() {
        const liste = document.querySelectorAll('.case');
        liste.forEach(function (cell) {
            cell.classList.remove('selected');
        });
        selectedCells = [];
        inSelection = false;
    }

    function addWordToInput(cell: HTMLElement) {
        const word = cell.querySelector('span')?.innerHTML;
        if (word == null) return;
        setInputWord(inputWord + word);

    }

    function removeAllSelected() {
        const liste = document.querySelectorAll('.case');
        liste.forEach(function (cell) {
            cell.classList.remove('selected');
        });
        selectedCells = [];
        inSelection = false;
    }
    function onCellMouseUp(event: React.MouseEvent<HTMLDivElement>) {
        console.log("up");
        removeAllSelected();
        clearBox = true;

    }

    function dragEnter(event: React.MouseEvent<HTMLDivElement>) {
        if (!inSelection) return;
        onCellMouseDown(event);
        event.preventDefault();
    }

    function onLeaveGrid(event: React.MouseEvent<HTMLDivElement>) {
        console.log("leave");
        removeAllSelected();
    }


    const grille: Grille = [];
    for (let i = 0; i < hauteur; i++) {
        grille.push([]);
        for (let j = 0; j < largeur; j++) {
            grille[i].push("X");
        }
    }
    return (
        <div id="grille" className="grille" onMouseLeave={onLeaveGrid}>

            {grille.map((ligne, index) => (
                <div key={index} className="ligne">
                    {ligne.map((colonne, index) => (
                        console.log("colonne"),
                        <div
                            className="case"
                            key={index}
                            onMouseEnter={dragEnter}
                            onMouseDown={onCellMouseDown}
                            onMouseUp={onCellMouseUp}
                        >
                            <span>X</span>
                        </div>
                    ))}
                </div>
            ))}
            <input type="text" id="word" placeholder="Mot" onChange={
                (e) => {
                    setInputWord(e.target.value);
                }

            } value={inputWord} />

        </div>
    );
}

export default Grille;
