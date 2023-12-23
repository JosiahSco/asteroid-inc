'use client'
import Image from 'next/image'
import styles from './styles.css'
import { useEffect, useState } from 'react'

export default function Home() {
  let [money, setMoney] = useState(0);
  let [moneyPerSecond, setMoneyPerSecond] = useState(0);
  let [rotationDegrees, setRotationDegrees] = useState(5);
  let [purchasedUpgrades, setPurchasedUpgrades] = useState([]);
  let [upgrades, setUpgrades] = useState([
    { id: 1, name: 'Human Miner', cost: 15, perSecond: 0.1, qty: 0},
    { id: 2, name: 'Robot Miner', cost: 100, perSecond: 1, qty: 0},
  ]);

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

  const handleAsteroidClick = () => {
    setMoney(prevMoney => prevMoney + 1);
    localStorage.setItem('money', (money + 1).toString());
    setRotationDegrees(rotationDegrees + 5);
    document.querySelector('.mainClicker').style.transform = `rotate(${rotationDegrees}deg)`
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

    setPurchasedUpgrades(prevUpgrades => [...prevUpgrades, upgrade.id]);
    localStorage.setItem('purchasedUpgrades', JSON.stringify(purchasedUpgrades));

    const updatedUpgrades = upgrades.map((u) => {
      if (u.id == upgrade.id) {
        return { ...u, cost: (u.cost * 1.5).toFixed(1), qty: u.qty + 1 }
      } else {
        return u;
      }
    });

    setUpgrades(() => {
      localStorage.setItem('upgrades', JSON.stringify(updatedUpgrades));
      return updatedUpgrades;
    });

  }

  const unlockedUpgrades = upgrades.filter(upgrade => {
    return purchasedUpgrades.includes(upgrade.id);
  });

  const nextUpgrade = upgrades.find((upgrade) => !purchasedUpgrades.includes(upgrade.id));
  if (nextUpgrade) {
    unlockedUpgrades.push(nextUpgrade);
  }

  return (
    <main className="main">
     <div className="spaceBackground"></div>
     <div className="left">
      <p>{money}</p>
      <button className="mainClicker" onClick={handleAsteroidClick}>
        <img src='/asteroid.png' draggable="false"></img>
      </button>
      <p>{moneyPerSecond}/s</p>
     </div>
     <div className="right">
     {unlockedUpgrades.map((upgrade) => (
      <UpgradeButton 
        key={upgrade.id} 
        upgrade={upgrade} 
        onClick={() => handleUpgradePurchase(upgrade)} 
      />
     ))}
     </div>
    </main>
  )
}

const UpgradeButton = ({ upgrade, onClick}) => {
  return (
    <button onClick={onClick} className='upgrade'>
      {upgrade.name} - Cost: {upgrade.cost} | {upgrade.qty}
    </button>
  )
}