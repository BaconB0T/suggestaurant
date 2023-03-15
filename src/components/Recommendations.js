import { getRestaurantById, getImageURLsForBusiness } from "../firestore";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/fontawesome-free-solid'
import { useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";
import { isMobile } from 'react-device-detect';
import TinderCard from 'react-tinder-card'
import '../styles/Recommendations.css';

class Recommendations extends React.Component {
  constructor(props) {
    super(props);
    var restIds = props.recommendationIds.reverse();
    this.state = {
      restIds: restIds,
      index: props.indexNum || restIds.length-1,
      // rest: (<Recommendation nextRest={() => {this.setState({index: this.state.index+1, rest: (<Recommendation setGlobalState={this.state.setGlobalState} restId={this.state.restIds[this.state.index+1]}></Recommendation>)
      //       })}} setGlobalState={props.setState} restId={props.recommendationIds[props.indexNum]}></Recommendation>),
      setGlobalState: props.setState,
      childRefs: restIds.map((i) => React.createRef()),
      currentIndexRef: React.createRef(props.indexNum),
    }
  }

  updateIndex(val) {
    this.state.index = val;
    this.state.currentIndexRef.current = val;
  }

  canSwipe() {
    return this.state.index >= 0;
    // return this.state.index < this.state.restIds.length;
  }

  swiped(direction, nameToDelete, index) {
    this.updateIndex(index - 1);
  }

  outOfFrame(dir, name, idx) {
    console.log(`${name} at ${idx} has left the screen`);
    // delete? idk, this works for now.
    document.getElementById(name).setAttribute('style', 'display: none;');
    
    if(dir === 'right') {
      this.state.showingMap = true;
      // document.getElementsByClassName('recommendation--cards')[0].appendChild(<div className='navigating'>Navigating</div>);
      this.handleClick3(); 
    }    
    // state.currentIndexRef.current = state.index;
    
    // console.log(dir);
    // if(dir === 'right') this.handleClick3();

    // this.updateIndex(this.state.index+1);
    // currentIndexRef.current < idx && childRefs[idx].current.restoreCard();
  }

  async swipe(dir) {
    if(this.canSwipe()) {// && this.state.index < this.state.restIds.length) {
      await this.state.childRefs[this.state.index].current.swipe(dir) // Swipe the card!
    }
  }

  // handleClick() {
  //   console.log("entered handleClick()");
  //   let newIndex = this.state.index + 1;
    // this.outOfFrame();
    // this.setState(prevState => ({
    //   index: newIndex,
    //   rest: (<Recommendation setGlobalState={this.state.setGlobalState} restId={this.state.restIds[newIndex]}></Recommendation>)
    // }));
  // }

  handleClick3() {
    // index is decremented by this point. re-increment it to match.
    const idx = this.state.index+1;
    this.state.setGlobalState({ business_id: this.state.restIds[idx] });
    window.location.href = `/recommendations/map?business_id=${this.state.restIds[idx]}`;
  }

  render() {
    const buttons = 
      (<div className="recommendation--buttons">
        <button className='reject' onClick={() => this.swipe('left')}>Reject Recommendation</button>
        <button className='accept' onClick={() => this.swipe('right')}>Go to Map Page</button>
      </div>);

    return (
      <div className="recommendations">
        <div className="recommendation--cards">
          {!this.state.showingMap ? this.state.restIds.map((id, index) => (
            <Recommendation
              passRef={this.state.childRefs[index]}
              onSwipe={(dir) => this.swiped(dir, id, index)}
              onCardLeftScreen={(dir) => this.outOfFrame(dir, id, index)}
              restId={id}
              key={id}
              id={id}
            />
          )) : <div>Enjoy!</div>}
        </div>
        {!isMobile ? buttons : <></>}
      </div>
    );
  }
}


const Categories = (props) => {
  const myArr = props.categories;
  if (myArr == null) {
    return;
  }
  const myArrCreatedFromMap = myArr.map((item, i) => (<li key={item + i}>{item}</li>)); // `.map()` creates/returns a new array from calling a function on every element in the array it's called on
  const myList = (
    <ul>{myArrCreatedFromMap}</ul> // `myArrCreatedFromMap` will evaluate to a list of `<li>` elements
  );
  return myList;
}

const Stars = (props) => {
  const MAX_STARS = 5;
  const wholeStars = Math.floor(props.rating);
  let isHalfStar = (props.rating - wholeStars) > 0.2 && (props.rating - wholeStars) < 0.7;
  if (props.rating - wholeStars >= 0.7) {
    wholeStars += 1;
  }
  let jsx = [];
  for (let i = 0; i < wholeStars; i++) {
    jsx.push(<FontAwesomeIcon icon="star" color="orange" size="2x" />);
  }
  // TODO make prettier
  if (isHalfStar) {
    jsx.push(<FontAwesomeIcon icon="star-half" color="orange" size="2x" />);
  }
  for (let i = wholeStars + Number(isHalfStar); i < MAX_STARS; i++) {
    jsx.push(<FontAwesomeIcon icon="star" color="silver" size="2x" />);
  }
  return jsx;
}

const Recommendation = (props) => {
  const [textToCopy, setTextToCopy] = useState([]);
  const [restaurant, setRestaurant] = useState([]);
  const [imageURL, setImg] = useState("");
  const [cookies, setCookie] = useCookies(['user']);
  const navigate = useNavigate();
  const { setGlobalState, id, passRef, onSwipe, onCardLeftScreen } = props;

  useEffect(() => {
    async function setRes() {
      const rest = await getRestaurantById(String(props.restId));
      setRestaurant(rest);

      if (rest.location != null) {
        setTextToCopy(rest.location.streetAddress + ", " + rest.location.city + ", " + rest.location.state + " " + rest.location.postalCode);
      }

      document.getElementById(id).addEventListener('mousedown', (e) => {e.preventDefault(); document.getElementById(id).classList.add('moving')});
      document.getElementById(id).addEventListener('mouseup', (e) => {e.preventDefault(); document.getElementById(id).classList.remove('moving')});

      let images = await getImageURLsForBusiness(String(props.restId));
      setImg(images[0]);
    }
    setRes();
  }, [props.restId]);

  // const handleClick2 = (your_lat, your_lng) => {
  //     window.open("https://maps.google.com?q="+ your_lat+","+your_lng );
  // }
  // const handleClick3 = () => {
  //   setGlobalState({ business_id: restaurant.business_id });
  //   navigate(`/recommendations/map?business_id=${restaurant.business_id}`);
  //   // window.open("http://localhost:3000/recommendations/map" );
  // }

  return (
    <div id={id}
    className='swipe recommendation--card'>
      <TinderCard
        ref={passRef}
        onSwipe={onSwipe}
        onCardLeftScreen={onCardLeftScreen}
        preventSwipe={['up', 'down']}
      >
        <h1>{restaurant.name}</h1>
        <img src={imageURL}></img>
        <table>
          <tbody>
            <tr>
              <td>
                <p>{restaurant.location ? restaurant.location.streetAddress : "Please wait"} <br />
                  {restaurant.location ? restaurant.location.city + ", " + restaurant.location.state + " " + restaurant.location.postalCode : "Please wait"} </p>
              </td>
              <td>
                <div>
                  <button onClick={() => { navigator.clipboard.writeText(textToCopy) }}>
                    <FontAwesomeIcon icon={faCopy} outline="none" color="green" size="2x" />
                  </button>
                </div>
              </td>
              <td>
                <Stars rating={restaurant.stars} />
              </td>
            </tr>
          </tbody>
        </table>
        <Categories categories={restaurant.categories} />
        {/* <button onClick={() => handleClick3()}>
        Go to Map Page
      </button> */}
      </TinderCard>
    </div>
  );

}

export default Recommendations
