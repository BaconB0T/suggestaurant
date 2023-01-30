import {  getRestaurantById} from "../firestore";
import React, { useEffect, useState} from "react";

class Recommendations extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            restIds : props.recommendationIds
        }
    }

    render() {
        return (
            <div>
                <h1>
                    <Recommendation restId={this.state.restIds[0]}></Recommendation>
                </h1>


            </div>
            
        )
        
    }


}

const Recommendation = (props) => {
    const [restaurant, setRestaurant] = useState([]);
    console.log(props)
    useEffect(() => {
        async function setRes() {
          const rest = await getRestaurantById(String(props.restId));
          setRestaurant(rest);
          console.log(rest)
        }
        setRes();
      }, []);
    

    return (
        <div>
            {console.log(restaurant)}
            <h1>Name: {restaurant.name} Stars: {restaurant.location['state']}</h1>


        </div>
            
    )
  
}

export default Recommendations