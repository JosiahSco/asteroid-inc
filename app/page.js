'use client'
import Image from 'next/image'
import styles from './styles.css'
import { useEffect, useState } from 'react'

export default function Home() {
  let [money, setMoney] = useState(0);
  let [moneyPerSecond, setMoneyPerSecond] = useState(0);
  let [rotationDegrees, setRotationDegrees] = useState(5);

  useEffect(() => {
    const savedMoney = localStorage.getItem('money');
    if (savedMoney) {
      setMoney(parseInt(savedMoney));
    }
    
    // const saveInterval = setInterval(() => {
    //   setMoney(prevMoney => prevMoney + moneyPerSecond);
    //   localStorage.setItem("money", money.toString());
    // }, 1000);

    // return () => clearInterval(saveInterval);
  }, [])

  const handleAsteroidClick = () => {
    setMoney(prevMoney => prevMoney + 1);
    localStorage.setItem('money', (money + 1).toString());
    setRotationDegrees(rotationDegrees + 5);
    document.querySelector('.mainClicker').style.transform = `rotate(${rotationDegrees}deg)`
  }

  return (
    <main className="main">
     <div className="spaceBackground"></div>
     <div className="left">
      <p>{money}</p>
      <button className="mainClicker" onClick={handleAsteroidClick}>
        <img src='/asteroid.png'></img>
      </button>
      <p>{moneyPerSecond}/s</p>
     </div>
     <div className="right">

     </div>
    </main>
  )
}
