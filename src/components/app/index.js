import React, { Component } from 'react'
import GameTable from '../GameTable'
import PlayerUI from '../PlayerUI'
import { CardGenerator, PlayerSetup, PlayerFunctions } from '../compartments/index'



// import PlayerFunctions

export default class App extends Component {

  constructor( props ) {
    super( props )
    this.p1ofN = 0.14
    this.p2ofN = 0.74

    this.state = {
      ai_1: {},
      ai_2: {},
      dealer: {},
      deck: [],
      number_of_decks: 2,
      player: {},
      round: 0,
      turn: 0
    }
    this.dealAce = PlayerFunctions.dealAce.bind( this )
    this.handValue = PlayerFunctions.handValue.bind( this )
    this.doHit = this.doHit.bind( this )
    this.makeBet = this.makeBet.bind( this )
    this.newRound = this.newRound.bind( this )
    this.playerBet = PlayerFunctions.playerBet.bind( this )
    this.setupGame = this.setupGame.bind( this )
    this.showDealerCard = PlayerFunctions.showDealerCard.bind( this )
    this.testDeal = this.testDeal.bind( this )
  }

  componentDidMount() {
    this.setupGame()
  }
//-------------------------------------

  aiTurn( whichAiPlayer ) {
    choiceHit = makeChoice('hit')
    choiceHold = makeChoice('hold')

    if( choiceHit === 'hit' || choiceHold === 'hit' ) hitItPlayer( whichAiPlayer )
    else if( choiceHit === 'hold' || choiceHold === 'hold' ) holdButton( whichAiPlayer )
    else throw new Error("Message CM27:The subscriber you are trying to reach is unavailable or outside the calling area.")
  }

  doHit( whichPlayer ) {

    let { ai_1, ai_2, dealer, player, deck } = this.state

    if( whichPlayer === 'player') {
     localStorage.setItem('hit', JSON.stringify( this.getLocalStorage('hit') ))
    }

    const temp = {
    "player": player,
    "dealer": dealer,
    "ai_1": ai_1,
    "ai_2": ai_2
    }
    let hand = temp[ whichPlayer ].hand
    if ( hand.bet <= 0 ){ return alert( "You must first place a bet." ) }
    if ( PlayerFunctions.handValue( hand ) >= 21 ){ return }
    let result = PlayerFunctions.hitItPlayer({ deck, hand })
    temp[ whichPlayer ].hand = result.hand

    this.setState({ ai_1, ai_2, dealer, player, deck: result.deck })
  }

  doRound() {
    // let { turn } = this.state
    if( this.state.turn < 1 ){ this.testDeal() }

    else if( this.state.turn == 1 ) {
      this.placeBet()
    }

  }

  gameLoop( playerTurn, t ) {
    let turn = t
    if( playerTurn !== 'player' ) {
      do {
        if( handValue( playerTurn.value <= 17 ) ) hitItPlayer(playerTurn)
        else t++
      } while ( turn === t )
    } else {
      // Wait for player to click a button
    }
    return turn
  }

  getLocalStorage(type) {
    let { ai_1, ai_2, dealer, player, deck } = this.state

    let holdStats = {
      currentlyGathering: true,
      playerHand: player.hand,
      playerValue: this.handValue( player.hand ),
      dealerHand: dealer.hand,
      dealerValue: this.handValue( dealer.hand ),
      hitOrStay: type,
      winOrLose: 'pending'
    }
    let stats = JSON.parse(localStorage.getItem(type) || '[]')
    stats.push( holdStats )
    return stats
  }

  holdButton( whichPlayer ) {
    let { ai_1, ai_2, dealer, player, deck } = this.state

    // START AI Capture K for k-n-n
    if( whichPlayer === 'player') {
      localStorage.setItem('hold', JSON.stringify( this.getLocalStorage('hold') ))
    }
    // END AI
  }

  getLocalStorage(type) {
    let { ai_1, ai_2, dealer, player, deck } = this.state

    let holdStats = {
      currentlyGathering: true,
      playerHand: player.hand,
      playerValue: this.handValue( player.hand ),
      dealerHand: dealer.hand,
      dealerValue: this.handValue( dealer.hand ),
      hitOrStay: type,
      winOrLose: 'pending'
    }
    let stats = JSON.parse(localStorage.getItem(type) || '[]')
    stats.push( holdStats )
    return stats
  }

  makeBet() {
    let { player } = this.state
    let updatedPlayer = PlayerFunctions.playerBet( player )
    this.setState({ updatedPlayer })

  }

  makeChoice(type) {
    // Seek similar hands to what player had
    let stats = JSON.parse(localStorage.getItem(type) || '[]')
    let predictAction = stats.find( (ele) => {
      if(ele.playerValue >= this.p1ofN*currPlayerValue && ele.playerValue < this.p2ofN*currPlayerValue) return ele.hitOrStay
    })

    // If unable to find similar circumstance, then guess
    // random and adjust weights
    if( predictAction === undefined) {
      do {
        this.p1ofN = Math.random()
        this.p2ofN = Math.random()
      } while (this.p1ofN > this.p2ofN)
      // Store random value into database to check against later
      predictAction = Math.random() > 0.5 ? 'hit' : 'stay'
    }
    return predictAction
  }

  newRound() {
    let { ai_1, ai_2, dealer, player, turn, round } = this.state

    player.bank += player.hand.bet * 2

    ai_1.hand = []
    ai_1.hand.value = 0
    ai_1.hand.bet = 0

    ai_2.hand = []
    ai_2.hand.value = 0
    ai_2.hand.bet = 0

    dealer.hand = []
    dealer.hand.value = 0
    dealer.hand.bet = 0

    player.hand = []
    player.hand.value = 0
    player.hand.bet = 0
    turn = 0
    round++
    this.setState({ ai_1, ai_2, dealer, player, turn, round })
  }

  playerStay() {
    let { turn } = this.state
    turn++
    this.setState({ turn })
  }

  setupGame() {

    let decks = (this.state.number_of_decks < 2 ) ? 2 : this.state.number_of_decks

    const deck = CardGenerator.createCards( decks )
    const { dealer, ai_1, ai_2, player, round } = PlayerSetup.createPlayers()

    this.setState({ ai_1, ai_2, dealer, deck, player, round })
  }

  startGame() {
    this.placeBet()

  }

  testDeal() {
    let { ai_1, ai_2, dealer, deck, player, turn } = this.state

    if ( player.hand.bet <= 0 ){ return alert( "You must first place a bet." ) }

    if ( turn < 1 ) {
      for ( let cycle = 0; cycle<2; cycle++ ) {
        ai_1.hand.push( deck.shift() )
        player.hand.push( deck.shift() )
        ai_2.hand.push( deck.shift() )
        dealer.hand.push( deck.shift() )
        if (cycle === 0) { dealer.hand[0].faceDown = true}
      }
      turn = 1
    } else {
      return
    }
    console.log(deck.length)
    ai_1.hand.value = this.handValue( ai_1.hand )
    ai_2.hand.value = this.handValue( ai_2.hand )
    player.hand.value = this.handValue( player.hand )
    dealer.hand.value = this.handValue( dealer.hand )
    this.setState({ ai_1, ai_2, dealer, deck, player, turn })
  }

  render() {

    const { ai_1, ai_2, dealer, deck, player, round } = this.state

    return (
        <div className="app">
          <GameTable ai_1={ai_1} ai_2={ai_2} dealer={dealer} deck={deck} player={player} round={round} />
          <PlayerUI
            dealAce={ this.dealAce }
            testDeal={ this.testDeal }
            reset={ this.newRound }
            showCard={ this.showDealerCard }
            doHit={ this.doHit }
            placeBet={ this.makeBet }
            playerBank={ player.bank}
            playerHandValue={ player.hand.value }
          />
        </div>
      )
  }
}
