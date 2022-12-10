import React, {useState, useEffect} from "react";
import{ getAllRestaurants} from "../firestore"
// import SearchIcon from "@material-ui/icons/Search";
// import CloseIcon from "@material-ui/icons/Close";

export default function HistorySearch() {
    const[getRest, setGetRest] = useState([]);

    console.log(getRest);
    useEffect(() => {
        async function getRes() {
            const resta = await getAllRestaurants();
            setGetRest(resta);
        }

        getRes();
    }, []);

    const [filteredData, setFilteredData] = useState([]);
    const [wordEntered, setWordEntered] = useState("");

    const handleFilter = (event) => {
        const searchWord = event.target.value;
        setWordEntered(searchWord);
        const newFilter = getRest.filter((value) => {
          return value.name.toLowerCase().includes(searchWord.toLowerCase());
        });
    
        if (searchWord === "") {
          setFilteredData([]);
        } else {
          setFilteredData(newFilter);
        }
      };

      const clearInput = () => {
        setFilteredData([]);
        setWordEntered("");
      };
    
    return (
        <div className="search">
          <div className="searchInputs">
            <input
              type="text"
              placeholder={"Enter a Restaurant"}
              value={wordEntered}
              onChange={handleFilter}
            />
            {/* <div className="searchIcon">
              {filteredData.length === 0 ? (
                <SearchIcon />
              ) : (
                <CloseIcon id="clearBtn" onClick={clearInput} />
              )}
            </div> */}
          </div>
          {filteredData.length != 0 && (
            <div className="dataResult">
              {filteredData.slice(0, 15).map((value, key) => {
                return (
                  <a className="dataItem" target="_blank">
                    <p>{value.name} </p>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      );
}