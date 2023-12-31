'use client'
import Image from 'next/image'
import styles from './styles.css'
import * as Tone from 'tone'
import { playMusic, stopMusic } from './background-music'
import { useEffect, useState } from 'react'

export default function Home() {

  const initialUpgradeState = [
    { id: 1, name: 'Human Miner', cost: 15, perSecond: 0.1, qty: 0, img: '/human.png'},
    { id: 2, name: 'Alien Miner', cost: 100, perSecond: 1, qty: 0, img: '/alien.png'},
    { id: 3, name: 'Space Beast', cost: 1000, perSecond: 10, qty: 0, img: '/space-beast.png'},
    { id: 4, name: 'Nano bot', cost: 5000, perSecond: 75, qty: 0, img: '/nanobot.png'},
    { id: 5, name: 'Mech Miner', cost: 25_000, perSecond: 200, qty: 0, img: '/mech-miner.png'},
    { id: 6, name: 'Giant Lazer', cost: 100_000, perSecond: 500, qty: 0, img: '/giant-lazer.png'},
  ];

  let [money, setMoney] = useState(0);
  let [clickUpgrade, setClickUpgrade] = useState({moneyPerClick: 1, cost: 10})
  let [moneyPerSecond, setMoneyPerSecond] = useState(0);
  let [rotationDegrees, setRotationDegrees] = useState(5);
  let [purchasedUpgrades, setPurchasedUpgrades] = useState([]);
  let [upgrades, setUpgrades] = useState(initialUpgradeState);
  let [explosionPosition, setExplosionPosition] = useState(null);
  let [muted, setMuted] = useState(true);

 

  useEffect(() => {
    const savedMoney = localStorage.getItem('money');
    if (savedMoney) {
      setMoney(parseInt(savedMoney));
      // localStorage.setItem('money', 0);
    }

    const savedMoneyPerSecond = localStorage.getItem('moneyPerSecond');
    if(savedMoneyPerSecond) {
      setMoneyPerSecond(parseFloat(savedMoneyPerSecond));
    }

    const savedClickUpgrade = localStorage.getItem('clickUpgrade');
    if(savedClickUpgrade) {
      setClickUpgrade(JSON.parse(savedClickUpgrade));
    }

    const savedUpgrades = localStorage.getItem('upgrades');
    if(savedUpgrades) {
      setUpgrades(JSON.parse(savedUpgrades));
    }

    const savedPurchasedUpgrades = localStorage.getItem('purchasedUpgrades');
    if(savedPurchasedUpgrades) {
      setPurchasedUpgrades(JSON.parse(savedPurchasedUpgrades));
    }
  
  }, []);

  useEffect(() => {
    const perSecondInterval = setInterval(() => {
      setMoney((prevMoney) =>  {
        let newMoney = Math.round((prevMoney + moneyPerSecond) * 100) / 100;
        localStorage.setItem('money', newMoney.toFixed(1));
        return newMoney;
      });
    }, 1000);

    return () => clearInterval(perSecondInterval);
  }, [moneyPerSecond]);

  const handleAsteroidClick = async (event) => {
    let crit = Math.random() >= 0.99;

    setMoney(prevMoney => prevMoney + clickUpgrade.moneyPerClick);
    localStorage.setItem('money', (money + 1).toString());
    setRotationDegrees(rotationDegrees + 5);
    document.querySelector('.mainClicker').style.transform = `rotate(${rotationDegrees}deg)`


    const x = event.clientX - 25;
    const y = event.clientY - 20.55;
    setExplosionPosition({x, y});

    // Setup Tone.js synth for sound effect 
    await Tone.start();
    let vol = new Tone.Volume(-12).toDestination();
    let synth = new Tone.Synth().connect(vol);

    if (!muted) {
      const critNotes = ["A6", "G6"];
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
      setMoney(prevMoney => prevMoney + clickUpgrade.moneyPerClick * 100);
    }

    setTimeout(() => {
      synth.dispose();
    }, 1000)

    setTimeout(() => {
      setExplosionPosition(null);
    }, 1500);
  };

  const handleClickUpgrade = () => {
    if (money < clickUpgrade.cost) return;

    setClickUpgrade(prevClickUpgrade => {
      const newClickUpgrade = {moneyPerClick: (prevClickUpgrade.moneyPerClick * 2), cost: (prevClickUpgrade.cost * 10)}
      localStorage.setItem('clickUpgrade', JSON.stringify(newClickUpgrade));
      return newClickUpgrade;
    });

    setMoney(prevMoney => {
      const newMoney = prevMoney - clickUpgrade.cost;
      localStorage.setItem('money', newMoney.toString());
      return newMoney;
    })

  }

  const handleUpgradePurchase = (upgrade) => {
    if (upgrade.cost - money > 0) return;

    setMoney(money - upgrade.cost);
    localStorage.setItem('money', money.toString());

    setMoneyPerSecond(prevPerSecond =>  {
      let newMoneyPerSecond = Math.round((prevPerSecond + upgrade.perSecond) * 100) / 100;
      localStorage.setItem('moneyPerSecond', newMoneyPerSecond.toFixed(1));
      return newMoneyPerSecond;
    });

    setPurchasedUpgrades(prevUpgrades => {
      localStorage.setItem('purchasedUpgrades', JSON.stringify([...prevUpgrades, upgrade.id]));
      return [...prevUpgrades, upgrade.id];
    });

    const updatedUpgrades = upgrades.map((u) => {
      if (u.id == upgrade.id) {
        return { ...u, cost: (u.cost * 1.15).toFixed(1), qty: u.qty + 1 }
      } else {
        return u;
      }
    });

    setUpgrades(() => {
      localStorage.setItem('upgrades', JSON.stringify(updatedUpgrades));
      return updatedUpgrades;
    });

  };

  const handleReset = () => {
    console.log('reset')
    setMoney(() => {
      localStorage.setItem('money', '0');
      return 0;
    });

    setMoneyPerSecond(() => {
      localStorage.setItem('moneyPerSecond', '0');
      return 0;
    });

    setClickUpgrade(() => {
      const init = {moneyPerClick: 1, cost: 10};
      localStorage.setItem('clickUpgrade', JSON.stringify(init));
      return init;
    })

    setUpgrades(() => {
      localStorage.setItem('upgrades', JSON.stringify(initialUpgradeState));
      return [];
    })

    setPurchasedUpgrades(() => {
      localStorage.setItem('purchasedUpgrades', '[]');
      return [];
    });
    document.location.reload();
  }

  useEffect(() => {
    const minerTypes = document.querySelectorAll('.upgrade');
    minerTypes.forEach((miner, index) => {
      if (upgrades[index].cost > money) {
        miner.style.backgroundColor = '#1e1a37';
        miner.style.cursor = 'auto';
      } else {
        miner.style.backgroundColor = 'darkslateBlue';
        miner.style.cursor = 'pointer';
      }
    });

    const clickUpgradeButton = document.querySelector('#clickUpgrade');
    if (clickUpgrade.cost > money) {
      clickUpgradeButton.style.backgroundColor = '#1e1a37';
      clickUpgradeButton.style.cursor = 'auto';
    } else {
      clickUpgradeButton.style.backgroundColor = 'darkslateBlue';
      clickUpgradeButton.style.cursor = 'pointer';
    }

  }, [money])

  const unlockedUpgrades = upgrades.filter(upgrade => {
    return purchasedUpgrades.includes(upgrade.id);
  });

  const nextUpgrade = upgrades.find((upgrade) => !purchasedUpgrades.includes(upgrade.id));
  if (nextUpgrade) {
    unlockedUpgrades.push(nextUpgrade);
  }

  useEffect(() => {
    const right = document.querySelector('.right');
    right.scrollTo({top: right.scrollHeight, behavior: 'smooth'});
  }, [unlockedUpgrades.length]);

  const toggleMute = () => {
    document.getElementById('toggleMute').classList.toggle('muted');
    if (muted) {
      Tone.start();
      playMusic();
      setMuted(false);
    } else {
      stopMusic();
      setMuted(true);
    }
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
     <div>
      <button id='openTutorial' onClick={() => document.getElementById('tutorial').showModal()}>?</button>
      <button id='toggleMute' onClick={toggleMute} className='muted'>♫</button>
     </div>
      <p>{formatNumber(money)}</p>
      { explosionPosition && (
        <img src='/explosion.png' 
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
      <p>{formatNumber(moneyPerSecond)}/s</p>
     </div>
     <div className="right">
      <button onClick={handleClickUpgrade} id='clickUpgrade'>
        <img src='/pickaxe.png'></img>
        <p>x2 Click Power</p>
        <p className='cost'>Cost: {formatNumber(clickUpgrade.cost)}</p>
        <p>Current Credits per Click: {clickUpgrade.moneyPerClick}</p>
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

function formatNumber(number) {
  if (typeof number == 'string') number = parseFloat(number);

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