'use client'
import Image from 'next/image'
import styles from './styles.css'
import * as Tone from 'tone'
import { playMusic, stopMusic } from './background-music.js'
import { achievementList } from './acheivements'
import { useEffect, useState } from 'react'

export default function Home() {

  const initialUpgradeState = [
    { id: 1, name: 'Human Miner', cost: 15, perSecond: 0.1, qty: 0, img: '/human.png', sound: '/sounds/human-sound.mp3'},
    { id: 2, name: 'Alien Miner', cost: 100, perSecond: 1, qty: 0, img: '/alien.png', sound: '/sounds/alien-sound.mp3'},
    { id: 3, name: 'Space Beast', cost: 1000, perSecond: 10, qty: 0, img: '/space-beast.png', sound: '/sounds/space-beast-sound.mp3'},
    { id: 4, name: 'Nano bot', cost: 7500, perSecond: 75, qty: 0, img: '/nanobot.png', sound: '/sounds/nano-bot-sound.mp3'},
    { id: 5, name: 'Mech Miner', cost: 25_000, perSecond: 200, qty: 0, img: '/mech-miner.png', sound: '/sounds/mech-miner-sound.mp3'},
    { id: 6, name: 'Giant Lazer', cost: 100_000, perSecond: 500, qty: 0, img: '/giant-lazer.png', sound: '/sounds/giant-lazer-sound.mp3'},
  ];

  let initState = {
    money: 0,
    clickUpgrade: {
      moneyPerClick: 1,
      cost: 10
    },
    moneyPerSecond: 0,
    purchasedUpgrades: [],
    upgrades: initialUpgradeState,
    muted: true,
    prestige: 0,
    prestigeMultiplier: 1,
    collectedAchievements: [],
    clicks: 0,
    allTimeMoney: 0,
  }

  let [gameState, setGameState] = useState(initState);
  let [rotationDegrees, setRotationDegrees] = useState(5);
  let [explosionPosition, setExplosionPosition] = useState(null);

  useEffect(() => {
    manageAcheivements(gameState);
  }, [gameState]);

  const manageAcheivements = (tempGameState) => {
    achievementList.forEach(achievement => {
      if (!gameState.collectedAchievements.includes(achievement.id) && achievement.condition(tempGameState)) {
        console.log('Achievement Unlocked: ', achievement.name);
        const achievementCard = Achievement(achievement);
        document.querySelector('.footer').appendChild(achievementCard);

        setTimeout(() => {
          document.querySelector('.footer').removeChild(achievementCard);
        }, 10_000);

        setGameState(prevState => {
          const newState = {
            ...prevState,
            collectedAchievements: [...prevState.collectedAchievements, achievement.id],
          };
          localStorage.setItem('gameState', newState);
          return newState;
        })
      }
    })
  }
  

  useEffect(() => {
    const savedGameState = localStorage.getItem('gameState');
    if (savedGameState) {
      setGameState(JSON.parse(savedGameState));
    }
  }, []);

  useEffect(() => {
    const perSecondInterval = setInterval(() => {
      setGameState(prevState => {
        const newState = {
          ...prevState,
          money: Math.round((prevState.money + prevState.moneyPerSecond) * 100) / 100,
          allTimeMoney: Math.round((prevState.allTimeMoney + prevState.moneyPerSecond) * 100) / 100
        };
        localStorage.setItem('gameState', JSON.stringify(newState));
        return newState;
      });
    }, 1000);

    return () => clearInterval(perSecondInterval);
  }, [gameState.moneyPerSecond]);

  const handleAsteroidClick = async (event) => {
    let crit = Math.random() >= 0.99;

    setGameState(prevState => {
      const newState = {
        ...prevState, 
        clicks: prevState.clicks + 1,
        money: prevState.money + prevState.clickUpgrade.moneyPerClick,
        allTimeMoney: prevState.allTimeMoney + prevState.clickUpgrade.moneyPerClick,
      };
      localStorage.setItem('gameState', JSON.stringify(newState));
      return newState;
    });

    setRotationDegrees(rotationDegrees + 5);
    document.querySelector('.mainClicker').style.transform = `rotate(${rotationDegrees}deg)`


    const x = event.clientX - 25;
    const y = event.clientY - 20.55 + window.scrollY;
    setExplosionPosition({x, y});

    // Setup Tone.js synth for sound effect 
    await Tone.start();
    let vol = new Tone.Volume(-12).toDestination();
    let synth = new Tone.Synth({
        oscillator: {
        type: 'sine',
      },
    }).connect(vol);

    if (!gameState.muted) {
      const critNotes = ["A5", "G5"];
      const noncritNotes = ["A4", "G4"];
      let noteIndex = Math.floor(Math.random() * critNotes.length);
      if (crit) {
        synth.triggerAttackRelease(critNotes[noteIndex], "16n");
      } else {
        synth.triggerAttackRelease(noncritNotes[noteIndex], "32n");
      }
    }

    if (crit) {
      critText();
      setGameState(prevState => {
        const newState = {
          ...prevState,
          money: prevState.money + prevState.clickUpgrade.moneyPerClick * 100,
          allTimeMoney: prevState.allTimeMoney + prevState.clickUpgrade.moneyPerClick * 100,
        }
        localStorage.setItem('gameState', newState);
        return newState;
      })
    }

    setTimeout(() => {
      synth.dispose();
    }, 1000)

    setTimeout(() => {
      setExplosionPosition(null);
    }, 1500);
  };

  const handleClickUpgrade = () => {
    if (gameState.money < gameState.clickUpgrade.cost) return;

    if (!gameState.muted) new Audio('/sounds/click-upgrade-sound.mp3').play();

    setGameState(prevState => {
      const newState = {
        ...prevState,
        money: prevState.money - prevState.clickUpgrade.cost,
        clickUpgrade: {moneyPerClick: prevState.clickUpgrade.moneyPerClick * 2, cost: prevState.clickUpgrade.cost * 10},
      };
      localStorage.setItem('gameState', newState);
      return newState;
    })
  };

  const handleUpgradePurchase = (upgrade) => {
    if (upgrade.cost - gameState.money > 0) return;

    if (!gameState.muted) {
      new Audio(upgrade.sound).play();
    }

    const updatedUpgrades = gameState.upgrades.map((u) => {
      if (u.id == upgrade.id) {
        return { ...u, cost: (u.cost * 1.15).toFixed(1), qty: u.qty + 1 }
      } else {
        return u;
      }
    });

    setGameState(prevState => {
      const newState = {
        ...prevState,
        money: prevState.money - upgrade.cost,
        moneyPerSecond: Math.round((prevState.moneyPerSecond + upgrade.perSecond) * 100) / 100,
        purchasedUpgrades: [...prevState.purchasedUpgrades, upgrade.id],
        upgrades: updatedUpgrades,
      }
      localStorage.setItem('gameState', newState);
      return newState;
    });
  };

  const handlePrestige = () => {
    const multiplier = Math.pow(2, gameState.allTimeMoney * 0.0000005);
    const confirmed = window.confirm(`Your prestige multiplier will be ${gameState.prestigeMultiplier * multiplier}. Confirm?`);
    if (!confirmed) return;

    const prePrestigeAchievements = gameState.collectedAchievements;
    const prestige = gameState.prestige;
    const prestigeMultiplier = gameState.prestigeMultiplier;

    let newUpgrades = initialUpgradeState.map(upgrade => {
      return {
        ...upgrade,
      perSecond: upgrade.perSecond * multiplier
      }
    });
    
    setGameState(prevState => {
      const newState = {
        ...initState,
        muted: prevState.muted,
        prestige: prestige + 1,
        prestigeMultiplier: prestigeMultiplier * multiplier,
        collectedAchievements: prePrestigeAchievements,
        upgrades: newUpgrades,
        clickUpgrade: {moneyPerClick: initState.clickUpgrade.moneyPerClick * multiplier, cost: initState.clickUpgrade.cost},
      };
      localStorage.setItem('gameState', newState);
      return newState;
    });
  }

  const handleReset = () => {
    const confirmed = window.confirm('This will revert all progress and achievements. Confirm?');
    if (!confirmed) return;
    setGameState(() => {
      localStorage.setItem('gameState', JSON.stringify(initState));
      return initState;
    })
  };

  useEffect(() => {
    const minerTypes = document.querySelectorAll('.upgrade');
    minerTypes.forEach((miner, index) => {
      if (gameState.upgrades[index].cost > gameState.money) {
        miner.style.backgroundColor = '#1e1a37';
        miner.style.cursor = 'auto';
      } else {
        miner.style.backgroundColor = 'darkslateBlue';
        miner.style.cursor = 'pointer';
      }
    });

    const clickUpgradeButton = document.querySelector('#clickUpgrade');
    if (gameState.clickUpgrade.cost > gameState.money) {
      clickUpgradeButton.style.backgroundColor = '#1e1a37';
      clickUpgradeButton.style.cursor = 'auto';
    } else {
      clickUpgradeButton.style.backgroundColor = 'darkslateBlue';
      clickUpgradeButton.style.cursor = 'pointer';
    }

  }, [gameState.money])

  const unlockedUpgrades = gameState.upgrades.filter(upgrade => {
    return gameState.purchasedUpgrades.includes(upgrade.id);
  });

  const nextUpgrade = gameState.upgrades.find((upgrade) => !gameState.purchasedUpgrades.includes(upgrade.id));
  if (nextUpgrade) {
    unlockedUpgrades.push(nextUpgrade);
  }

  useEffect(() => {
    const right = document.querySelector('.right');
    right.scrollTo({top: right.scrollHeight, behavior: 'smooth'});
  }, [unlockedUpgrades.length]);

  const toggleMute = () => {
    if (gameState.muted) {
      document.getElementById('toggleMute').classList.remove('muted');
      Tone.start();
      playMusic();
    } else {
      document.getElementById('toggleMute').classList.add('muted');
      stopMusic();
    }

    setGameState(prevState => {
      const newState = {
        ...prevState,
        muted: !prevState.muted,
      }
      return newState;
    })
  }

  return (
    <main className="main">
     <div className="spaceBackground"></div>
     <div className="left">
     <dialog id='tutorial'>
      <h3>Tutorial</h3>
      <p>To begin, click or tap the asteroid to collect credits</p>
      <p>These credits can be spent on miners. New miner types are unlocked by buying a miner of the previous type.</p>
      <p>These miners collect credits passively for you. Your passive collection rate is displayed below the asteroid.</p>
      <p>When many miner types are unlocked, you may have to scroll up and down to see them all.</p>
      <p>Happy Mining!</p>
      <button autoFocus onClick={() => document.getElementById('tutorial').close()}>Close</button>
     </dialog>
     <dialog id='stats'>
        <h3>Statistics</h3>
        <h4>General</h4>
        <hr></hr>
        <p>Best Upgrade to Buy: {bestUpgrade(unlockedUpgrades)}</p>
        <p>Total Clicks: {formatNumber(gameState.clicks)}</p>
        <p>Total Credits Collected: {formatNumber(gameState.allTimeMoney)}</p>
        <p>Prestige #: {gameState.prestige}</p>
        <p>Prestige Multiplier: {gameState.prestigeMultiplier}</p>
        <h4>Per Second: </h4>
        <hr></hr>
        {unlockedUpgrades.map((upgrade, index) => (
          <p key={index}>
            {upgrade.name}: {formatNumber(upgrade.qty * upgrade.perSecond)}
          </p>
        ))}
        <h4>Achievements ({gameState.collectedAchievements.length} / {achievementList.length})</h4>
        <hr></hr>
          {gameState.collectedAchievements.map((achievement, index)=> (
            <p key={index}>{achievementList[achievement].name}: {achievementList[achievement].description}</p>
          ))}
      <button autoFocus onClick={() => document.getElementById('stats').close()}>Close</button>
     </dialog>
     <div>
      <button id='openTutorial' onClick={() => document.getElementById('tutorial').showModal()}>?</button>
      <button id='toggleMute' onClick={toggleMute} className='muted'>♫</button>
      <button id='openStats' onClick={() => document.getElementById('stats').showModal()}>#</button>
     </div>
      <p>{formatNumber(gameState.money)}</p>
      { explosionPosition && (
        <img src='/explosion.png' 
          alt='Asteroid'
          style={{ 
            width: '50px', 
            position: 'absolute', 
            top: `${explosionPosition.y}px`, 
            left: `${explosionPosition.x}px`, 
            zIndex: '10',
            pointerEvents: 'none',
          }} 
        />
      )}
      <button className="mainClicker" onClick={handleAsteroidClick}>
        <img src='/asteroid.png' draggable="false"></img>
      </button>
      <p>{formatNumber(gameState.moneyPerSecond)}/s</p>
     </div>
     <div className="right">
      <button onClick={handleClickUpgrade} id='clickUpgrade'>
        <img src='/pickaxe.png'></img>
        <p>x2 Click Power</p>
        <p className='cost'>Cost: {formatNumber(gameState.clickUpgrade.cost)}</p>
        <p>Current Credits per Click: {formatNumber(gameState.clickUpgrade.moneyPerClick)}</p>
      </button>
      {unlockedUpgrades.map((upgrade) => (
        <UpgradeButton
          className='upgrade'
          key={upgrade.id} 
          upgrade={upgrade} 
          onClick={() => handleUpgradePurchase(upgrade)} 
        />
      ))}
      <div className='resetWrapper'>
        <button className='reset' onClick={handleReset}>Reset</button>
        <button className='prestige' onClick={handlePrestige}>Prestige</button>
      </div>
     </div>
     <div className='footer'>
     </div>
    </main>
  )
}

const UpgradeButton = ({ upgrade, onClick}) => {
  return (
    <button onClick={onClick} className='upgrade'>
      <img src={upgrade.img}></img>
      <div>{upgrade.name} </div> 
      <div className='cost'>Cost: {formatNumber(upgrade.cost)}</div> 
      <div>Qty: {upgrade.qty}</div>
    </button>
  )
}

// Virtual DOM more like shut up and let me do this without 10 state properties and 3 dependencies
const Achievement = (achievement) => {
  const achievementCard = document.createElement('div');
  achievementCard.classList.add('achievementCard');
  achievementCard.innerHTML = `
    <img src='/trophy.png' alt='trophy'></img>
    <div class='innerAchievement'>
        <h3>${achievement.name}</h3>
        <p>${achievement.description}</p>
    </div>
    `;
    // <button onclick="(${closeCard}())">x</button>
  return achievementCard;
}

function formatNumber(number) {
  if (typeof number == 'string') number = parseFloat(number);

  if (number < 1000 && number % 1 !== 0) {
    return number.toFixed(1);
  }

  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q'];
  let suffixIndex = 0;
  while (number >= 1000 && suffixIndex < suffixes.length - 1) {
    number /= 1000;
    suffixIndex++;
  }

  if (number >= 1) {
    return number.toFixed(3).replace(/\.?0+$/, '') + suffixes[suffixIndex]
  } else if (number >= 0.001) {
    return number.toFixed(3).replace(/\.?0+$/, '') + suffixes[suffixIndex]
  } else {
    return 0;
  }
}

function critText() {
  const critText = document.createElement('p');
  critText.innerHTML = "Critical Swing!";
  
  critText.style.position = 'absolute';
  critText.style.fontSize = '32px';
  critText.style.width = '50px';
  critText.style.fontFamily = 'SpaceFont';
  critText.style.zIndex ='999';
  critText.style.color = 'red';
  critText.style.pointerEvents = 'none';

  const asteroid = document.querySelector('.mainClicker');
  const targetRect = asteroid.getBoundingClientRect();
  const x = targetRect.left + targetRect.width / 2 - 50;
  const y = targetRect.top + targetRect.height / 2 - 50;

  critText.style.left = `${x}px`;
  critText.style.top = `${y}px`;

  document.body.appendChild(critText);

  setTimeout(() => {
    document.body.removeChild(critText);
  }, 500);
}

function bestUpgrade(upgrades) {
  let productionPerCredit = 0;
  let bestUpgradeName = '';
  upgrades.forEach(upgrade => {
    let temp = upgrade.perSecond / upgrade.cost;
    if (temp > productionPerCredit) {
      productionPerCredit = temp;
      bestUpgradeName = upgrade.name;
    }
  });

  return bestUpgradeName;
}