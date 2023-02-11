import {getRestaurantById} from "../firestore";
import React, { useEffect, useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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
            
                <Recommendation restId={this.state.restIds[0]}></Recommendation>
               


            </div>
            
        )
        
    }


}

const Stars = (props) => {
    const MAX_STARS = 5;
    const wholeStars = Math.floor(props.rating);
    let isHalfStar = (props.rating - wholeStars) > 0.2 && (props.rating - wholeStars) < 0.7;
    if  (props.rating - wholeStars >= 0.7 ) {
        wholeStars += 1;
    }
    let jsx = [];
    for (let i = 0; i < wholeStars; i++) {
        jsx.push (<FontAwesomeIcon icon="star" color="orange" size="2x" /> );
    }
    // TODO make prettier
    if (isHalfStar){
        jsx.push (<FontAwesomeIcon icon="star-half" color="orange" size="2x" /> );
    }
    for (let i = wholeStars + Number(isHalfStar); i < MAX_STARS; i++) {
        jsx.push (<FontAwesomeIcon icon="star" color="silver" size="2x" /> );
    }


    return jsx;
}

const Recommendation = (props) => {
    const [restaurant, setRestaurant] = useState([]);
    const [location, setLocation] = useState([]);
    //const [falseDietaryRestrictions, setFalseDietRestrict] = useState([]);
    console.log(props)
    useEffect(() => {
        async function setRes() {
          const rest = await getRestaurantById(String(props.restId));
          setRestaurant(rest);
          setLocation(rest.location)
          //const array = []
        //   for (const docRef of rest.dietaryRestrictions.false) {
        //     array.push(docRef.id)
        //   }
          //setFalseDietRestrict(array)
          console.log(rest)
        }
        setRes();
      }, []);

      return (
        <div>
            <h1>{restaurant.name} {restaurant.stars} </h1>
            <h3>{restaurant.location ? restaurant.location.streetAddress : "Please wait"}</h3>
            <h3> {restaurant.location? restaurant.location.city + ", " + restaurant.location.state + " " + restaurant.location.postalCode: "Please wait"} </h3>
            {/* <h1>Not Allergies: {falseDietaryRestrictions[0]}</h1> */}
            <Stars rating={restaurant.stars}/>
            {/* <FontAwesomeIcon icon={faCoffee}/>
            <FontAwesomeIcon icon={faCoffee}/>
            <FontAwesomeIcon icon={faCoffee}/>
            <FontAwesomeIcon icon={faCoffee}/> */}
            

        </div>
            
    )
  
}

// const starRating = useMemo(() => {
//     return Array(count)
//     .fill(0)
//     .map((_,i)=> i+1)
//     .map((idx) => (
//         <FontAwesomeIcon
//             key = {idx}
//             className = "cursor-pointer"
//             icon="star"
//         />
//     ));
// }, [count, rating]);

export default Recommendations