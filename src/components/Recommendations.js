import { getRestaurantById, getImageURLsForBusiness, updateGroupMember, getGroup } from "../firestore";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/fontawesome-free-solid'
import { withCookies, useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";
import { isMobile } from 'react-device-detect';
import TinderCard from 'react-tinder-card'
import '../styles/Recommendations.css';

class Recommendations extends React.Component {
  constructor(props) {
    super(props);
    var restIds = props.recommendationIds.reverse();
    if (props.allCookies['groupCode'] != 0) {
      // in a group, insert groupDecision cards between each restaurant.
      const newRestIds = [];
      for (let i = 0; i < restIds.length; ++i) {
        i % 2 == 0 ? newRestIds.push(restIds[i]) : newRestIds.push(`groupDecision-${i-1}`);
      }
      restIds = newRestIds;
    }
    this.MINUTE_MS = 1000;
    this.state = {
      restIds: restIds,
      index: props.indexNum || restIds.length - 1,
      setGlobalState: props.setState,
      childRefs: restIds.map((i) => React.createRef()),
      currentIndexRef: React.createRef(props.indexNum),
      host: props.allCookies['host'],
      groupCode: props.allCookies['groupCode'],
      check: false,
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

  swiped(direction, nameToDelete, index, state) {
    if (state.groupCode != 0) {
      // in group, do something new!
      if(!nameToDelete.includes('groupDecision')) {
        // This needs to happen when the host makes a decision... interval
        // needs to update this.
        this.updateIndex(index - 1);
      }
    } else {

      this.updateIndex(index - 1);
    }
  }

  outOfFrame(dir, name, idx) {
    console.log(`${name} at ${idx} has left the screen`);
    // delete? idk, this works for now.
    document.getElementById(name).setAttribute('style', 'display: none;');

    if (dir === 'right') {
      console.log(this.state.groupCode);
      // accepting suggestion.
      if (this.state.groupCode == 0) {
        // Not in a group.
        this.handleClick3();
      } else {
        this.handleGroupAction(true).then(() => {
          this.handleClick4(this.state);
        });
      }
      this.state.showingMap = true;
    } else if (this.state.groupCode != 0) {
      this.handleGroupAction(false);
    }
  }

  async swipe(dir) {
    if (this.canSwipe()) {// && this.state.index < this.state.restIds.length) {
      await this.state.childRefs[this.state.index].current.swipe(dir) // Swipe the card!
    }
  }

  async handleGroupAction(accepted) {
    // When a member of a group accepts the suggestion
    const idx = this.state.index + 1;
    console.log(idx);
    console.log(this.state.restIds);
    const acceptedRestaurantId = this.state.restIds[idx];
    console.log([acceptedRestaurantId, accepted]);
    return await updateGroupMember(this.state.groupCode, 'suggestions', [acceptedRestaurantId, accepted]);
  }
  
  handleClick4(obj) {
    const idx = obj.index+1;
    obj.setGlobalState({ business_id: obj.restIds[idx] });
    window.location.href = `/recommendations/map?business_id=${obj.restIds[idx]}`;
  }

  // to change less code.
  handleClick3() {
    this.handleClick4(this.state);
  }

  // interval stuff
  async updateGroup() {
    const group = await getGroup(this.state.groupCode);
    console.log(group);
    this.state.group = group;
    // this.setState(prevState => {
    //   return {
    //     ...prevState,
    //     group: group
    //   }
    // });
  }

  componentDidMount() {
    if(this.state.groupCode != 0) {
      const newIntervalId = setInterval(() => {
        this.updateGroup();
      }, this.MINUTE_MS);
      this.setState(prevState => {
        return {
          ...prevState,
          intervalId: newIntervalId
        }
      });
    }
  }

  componentWillUnmount() {
    console.log("Component unmounting!");
    if(this.state.groupCode != 0) {
      clearInterval(this.state.intervalId);
    }
  }

  render() {
    const buttons =
      (<div className="recommendation--buttons">
        <button className='reject' onClick={() => this.swipe('left')}>Reject Recommendation</button>
        <button className='accept' onClick={() => this.swipe('right')}>Go to Map Page</button>
      </div>);

    return (
      <div className="recommendations">
        <div id='enjoy' style={{ display: this.state.showingMap ? 'auto' : 'none' }}>Enjoy!</div>
        <div className="recommendation--cards" style={{ display: this.state.showingMap ? 'none' : 'auto' }}>
          {this.state.restIds.map((id, index) => (!id.includes('groupDecision')) ? (
            <Recommendation
              passRef={this.state.childRefs[index]}
              onSwipe={(dir) => this.swiped(dir, id, index, this.state)}
              onCardLeftScreen={(dir) => this.outOfFrame(dir, id, index)}
              restId={id}
              key={id}
              id={id}
            />
          ) : (
            <GroupDecision
              passRef={this.state.childRefs[index]}
              onSwipe={(dir) => this.swiped(dir, id, index, this.state)}
              onCardLeftScreen={(dir) => this.outOfFrame(dir, id, index)}
              restId={this.state.restIds[index+1]}
              key={id}
              id={id}
              groupCode={this.state.groupCode}
              isHost={this.state.host}
            />
          ))}
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
    jsx.push(<FontAwesomeIcon key={`star-${i}`} icon="star" color="orange" size="2x" />);
  }
  // TODO make prettier
  if (isHalfStar) {
    jsx.push(<FontAwesomeIcon key="halfStar" icon="star-half" color="orange" size="2x" />);
  }
  for (let i = wholeStars + Number(isHalfStar); i < MAX_STARS; i++) {
    jsx.push(<FontAwesomeIcon key={`star-${i}`} icon="star" color="silver" size="2x" />);
  }
  return jsx;
}

const Recommendation = (props) => {
  const [textToCopy, setTextToCopy] = useState([]);
  const [restaurant, setRestaurant] = useState([]);
  const [imageURL, setImg] = useState("");
  const [cookies, setCookie] = useCookies(['user']);
  const navigate = useNavigate();
  const { setGlobalState, id, restId, passRef, onSwipe, onCardLeftScreen } = props;

  useEffect(() => {
    async function setRes() {
      const rest = await getRestaurantById(String(restId));
      setRestaurant(rest);

      if (rest.location != null) {
        setTextToCopy(rest.location.streetAddress + ", " + rest.location.city + ", " + rest.location.state + " " + rest.location.postalCode);
      }

      document.addEventListener('DOMContentLoaded', () => {
        document.getElementById(id).addEventListener('mousedown', (e) => { e.preventDefault(); document.getElementById(id).classList.add('moving') });
        document.getElementById(id).addEventListener('mouseup', (e) => { e.preventDefault(); document.getElementById(id).classList.remove('moving') });
      });

      let images = await getImageURLsForBusiness(String(restId));
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

const GroupDecision = (props) => {
  const { setGlobalState, id, restId, groupCode, passRef, onSwipe, onCardLeftScreen, isHost } = props;
  const [restaurant, setRestaurant] = useState([]);
  const [group, setGroup] = useState({});
  
  // Update restaurant;
  useEffect(() => {
    async function setRes() {
      const rest = await getRestaurantById(restId);
      setRestaurant(rest);

      window.addEventListener('DOMContentLoaded', () => {
        document.getElementById(id).addEventListener('mousedown', (e) => { e.preventDefault(); document.getElementById(id).classList.add('moving') });
        document.getElementById(id).addEventListener('mouseup', (e) => { e.preventDefault(); document.getElementById(id).classList.remove('moving') });
      });

      // let images = await getImageURLsForBusiness(restId);
      // setImg(images[0]);
    }
    setRes();
  }, [props.restId]);

  useEffect(() => {
    async function getGroupFromDB() {
      const group = await getGroup(groupCode);
      setGroup(group);
    }
    getGroupFromDB();
  }, [groupCode]);

  if (isHost !== 'true') return (<div className='swipe recommendation--card'>Waiting for host...</div>)
  if (group['suggestions'] === undefined) return (<div>Loading...</div>)
  return (
    <div id={id} className='swipe recommendation--card'>
      <TinderCard
        ref={passRef}
        onSwipe={onSwipe}
        onCardLeftScreen={onCardLeftScreen}
        preventSwipe={['up', 'down']}>
        <h1>{restaurant.name}</h1>
        <div>Make a decision!</div>
        <div className='votes'>
          <div className='rejected'>Rejected: <span className='numRejected'>{group['suggestions'][restId].numRejected}</span></div>
          <div className='accepted'>Accepted: <span className='numAccepted'>{group['suggestions'][restId].numAccepted}</span></div>
        </div>
      </TinderCard>
    </div>
  )
}

export default withCookies(Recommendations);
