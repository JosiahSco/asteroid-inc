'use client'
import Image from 'next/image'
import styles from './styles.css'
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
  let [moneyPerSecond, setMoneyPerSecond] = useState(0);
  let [rotationDegrees, setRotationDegrees] = useState(5);
  let [purchasedUpgrades, setPurchasedUpgrades] = useState([]);
  let [upgrades, setUpgrades] = useState(initialUpgradeState);
  let [explosionPosition, setExplosionPosition] = useState(null);

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

  const handleAsteroidClick = (event) => {
    setMoney(prevMoney => prevMoney + 1);
    localStorage.setItem('money', (money + 1).toString());
    setRotationDegrees(rotationDegrees + 5);
    document.querySelector('.mainClicker').style.transform = `rotate(${rotationDegrees}deg)`

    const x = event.clientX - 25;
    const y = event.clientY - 20.55;
    setExplosionPosition({x, y});

    setTimeout(() => {
      setExplosionPosition(null);
    }, 1500);
  };

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

  return (
    <main className="main">
     <div className="spaceBackground"></div>
     <div className="left">
     <dialog id='tutorial'>
      <h3>Tutorial</h3>
      <p>To begin, click or tap the asteroid to collect credits</p>
      <p>These credits can be spent on miners. New miner types are unlocked by buying a miner of the previous type.</p>
      <p>These miners collect credits passively for you. Your passive collection rate is displayed below the asteroid.</p>
      <p>Happy Mining!</p>
      <button autoFocus onClick={() => document.getElementById('tutorial').close()}>Close</button>
     </dialog>
     <button id='openTutorial' onClick={() => document.getElementById('tutorial').showModal()}>?</button>
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
      {unlockedUpgrades.map((upgrade) => (
        <UpgradeButton
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