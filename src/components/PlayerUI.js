import React, { PropTypes } from 'react'

const PlayerUI = ({ testDeal, reset, showCard, hitItPlayer }) => {

  const handleDeal = () => {
    testDeal()
  }

  const handleReset = () => {
    reset()
  }

  const handleShowCard = () => {
    showCard()
  }

  return (
    <div className="player-ui">
      <button onClick={ handleDeal } >Deal</button>
      <button onClick={ handleReset } >RESET</button>
      <button onClick={ handleShowCard } >show dealer</button>
      <button onClick={ hitItPlayer } >Hit</button>
    </div>
  )
}

PlayerUI.propTypes = {
  testDeal: PropTypes.func,
  reset: PropTypes.func,
  showCard: PropTypes.func,
  hitItPlayer: PropTypes.func
}

export default PlayerUI
